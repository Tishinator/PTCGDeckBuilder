import NewSetList from '../../data/SetLookup.json';

const RECENT_SET_LIST = NewSetList.map(set => set.ptcgoCode);

class QueryParameterBuilder{

    static getEnergyQuery(energyStr){
        const energyTypes = {
            "{P}" : "Psychic",
        }
        
        // example : 1 Basic {D} Energy SVE 7
        let energyObj = energyStr.split(" ");

        let energySet = energyObj[energyObj.length-2];
        let energy;
        if(RECENT_SET_LIST.includes(energySet)){

            let nSetName, nSetId
            for(let set of NewSetList){
                if (set.ptcgoCode == energySet){
                    nSetName = set.name;
                    nSetId = set.id;
                    break;
                }
            }

            energy = {
                // "count": Number(energyObj[0]),
                "name" : energyObj.splice(1, (energyObj.length - 3)).join(" ").replace(/\{[A-Z]\}/g, match => energyTypes[match] || match),
                "number": energyObj[energyObj.length-1].trim(),
                "set.name": nSetName,
                "set.id": nSetId
            }
        }else{
            if(energyObj[energyObj.length-2] == "Energy"){
                energy = {
                    // "count": Number(energyObj[0]),
                    "name" : energyObj.splice(1, (energyObj.length - 3)).join(" ").replace(/\{[A-Z]\}/g, match => energyTypes[match] || match),
                } 
            }else{
                energy = {
                    // "count": Number(energyObj[0]),
                    "name" : energyObj.splice(1, (energyObj.length - 3)).join(" ").replace(/\{[A-Z]\}/g, match => energyTypes[match] || match),
                    "number": energyObj[energyObj.length-1].trim(),
                    "set": energyObj[energyObj.length-2],
                }
            }

        }

        // console.log(energy)
        return energy;
    }

    static getQuery(pokemonStr, cardType){

        let cardVal = pokemonStr.split(" ");
        
        let cardIdIndex = cardVal.length - 1;
        let cardSetIndex = cardVal.length - 2;
        let cardId = cardVal[cardIdIndex].trim();

        if(cardId == "PH") { // Reverse holo ?
            cardIdIndex = cardVal.length - 2;
            cardSetIndex = cardVal.length -3;
            cardId = cardVal[cardIdIndex].trim();
        }

        let cardSet = cardVal[cardSetIndex];
        let cardCount = Number(cardVal[0]);
        let cardName = cardVal.splice(1, cardSetIndex-1).join(" ");
        // console.log(`${pokemonStr}`);

        let queryJSON;
        if(RECENT_SET_LIST.includes(cardSet)){
            let nSetName, nSetId

            for(let set of NewSetList){
                if (set.ptcgoCode == cardSet){
                    nSetName = set.name;
                    nSetId = set.id;
                    break;
                }
            }
            
            queryJSON = {
                "name": cardName,
                "supertype": cardType,
                "set.name": `${nSetName}`,
                "set.id": nSetId,
                "number": cardId
            }
        }else{
            queryJSON = {
                "name": cardName,
                "supertype": cardType,
                "set.ptcgoCode": cardSet,
                "number": cardId
            }
        }


        return queryJSON;
    }

}

export default QueryParameterBuilder;