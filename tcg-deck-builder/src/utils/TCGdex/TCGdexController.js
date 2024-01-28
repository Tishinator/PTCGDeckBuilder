const base_url = 'https://api.tcgdex.net/v2/en/cards';

const validFilters = ['category', 'id', 'illustrator', 'image', 'localId', 'name', 
                    'rarity', 'set', 'variants', 'hp', 'types', 'evolveFrom', 
                    'description', 'stage', 'attacks', 'weaknesses',
                     'retreat', 'regulationMark', 'legal'];

class TCGdexController {
    static async query(filterParams) {
        let queryStr = base_url;
        let queryParams = [];

        for (let filter in filterParams) {
            if (validFilters.includes(filter)) {
                queryParams.push((filter) + '=' + filterParams[filter]);
            }
        }

        if (queryParams.length > 0) {
            queryStr += '?' + queryParams.join('&');
        }
        console.log("QUERY STRING:", queryStr);
        try {
            const response = await fetch(queryStr);
            console.log("RESULTS: ", response)
            if (!response.ok) {
                throw new Error('There was a problem querying the data.');
            }
            let data = await response.json();
            
            // only keep values with an image
            data = data.filter(card => "image" in card);
            return data;
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

export default TCGdexController;
