const PRIMARY_PROVIDER = (import.meta.env.VITE_PRIMARY_CARD_PROVIDER || 'tcgdex').toLowerCase();
const ENABLE_FALLBACK = (import.meta.env.VITE_ENABLE_FALLBACK_PROVIDER || 'true') === 'true';
const POKEMON_TCG_API_KEY = import.meta.env.VITE_POKEMON_TCG_API_KEY;
const MAX_SUMMARY_RESULTS = Number(import.meta.env.VITE_CARD_PROVIDER_SUMMARY_LIMIT || 60);

const providerOrder = PRIMARY_PROVIDER === 'pokemontcg'
  ? ['pokemontcg', 'tcgdex']
  : ['tcgdex', 'pokemontcg'];

const tcgdexSetReleaseDateCache = new Map();

function stripWildcards(value = '') {
  return String(value).replace(/^\*+|\*+$/g, '').trim();
}

function getSupertypeFromCategory(category = '') {
  if (!category) return 'Unknown';
  if (category.toLowerCase() === 'pokemon') return 'Pokémon';
  return category;
}

function normalizeTcgdexCard(card) {
  const imageBase = card.image || '';
  const image = imageBase ? `${imageBase}/high.webp` : '';

  return {
    id: card.id,
    name: card.name,
    supertype: getSupertypeFromCategory(card.category),
    number: card.localId || '',
    set: {
      id: card.set?.id || '',
      name: card.set?.name || '',
      ptcgoCode: '',
      releaseDate: card.set?.releaseDate || ''
    },
    images: {
      small: image,
      large: image
    },
    image,
    rarity: card.rarity,
    attacks: card.attacks,
    weaknesses: card.weaknesses,
    retreatCost: card.retreat,
    legal: card.legal,
    _provider: 'tcgdex'
  };
}

function normalizePokemonTcgCard(card) {
  return {
    ...card,
    image: card.images?.large || card.images?.small || '' ,
    _provider: 'pokemontcg'
  };
}

function applyLocalFilter(cards, filterParams = {}) {
  const nameFilter = stripWildcards(filterParams.name || '').toLowerCase();
  const setNameFilter = stripWildcards(filterParams['set.name'] || '').toLowerCase();
  const setIdFilter = stripWildcards(filterParams['set.id'] || '').toLowerCase();
  const setCodeFilter = stripWildcards(filterParams['set.ptcgoCode'] || '').toLowerCase();
  const numberFilter = stripWildcards(filterParams.number || '').toLowerCase();

  return cards.filter((card) => {
    if (nameFilter && !card.name?.toLowerCase().includes(nameFilter)) return false;
    if (setNameFilter && !card.set?.name?.toLowerCase().includes(setNameFilter)) return false;
    if (setIdFilter && !card.set?.id?.toLowerCase().includes(setIdFilter)) return false;
    if (setCodeFilter && !card.set?.ptcgoCode?.toLowerCase().includes(setCodeFilter)) return false;
    if (numberFilter && !String(card.number || '').toLowerCase().includes(numberFilter)) return false;
    return true;
  });
}

function dedupeCards(cards = []) {
  const seen = new Set();
  const results = [];

  for (const card of cards) {
    if (!card?.id || seen.has(card.id)) continue;
    seen.add(card.id);
    results.push(card);
  }

  return results;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return response.json();
}

async function hydrateTcgdexSetReleaseDates(cards = []) {
  const uniqueSetIds = [...new Set(cards.map((card) => card?.set?.id).filter(Boolean))];

  const missingSetIds = uniqueSetIds.filter((setId) => !tcgdexSetReleaseDateCache.has(setId));

  await Promise.all(
    missingSetIds.map(async (setId) => {
      try {
        const setData = await fetchJson(`https://api.tcgdex.net/v2/en/sets/${setId}`);
        tcgdexSetReleaseDateCache.set(setId, setData?.releaseDate || '');
      } catch {
        tcgdexSetReleaseDateCache.set(setId, '');
      }
    })
  );

  return cards.map((card) => ({
    ...card,
    set: {
      ...card.set,
      releaseDate: card?.set?.releaseDate || tcgdexSetReleaseDateCache.get(card?.set?.id) || ''
    }
  }));
}

