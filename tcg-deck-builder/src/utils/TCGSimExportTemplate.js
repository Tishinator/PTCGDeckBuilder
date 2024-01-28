import CardJSONValidator from "./CardJsonValidator";

const validator = new CardJSONValidator();

function formatImageUrl(cardObj){
    let formattedURL;
    if(validator.isDatabaseCard(cardObj)){
        formattedURL = cardObj.images.large;
    }else if(validator.isInternalSetCard(cardObj)){
        formattedURL = "https://tishinator.github.io/PokemonTCGDeckBuilder" + cardObj.image;
    }    
    return formattedURL;
}

function formatCardType(cardObj){
    let cardType;
    if(validator.isDatabaseCard(cardObj)){
        cardType = cardObj.supertype;
    }else if(validator.isInternalSetCard(cardObj)){
        cardType = cardObj.category;
    }    
    return cardType;
}

class TCGSim{

    static export(decklist){
        console.log("ATTEMPTING TO EXPORT DECKLIST:")
        console.log(decklist);
        const simHeader = "QTY,Name,Type,URL";
        let rows = []
        for (let card in decklist) {
            console.log("Current Card:", card)
            for(let cardVariations in decklist[card].cards){
                let currentCard = decklist[card].cards[cardVariations];
                console.log("Card Variation:", currentCard)
                let quanity = currentCard.count;
                let name = card;
                let type = formatCardType(currentCard.data);
                let url = formatImageUrl(currentCard.data);
                rows.push(`${quanity},${name},${type},${url}`)
            }
        }
        
        const csvContent = `${simHeader}\n${rows.join('\n')}`;

        const blob = new Blob([csvContent], {type: 'text/csv'});
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = "deck.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    }
}

export default TCGSim;


