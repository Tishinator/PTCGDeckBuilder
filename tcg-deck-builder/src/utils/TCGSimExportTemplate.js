
class TCGSim{

    static export(decklist){
        const simHeader = "QTY,Name,Type,URL";
        let rows = []
        for (let card in decklist) {
            console.log("Current Card:", card)
            for(let cardVariations in decklist[card].cards){
                let currentCard = decklist[card].cards[cardVariations];
                console.log("Card Variation:", currentCard)
                let quanity = currentCard.count;
                let name = card;
                // let type = cardVariations.type;
                let url = currentCard.data.image;
                rows.push(`${quanity},${name},,${url}\n`)
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


