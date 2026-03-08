import TCGController from '../TCGapi/TCGController';
import CardJSONValidator from '../CardJsonValidator';
import QueryParameterBuilder from './QueryParameterBuilder';

const validator = new CardJSONValidator();

const cardTypes = ["Pokémon:", "Trainer:", "Energy:"];
const cardTypes2 = ["Pokémon", "Trainer", "Energy"];
const totalCards = "Total Cards:";

class TCGLiveController {
    static async importDeck(deckList) {
        const rows = deckList.split('\n');
        let cardType = "";
        const cardQueries = []; // { count, queryParams }

        // Phase 1: Parse all rows
        for (let row of rows) {
            let currentRow = row.trim();

            if (currentRow === '' || currentRow === '\r' || currentRow.includes(totalCards)) {
                continue;
            }

            if (cardTypes.some(str => currentRow.includes(str))) {
                cardType = currentRow.split(":")[0];
                continue;
            }

            if (cardTypes2.some(str => currentRow.includes(str))) {
                let rowsplit = currentRow.split(" ");
                if (!(rowsplit.length > 2)) {
                    cardType = rowsplit[0];
                    continue;
                }
            }

            let isEnergy;
            if (cardType === "") {
                isEnergy = currentRow.toLowerCase().includes("energy");
            } else {
                isEnergy = cardType === "Energy";
            }

            let queryParams;
            if (isEnergy) {
                queryParams = QueryParameterBuilder.getEnergyQuery(currentRow);
            } else {
                queryParams = QueryParameterBuilder.getQuery(currentRow);
            }

            if (!queryParams.name) {
                continue;
            }

            const count = Number(currentRow.split(' ')[0]);

            // console.log('[Import Parse]', {
            //     currentRow,
            //     cardType,
            //     isEnergy,
            //     queryParams,
            //     count,
            // });

            cardQueries.push({ count, queryParams, isEnergy });
        }

        // Phase 2: Fetch cards in batches to avoid overwhelming the API
        const BATCH_SIZE = 8;
        const results = [];

        for (let i = 0; i < cardQueries.length; i += BATCH_SIZE) {
            const batch = cardQueries.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.all(
                batch.map(({ count, queryParams, isEnergy }) =>
                    TCGController.query(queryParams)
                        .then(async cards => {
                           if (isEnergy) {
                            const ptcgoCode = queryParams['set.ptcgoCode'];

                            const hasMatchingPtcgoCode =
                                !!ptcgoCode &&
                                cards.some(card =>
                                    card.set?.ptcgoCode?.toLowerCase() === ptcgoCode.toLowerCase()
                                );

                            const shouldFallbackToLatestByName =
                                cards.length === 0 ||
                                (ptcgoCode && !hasMatchingPtcgoCode);

                            // console.log('[Energy Fallback Check]', {
                            //     name: queryParams.name,
                            //     ptcgoCode,
                            //     cardsLength: cards.length,
                            //     returnedCodes: cards.map(card => card.set?.ptcgoCode).filter(Boolean),
                            //     hasMatchingPtcgoCode,
                            //     shouldFallbackToLatestByName,
                            // });

                            if (shouldFallbackToLatestByName) {
                                const fallbackCards = await TCGController
                                    .queryLatestByName(queryParams.name)
                                    .catch(err => {
                                        console.log('[Energy] queryLatestByName failed', err);
                                        return [];
                                    });

                                // console.log('[Energy] queryLatestByName result]', {
                                //     name: queryParams.name,
                                //     count: fallbackCards.length,
                                //     cards: fallbackCards.map(card => ({
                                //         name: card.name,
                                //         provider: card._provider,
                                //         number: card.number,
                                //         setName: card.set?.name,
                                //         setId: card.set?.id,
                                //         setPtcgoCode: card.set?.ptcgoCode,
                                //         releaseDate: card.set?.releaseDate,
                                //     })),
                                // });

                                if (fallbackCards.length > 0) {
                                    cards = fallbackCards;
                                }
                            }
                        }

                            return { count, queryParams, cards, isEnergy };
                        })
                        .catch(err => {
                            console.log('[Query Error]', {
                                queryParams,
                                isEnergy,
                                error: err,
                            });
                            return { count, queryParams, cards: [], isEnergy };
                        })
                )
            );

            results.push(...batchResults);
        }

        // Phase 3: Build decklist from results
        let newDecklist = [];
        let couldNotFind = [];

        for (let { count, queryParams, cards, isEnergy } of results) {
            // console.log('[Build Decklist]', {
            //     name: queryParams.name,
            //     requestedPtcgoCode: queryParams['set.ptcgoCode'],
            //     isEnergy,
            //     returnedCount: cards.length,
            //     candidates: cards.map((c, index) => ({
            //         index,
            //         name: c.name,
            //         provider: c._provider,
            //         number: c.number,
            //         setName: c.set?.name,
            //         setId: c.set?.id,
            //         setPtcgoCode: c.set?.ptcgoCode,
            //         supertype: c.supertype,
            //         hasImages: !!c.images,
            //         largeImage: c.images?.large,
            //     })),
            // });

            if (!cards[0]) {
                couldNotFind.push(`${queryParams.name} : ${queryParams['set.ptcgoCode']}`);
                continue;
            }

            const selectedCard = cards[0];

            // console.log('[Selected Card]', {
            //     requestedName: queryParams.name,
            //     requestedPtcgoCode: queryParams['set.ptcgoCode'],
            //     selected: selectedCard ? {
            //         name: selectedCard.name,
            //         provider: selectedCard._provider,
            //         number: selectedCard.number,
            //         setName: selectedCard.set?.name,
            //         setId: selectedCard.set?.id,
            //         setPtcgoCode: selectedCard.set?.ptcgoCode,
            //         images: selectedCard.images,
            //     } : null,
            // });

            let card = {
                image: selectedCard?.images?.large,
                ...selectedCard
            };

            if (!newDecklist[card.name]) {
                newDecklist[card.name] = { cards: [], totalCount: 0 };
            }

            let cardFound = false;
            for (let cardEntry of newDecklist[card.name].cards) {
                // console.log('[Compare Existing Card]', {
                //     name: card.name,
                //     againstExisting: cardEntry.data?.name,
                //     newCardProvider: card._provider,
                //     existingCardProvider: cardEntry.data?._provider,
                //     newCardSet: card.set,
                //     existingCardSet: cardEntry.data?.set,
                // });

                if (validator.areCardsEqual(cardEntry.data, card)) {
                    cardEntry.count += count;
                    cardFound = true;
                    break;
                }
            }

            if (!cardFound) {
                newDecklist[card.name].cards.push({ data: card, count });
            }

            newDecklist[card.name].totalCount += count;
        }

        if (couldNotFind.length > 0) {
            alert(
                `Could not find the following cards:\n\n${couldNotFind.join('\n')}\n\nPlease report these on the Github repository under Issues.`
            );
        }

        return newDecklist;
    }
}

export default TCGLiveController;