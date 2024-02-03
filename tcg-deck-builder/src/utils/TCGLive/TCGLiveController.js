
import pokemon from 'pokemontcgsdk';
import TCGController from '../TCGapi/TCGController';
import CardJSONValidator from '../CardJsonValidator';
import QueryParameterBuilder from './QueryParameterBuilder';
pokemon.configure({apiKey: process.env.POKEMON_TCG_API_KEY});
const validator = new CardJSONValidator();


const cardTypes = ["Pokémon:", "Trainer:", "Energy:" ];
const totalCards = "Total Cards:";

class TCGLiveController {
    

    
    static async importDeck(deckList){
        let newDecklist = [];

        // Parsing Decklist
        let rows = deckList.split('\n');

        let cardType = "";

        let couldNotFind = [];

        for(let row in rows){
            let currentRow = rows[row];

            if (currentRow == '\r' || currentRow.includes(totalCards)){
                continue;
            }
            
            if (cardTypes.some(str => currentRow.includes(str))){
                // console.log(`CARD TYPE DIVIDER: ${currentRow}`)
                let rowsplit = currentRow.split(":");
                cardType = rowsplit[0];
                continue;
            }
            let queryParams;
            if(cardType == "Energy"){
                queryParams = QueryParameterBuilder.getEnergyQuery(currentRow);
            }else{
                queryParams = QueryParameterBuilder.getQuery(currentRow, cardType);
            }
            
            if(queryParams.name === "" || queryParams.name === undefined){
                continue;
            }
            let cardFromDatabase = await TCGController.query(queryParams);
            
            // // If the card isnt found, search using the temporary lookup
            if (cardFromDatabase[0] == undefined){
                // alert(`Could not find card : ${queryParams.name}`);
                couldNotFind.push(queryParams.name)
                continue;
            }

            const cardTypeMaxCount = {
                "energy": 60,
                "trainer": 4,
                "pokémon": 4,
            }


            let card = {
                image: cardFromDatabase[0].images.large,
                ...cardFromDatabase[0]
            };

            
            if (!newDecklist[card.name]) {
                newDecklist[card.name] = { cards: [], totalCount: 0 };
            }
            if (newDecklist[card.name].totalCount < cardTypeMaxCount[card.supertype.toLowerCase()]) {
                let cardFound = false;
                for (let cardEntry of newDecklist[card.name].cards) {
                    if (validator.areCardsEqual(cardEntry.data, card)) {
                        cardEntry.count += 1;
                        cardFound = true;
                        break;
                    }
                }
                if (!cardFound) {
                    newDecklist[card.name].cards.push({ data: card, count: Number(currentRow[0]) });
                    newDecklist[card.name].totalCount = Number(currentRow[0]);

                }else{
                    newDecklist[card.name].totalCount += Number(currentRow[0]);
                }
                
            } else {
                console.log(`Maximum of ${cardTypeMaxCount[card.supertype.toLowerCase()]} cards reached for ${card.name}`);
            }

        }
        if(couldNotFind.length>0){
            alert(`Could not find ${couldNotFind}`)
        }
        console.log(newDecklist)
        return newDecklist;

    }
};

export default TCGLiveController;