async function queryTcgdex(filterParams) {
  const name = stripWildcards(filterParams.name || '');
  const url = new URL('https://api.tcgdex.net/v2/en/cards');

  if (name) {
    url.searchParams.set('name', name);
  }

  const summaries = await fetchJson(url.toString());
  let candidates = Array.isArray(summaries) ? summaries : [];

  if (filterParams.cardType === 'pocket') {
    candidates = candidates.filter(s => s.image?.includes('/tcgp/'));
  } else if (filterParams.cardType === 'tcg') {
    candidates = candidates.filter(s => !s.image?.includes('/tcgp/'));
  }

  candidates = candidates.slice(0, MAX_SUMMARY_RESULTS);

  const detailedCards = await Promise.all(
    candidates.map(async (summary) => {
      try {
        const detail = await fetchJson(`https://api.tcgdex.net/v2/en/cards/${summary.id}`);
        return normalizeTcgdexCard(detail);
      } catch {
        return null;
      }
    })
  );

  const hydratedCards = await hydrateTcgdexSetReleaseDates(detailedCards.filter(Boolean));

  return applyLocalFilter(hydratedCards, filterParams);
}

const NON_API_PARAMS = new Set(['cardType']);

function buildPokemonTcgQueryString(filterParams) {
  const queryParams = [];

  for (const filter in filterParams) {
    if (NON_API_PARAMS.has(filter)) continue;
    let value = filterParams[filter];
    if (value === undefined || value === null || value === '') continue;

    if (/\s|[^a-zA-Z0-9*.-]/.test(value) || filter === 'set.name') {
      value = `"${value}"`;
    }

    queryParams.push(`${filter}:${value}`);
  }

  return queryParams.join(' ');
}

async function queryPokemonTcgRest(filterParams) {
  const query = buildPokemonTcgQueryString(filterParams);
  const url = new URL('https://api.pokemontcg.io/v2/cards');
  if (query) {
    url.searchParams.set('q', query);
  }
  url.searchParams.set('orderBy', '-set.releaseDate');
  url.searchParams.set('pageSize', String(MAX_SUMMARY_RESULTS));

  const headers = {};
  if (POKEMON_TCG_API_KEY) {
    headers['X-Api-Key'] = POKEMON_TCG_API_KEY;
  }

  const data = await fetchJson(url.toString(), { headers });
  const cards = Array.isArray(data?.data) ? data.data : [];
  return cards.map(normalizePokemonTcgCard);
}

async function queryProvider(provider, filterParams) {
  if (provider === 'tcgdex') {
    return queryTcgdex(filterParams);
  }

  if (provider === 'pokemontcg') {
    return queryPokemonTcgRest(filterParams);
  }

  return [];
}

class TCGController {
  static async query(filterParams) {
    const [primary, secondary] = providerOrder;

    try {
      const primaryResults = await queryProvider(primary, filterParams);

      if (!ENABLE_FALLBACK || !secondary) {
        return primaryResults;
      }

      const needsFallback = (primaryResults.length === 0 || Boolean(filterParams['set.ptcgoCode']))
        && filterParams.cardType !== 'pocket';
      if (!needsFallback) {
        return primaryResults;
      }

      try {
        const secondaryResults = await queryProvider(secondary, filterParams);
        return dedupeCards([...primaryResults, ...secondaryResults]);
      } catch {
        return primaryResults;
      }
    } catch (primaryError) {
      if (!ENABLE_FALLBACK || !secondary) {
        console.error('Card query failed:', primaryError);
        throw primaryError;
      }

      const fallbackResults = await queryProvider(secondary, filterParams);
      return dedupeCards(fallbackResults);
    }
  }
}

export default TCGController;
