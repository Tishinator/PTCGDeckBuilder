import CardJSONValidator from "../CardJsonValidator";

const validator = new CardJSONValidator();

function formatImageUrl(cardObj){
    let formattedURL;
    if(validator.isDatabaseCard(cardObj)){
        formattedURL = cardObj.images.large;
    }else if(validator.isFormattedDeckCard(cardObj)){
        if (cardObj.image.includes("Temporal")){
            if(!cardObj.image.includes("tishinator")){
                formattedURL = "https://tishinator.github.io/PTCGDeckBuilder" + cardObj.image;
            }else{
                formattedURL = cardObj.image;
            }
        }else{
            formattedURL = cardObj.image;
        }
    }     
    return formattedURL;
}

function formatCardType(cardObj){
    return cardObj.supertype;
}

class TCGSim{

    static export(decklist, filename){
        // console.log("ATTEMPTING TO EXPORT DECKLIST:")
        // console.log(decklist);
        const simHeader = "QTY,Name,Type,URL";
        let rows = []
        for (let card in decklist) {
            // console.log("Current Card:", card)
            for(let cardVariations in decklist[card].cards){
                let currentCard = decklist[card].cards[cardVariations];
                // console.log("Card Variation:", currentCard)
                let quanity = currentCard.count;
                let name = card;
                let type = formatCardType(currentCard.data);
                let url = formatImageUrl(currentCard.data);
                if(name !== '' && type !== '' && url !== ''){

                }else{
                    rows.push(`${quanity},${name},${type},${url}`)
                }
            }
        }
        
        const csvContent = `${simHeader}\n${rows.join('\n')}`;

        const blob = new Blob([csvContent], {type: 'text/csv'});
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    }

    static importDeck(csvData){
        console.log("IMPORTING...");

        const rows = csvData.split('\n');
        const data = rows.map(row => row.split(','));
        let newDecklist = [];
        for(let [index, row] of data.entries()){
            if(index === 0){
                continue;
            }
            let card = {
                count: row[0],
                name: row[1],
                supertype: row[2],
                image: row[3]
            };

            if (!newDecklist[card.name]) {
                newDecklist[card.name] = { cards: [], totalCount: Number(0) };
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
                    newDecklist[card.name].cards.push({ data: card, count: Number(card.count) });
                    newDecklist[card.name].totalCount = Number(card.count);

                }else{
                    newDecklist[card.name].totalCount += Number(card.count);
                }
                
            } else {
                console.log(`Maximum of 4 cards reached for ${card.name}`);
            }

        }
        
        return newDecklist;
    }
}

export default TCGSim;


