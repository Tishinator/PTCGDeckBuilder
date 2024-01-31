import { useEffect, useState } from 'react';
import styles from './css/DeckViewPanel.module.css';
import DeckViewContainer from '../DeckViewerContainer';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import TCGSim from '../../utils/TCGSimExportTemplate';
import CardJSONValidator from '../../utils/CardJsonValidator';
import ImportModal from '../modals/ImportModal';
import TCGLiveController from '../../utils/TCGLive/TCGLiveController';


function DeckViewPanel({doubleClickData, doubleClickTrigger}) {
    const [decklist, setDecklist] = useState({});
    const [showImportModal, setShowImportModal] = useState(false);

    const validator = new CardJSONValidator();

    const handleOpenModal = () => setShowImportModal(true);
    const handleCloseModal = () => setShowImportModal(false);

    const handleDrop = (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("application/json"));
        const cardContainer = data.origContainer;
        const card = data.card;
        if (cardContainer === "Deck"){
            removeCardFromDecklist(card);
        }else if(cardContainer === "Search"){
            addCardToDecklist(card);
        }else{
            alert("?")
        }
    };

    const handleDoubleClick = (data) => {
        removeCardFromDecklist(data);
    }

    const addCardToDecklist = (card) => {
        setDecklist((previousDecklist) => {
            const newDecklist = { ...previousDecklist };
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
                    newDecklist[card.name].cards.push({ data: card, count: 1 });
                }
                newDecklist[card.name].totalCount += 1;
            } else {
                console.log(`Maximum of 4 cards reached for ${card.name}`);
            }
            return newDecklist;
        });
    };
    
    const removeCardFromDecklist = (card) => {
        setDecklist((previousDecklist) =>{
            const newDecklist = { ...previousDecklist };
            // Go through the variants to find the card to remove.
            for (let [index, cardVariant] of newDecklist[card.name].cards.entries()) {
                if (validator.areCardsEqual(cardVariant.data, card)) {
                    cardVariant.count -= 1;
                    if(validator.isFormattedDeckCard(cardVariant.data)){
                        cardVariant.data.count -= 1;
                    }
                    if (cardVariant.count <= 0){
                        newDecklist[card.name].cards.splice(index, 1);
                    }
                    break;
                }
            }
            // remove 1 from the total count.
            newDecklist[card.name].totalCount -= 1;
            if (newDecklist[card.name].totalCount <= 0){
                console.log("Card should be completely removed from decklist");
                console.log(newDecklist[card.name]);
                console.log(newDecklist);
            }
            return newDecklist;
        });
    }

    useEffect(() => {
        if (doubleClickData) {
            addCardToDecklist(doubleClickData);
        }
    }, [doubleClickData, doubleClickTrigger]);

    async function doImport(fileContent){
        // let newDeck = TCGSim.importDeck(fileContent);
        let newDeck = await TCGLiveController.importDeck(fileContent);
        doClear();
        console.log("THIS SHOULD BE YOUR NEW IMPORT DECK");
        console.log(newDeck);
        setDecklist(newDeck);
        handleCloseModal();

    }


    function doExport(){
        console.log(decklist)
        TCGSim.export(decklist)
    }

    function doClear(){
        setDecklist([]);
    }

    return(
        <div className={styles.viewPanel} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
           <Card>
                <Card.Header>Deck</Card.Header>
                <Card.Header>
                    <Button variant='success' onClick={handleOpenModal}>Import</Button>
                    <Button variant='primary' onClick={doExport}>Export</Button>
                    <Button variant='danger' onClick={doClear}>Clear</Button>
                </Card.Header>
                <Card.Body>
                    <DeckViewContainer cards={decklist} handleDoubleClick={handleDoubleClick}/>
                </Card.Body>
            </Card>
            <ImportModal 
                show={showImportModal} 
                handleClose={handleCloseModal} 
                importFunction={doImport}
            />
        </div>
    );
}

export default DeckViewPanel;