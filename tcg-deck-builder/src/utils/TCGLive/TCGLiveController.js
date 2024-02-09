
import pokemon from 'pokemontcgsdk';
import TCGController from '../TCGapi/TCGController';
import CardJSONValidator from '../CardJsonValidator';
import QueryParameterBuilder from './QueryParameterBuilder';
pokemon.configure({apiKey: process.env.POKEMON_TCG_API_KEY});
const validator = new CardJSONValidator();


const cardTypes = ["Pokémon:", "Trainer:", "Energy:" ];
const cardTypes2 = ["Pokémon", "Trainer", "Energy" ];
const totalCards = "Total Cards:";

class TCGLiveController {
    
    static async importDeck(deckList){
        let newDecklist = [];

        // Parsing Decklist
        let rows = deckList.split('\n');

        let cardType = "";

        let couldNotFind = [];

        for(let row in rows){
            let currentRow = rows[row].trim();
            
            let thisCardCount = Number(currentRow.split(' ')[0]);

            // Ignore these rows
            if (currentRow === '\r' || currentRow.includes(totalCards)){
                continue;
            }
            // These are the type rows (ie Pokemon : , Trainer : , Energy : )
            if (cardTypes.some(str => currentRow.includes(str))){
                // console.log(`CARD TYPE DIVIDER: ${currentRow}`)
                let rowsplit = currentRow.split(":");
                cardType = rowsplit[0];
                continue;
            }
            // Some import formats dont use the above format, instead they use -> Pokemon (18)
            if (cardTypes2.some(str => currentRow.includes(str))){
                let rowsplit = currentRow.split(" ");
                if(!(rowsplit.length > 2)){
                    cardType = rowsplit[0];
                    continue;
                }
            }

            let queryParams;
            if(cardType === "Energy"){
                queryParams = QueryParameterBuilder.getEnergyQuery(currentRow);
            }else{
                queryParams = QueryParameterBuilder.getQuery(currentRow, cardType);
            }
            
            // If for some reason we got a bad row, skip it.
            if(queryParams.name === "" || queryParams.name === undefined){
                continue;
            }
            
            // Query the TCG API
            let cardFromDatabase = await TCGController.query(queryParams);
            
            // // If the card isnt found, search using the temporary lookup
            if (cardFromDatabase[0] === undefined){
                // alert(`Could not find card : ${queryParams.name}`);
                couldNotFind.push(`${queryParams.name} : ${queryParams['set.ptcgoCode']}\n`)
                continue;
            }

            const cardTypeMaxCount = {
                "energy": 60,
                "trainer": 4,
                "pokémon": 4,
            }

            // Format cards for decklist

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
                        cardEntry.count += thisCardCount;
                        cardFound = true;
                        break;
                    }
                }
                if (!cardFound) {
                    newDecklist[card.name].cards.push({ data: card, count: thisCardCount });
                    newDecklist[card.name].totalCount = thisCardCount;

                }else{
                    newDecklist[card.name].totalCount += thisCardCount;
                }
                
            } else {
                console.log(`Maximum of ${cardTypeMaxCount[card.supertype.toLowerCase()]} cards reached for ${card.name}`);
            }

        }
        if(couldNotFind.length>0){
            alert(`Could not find ${couldNotFind}\n\n\nPlease Send this message to our Github Repository under Issues`)
        }
        console.log(newDecklist)
        return newDecklist;

    }
};

export default TCGLiveController;
