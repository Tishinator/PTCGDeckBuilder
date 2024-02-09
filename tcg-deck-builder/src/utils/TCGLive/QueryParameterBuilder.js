import NewSetList from '../../data/SetLookup.json';
import PromoGallerySetList from '../../data/PromoGallerySetLookup.json';


const RECENT_SET_LIST = NewSetList.map(set => set.ptcgoCode);
const PROMO_GALLERY_SET_LIST = PromoGallerySetList.map(set => set.ptcgoCode);

class QueryParameterBuilder{

    static getEnergyQuery(energyStr){
        const energyTypes = {
            "{G}": "Grass",
            "{R}": "Fire",
            "{W}": "Water",
            "{L}": "Lightning",
            "{P}": "Psychic",
            "{F}": "Fighting",
            "{D}": "Darkness",
            "{M}": "Metal",
        }
        
        // example : 1 Basic {D} Energy SVE 7
        //          15 Basic {L} Energy EVO 94 PH
        let energyObj = energyStr.split(" ");
        let cardIdIndex = energyObj.length - 1;
        let cardSetIndex = energyObj.length - 2;
        let cardNumber = energyObj[cardIdIndex].trim();
        
        if(cardNumber === "PH") { // Reverse holo ?
            cardIdIndex = energyObj.length - 2;
            cardSetIndex = energyObj.length -3;
            cardNumber = energyObj[cardIdIndex].trim();
        }
        
        let energySet = energyObj[cardSetIndex];
        let energyName = energyObj.splice(1, cardSetIndex-1).join(" ")

        // Some sets dont have "basic" in their name
        energyName = energyName.replace("Basic ", "*");
        // Some energies are weird....
        energyName = energyName.replace("WLFM", "*");

        let energy;
        if(RECENT_SET_LIST.includes(energySet)){

            let nSetName, nSetId
            for(let set of NewSetList){
                if (set.ptcgoCode === energySet){
                    nSetName = set.name;
                    nSetId = set.id;
                    break;
                }
            }

            energy = {
                // "count": Number(energyObj[0]),
                "name" : energyName.replace(/\{[A-Z]\}/g, match => energyTypes[match] || match),
                "number": `*${cardNumber.trim()}`,
                "set.name": nSetName,
                "set.id": nSetId
            }
        }else{
            if(energyObj[energyObj.length-2] === "Energy"){ // energy set
                energy = {
                    // "count": Number(energyObj[0]),
                    "name" : energyName.replace(/\{[A-Z]\}/g, match => energyTypes[match] || match),
                    "set.name": "Scarlet & Violet Energies",
                } 
            }else{
                energy = {
                    // "count": Number(energyObj[0]),
                    "name" : energyName.replace(/\{[A-Z]\}/g, match => energyTypes[match] || match),
                    "number": `*${cardNumber.trim()}`,
                    "set.ptcgoCode": energySet,
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

        if(cardId === "PH") { // Reverse holo ?
            cardIdIndex = cardVal.length - 2;
            cardSetIndex = cardVal.length -3;
            cardId = cardVal[cardIdIndex].trim();
        }

        let cardSet = cardVal[cardSetIndex];
        // let cardCount = Number(cardVal[0]);
        let cardName = cardVal.splice(1, cardSetIndex-1).join(" ");
        // console.log(`${pokemonStr}`);

        let queryJSON;
        if(RECENT_SET_LIST.includes(cardSet)){
            let nSetName, nSetId

            for(let set of NewSetList){
                if (set.ptcgoCode === cardSet){
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
                "number": `*${cardId}`
            }
        }else if(PROMO_GALLERY_SET_LIST.includes(cardSet)){
            let nSetName, nSetId

            for(let set of PromoGallerySetList){
                if (set.ptcgoCode === cardSet){
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
            }
        }else {
            // const gapSets = ["CRZ-GG", "PR-SW", "ASR"]

            queryJSON = {
                "name": cardName,
                "supertype": cardType,
                "set.ptcgoCode": cardSet,
                "number": `*${cardId}`
            }
        }


        return queryJSON;
    }

}

export default QueryParameterBuilder;