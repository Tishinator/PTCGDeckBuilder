class QueryParameterBuilder {

    static getEnergyQuery(energyStr) {
        const energyTypes = {
            "{G}": "Grass",
            "{R}": "Fire",
            "{W}": "Water",
            "{L}": "Lightning",
            "{P}": "Psychic",
            "{F}": "Fighting",
            "{D}": "Darkness",
            "{M}": "Metal",
        };

        //ptcglive conversion for GG/TG cards (don't apply to promo sets)
        energyStr = energyStr.replace(/(?!PR-)(\w{2,3})-(\w{2,3}) (\d+)/g, '$1 $2$3');

        //special case for double crisis set
        energyStr = energyStr.replace(/xy5-5 /g, 'DCR ');

        // example : 1 Basic {D} Energy SVE 7
        //          15 Basic {L} Energy EVO 94 PH
        let energyObj = energyStr.split(" ");
        let cardIdIndex = energyObj.length - 1;
        let cardSetIndex = energyObj.length - 2;
        let cardNumber = energyObj[cardIdIndex].trim();

        if (cardNumber === "PH") { // Reverse holo
            cardIdIndex = energyObj.length - 2;
            cardSetIndex = energyObj.length - 3;
            cardNumber = energyObj[cardIdIndex].trim();
        }

        let energySet = energyObj[cardSetIndex];
        let energyName = energyObj.splice(1, cardSetIndex - 1).join(" ");

        // Some sets dont have "basic" in their name
        energyName = energyName.replace("Basic ", "*");
        // Some energies are weird....
        energyName = energyName.replace("WLFM", "*");

        energyName = energyName.replace(/\{[A-Z]\}/g, match => energyTypes[match] || match);

        // Special case: standalone energy set with no set code
        if (energyObj[energyObj.length - 2] === "Energy") {
            return {
                "name": energyName,
                "set.name": "Scarlet & Violet Energies",
            };
        }

        return {
            "name": energyName,
            "set.ptcgoCode": energySet,
        };
    }

    static getQuery(pokemonStr) {
        //ptcglive conversion for GG/TG cards (don't apply to promo sets)
        pokemonStr = pokemonStr.replace(/(?!PR-)(\w{2,3})-(\w{2,3}) (\d+)/g, '$1 $2$3');

        //special case for double crisis set
        pokemonStr = pokemonStr.replace(/xy5-5 /g, 'DCR ');

        let cardVal = pokemonStr.split(" ");

        let cardIdIndex = cardVal.length - 1;
        let cardSetIndex = cardVal.length - 2;
        let cardId = cardVal[cardIdIndex].trim();

        if (cardId === "PH") { // Reverse holo
            cardIdIndex = cardVal.length - 2;
            cardSetIndex = cardVal.length - 3;
            cardId = cardVal[cardIdIndex].trim();
        }

        let cardSet = cardVal[cardSetIndex];
        let cardName = cardVal.splice(1, cardSetIndex - 1).join(" ");

        return {
            "name": cardName,
            "set.ptcgoCode": cardSet,
            "number": `*${cardId}`,
        };
    }
}

export default QueryParameterBuilder;
