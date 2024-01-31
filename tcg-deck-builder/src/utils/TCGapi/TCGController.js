import pokemon from 'pokemontcgsdk';
pokemon.configure({apiKey: process.env.POKEMON_TCG_API_KEY});

class TCGController {
    static async query(filterParams) {
        let queryParams = [];

        for (let filter in filterParams) {
            let value = filterParams[filter];
            // Encapsulate the value in quotes if it contains spaces or special characters
            if (/\s|[^a-zA-Z0-9]/.test(value) || filter == "set.name") {
                value = `"${value}"`;
            }
            queryParams.push(`${filter}:${value}`);
        }

        let queryString = queryParams.join(" ");
        // console.log(`Query String: ${queryString}`);

        try {
            // Filter cards via query parameters
            const cards = await pokemon.card.all({ q: queryString, orderBy:'-set.releaseDate'});
            // console.log(cards);
            return cards;
        } catch (error) {
            console.error("Error:", error);
            throw error; // Re-throw the error to be caught by the caller
        }
    }
};

export default TCGController;
