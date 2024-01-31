
import pokemon from 'pokemontcgsdk';
import TCGController from '../TCGapi/TCGController';
import CardJSONValidator from '../CardJsonValidator';
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

        for(let row in rows){
            let currentRow = rows[row];

            if (currentRow == '\r' || currentRow.includes(totalCards) || row == rows.length-1){
                continue;
            }

            let cardCount = 0;
            let cardName = "";
            let cardSet = "";
            let cardId = "";
            
            if (cardTypes.some(str => currentRow.includes(str))){
                // console.log(`CARD TYPE DIVIDER: ${currentRow}`)
                let rowsplit = currentRow.split(":");
                cardType = rowsplit[0];
                continue;
            }

            // if we're here, its gunna be a card.
            let cardVal = currentRow.split(" ");
            // card length should be 4 (if more, the card name has spaces)
            let cardIdIndex = cardVal.length - 1;
            let cardSetIndex = cardVal.length - 2;
            cardId = cardVal[cardIdIndex].trim();

            if(cardId == "PH") { // Reverse holo ?
                cardIdIndex = cardVal.length - 2;
                cardSetIndex = cardVal.length -3;
                cardId = cardVal[cardIdIndex].trim();
            }

            cardSet = cardVal[cardSetIndex];
            cardCount = Number(cardVal[0]);
            cardName = cardVal.splice(1, cardSetIndex-1).join(" ");
            console.log(`${currentRow}`);
            // Card lookup (DB hit)
            let queryJSON = {
                "name": cardName,
                "supertype": cardType,
                "set.ptcgoCode": cardSet,
                "number": cardId
            }
            let cardFromDatabase = await TCGController.query(queryJSON);


            let card = {
                count: cardCount,
                name: cardName,
                type: cardType,
                image: cardFromDatabase[0].images.large
            };

            
            if (!newDecklist[card.name]) {
                newDecklist[card.name] = { cards: [], totalCount: 0 };
            }
            if (newDecklist[card.name].totalCount < 4) {
                let cardFound = false;
                for (let cardEntry of newDecklist[card.name].cards) {
                    if (validator.areCardsEqual(cardEntry.data, card)) {
                        cardEntry.count += 1;
                        cardFound = true;
                        break;
                    }
                }
                if (!cardFound) {
                    newDecklist[card.name].cards.push({ data: card, count: card.count });
                    newDecklist[card.name].totalCount = card.count;

                }else{
                    newDecklist[card.name].totalCount += card.count;
                }
                
            } else {
                console.log(`Maximum of 4 cards reached for ${card.name}`);
            }

        }

        return newDecklist;

    }
};

export default TCGLiveController;
