import { useEffect, useState } from 'react';
import styles from './css/DeckViewPanel.module.css';
// import DeckViewContainer from '../DeckViewerContainer';
import CardContainer from '../CardContainer';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { Form } from 'react-bootstrap';
import TCGSim from '../../utils/TCGSimExportTemplate';
import CardJSONValidator from '../../utils/CardJsonValidator';
import ImportModal from '../modals/ImportModal';
import TCGLiveController from '../../utils/TCGLive/TCGLiveController';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faFileImport } from '@fortawesome/free-solid-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useDoubleClick } from '../../context/DoubleClickContext';

function DeckViewPanel() {
    const [decklist, setDecklist] = useState({});
    const [filteredDecklist, setFilteredDecklist] = useState({});
    const [filterByPokemon, setFilterByPokemon] = useState(true);
    const [filterByTrainer, setFilterByTrainer] = useState(true);
    const [filterByEnergy, setFilterByEnergy] = useState(true);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { doubleClickedData, doubleClickTrigger } = useDoubleClick();
    // const [lastProcessed, setLastProcessed] = useState(null);


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

    const cardTypeMaxCount = {
        "energy": 60,
        "trainer": 4,
        "pokémon": 4,
    }

    const addCardToDecklist = (card) => {
        console.log("Adding card to Deck:")
        console.log(card)
        setDecklist((previousDecklist) => {
            const newDecklist = { ...previousDecklist };
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
                    newDecklist[card.name].cards.push({ data: card, count: 1 });
                }
                newDecklist[card.name].totalCount += 1;
            } else {
                console.log(`Maximum of ${cardTypeMaxCount[card.supertype.toLowerCase()]} cards reached for ${card.name}`);
                return previousDecklist;
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

    // UPDATE WHEN THE DOUBLE CLICK DATA FROM THE CARD SEARCH PANEL IS UPDATED
    useEffect(() => {
        if (doubleClickedData) {
            addCardToDecklist(doubleClickedData);
        }
    }, [doubleClickedData, doubleClickTrigger]);

    // UPDATE WHEN FILTERS CHANGE
    useEffect(() => {
        setFilteredDecklist(() => {
            if (!decklist) {
                return {};
            }
    
            // Reconstruct the decklist object with filtered cards
            const filteredDecklist = Object.entries(decklist).reduce((acc, [key, value]) => {
                // Filter the cards array based on the checkbox states
                const filteredCards = value.cards.filter(card => {
                    return (filterByPokemon  && card.data.supertype === 'Pokémon') ||
                           (filterByTrainer && card.data.supertype === 'Trainer') ||
                           (filterByEnergy && card.data.supertype === 'Energy');
                });
    
                // If there are any filtered cards, add them to the accumulator object
                if (filteredCards.length > 0) {
                    acc[key] = { ...value, cards: filteredCards };
                }
                return acc;
            }, {});
    
            return filteredDecklist;
        });
    }, [filterByPokemon, filterByTrainer, filterByEnergy, decklist]);
    

    async function doImport(fileContent){
        setIsLoading(true);

        doClear();
        handleCloseModal();

        
        const isCSVFormat = (fileContent) => {
            return fileContent.trim().startsWith("QTY,Name,Type,URL");
        }
        let newDeck;
        if(isCSVFormat(fileContent)){
            newDeck = TCGSim.importDeck(fileContent);
        }else{
            newDeck = await TCGLiveController.importDeck(fileContent);
        }

        setDecklist(newDeck);
        setIsLoading(false)

    }


    function doExport(){
        console.log(decklist)
        TCGSim.export(decklist)
    }

    function doClear(){
        setDecklist([]);
    }


    const handlePokemonFilter = (e) => {
        setFilterByPokemon(e.target.checked); 
    };
    
    const handleTrainerFilter = (e) => {
        setFilterByTrainer(e.target.checked); 
    };

    const handleEnergyFilter = (e) => {
        setFilterByEnergy(e.target.checked); 
    };
    return(
        <div className={styles.viewPanel} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
           <Card>
                <Card.Header>Deck</Card.Header>
                <Card.Header>
                    <div className='d-flex justify-content-between'>
                        <div className={styles.checkboxContainer}>
                            <Form>
                                <div className={styles.checkboxes}>
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        label="Pokemon"
                                        onChange={handlePokemonFilter}
                                        checked={filterByPokemon}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        label="Trainer"
                                        onChange={handleTrainerFilter}
                                        checked={filterByTrainer}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        label="Energy"
                                        onChange={handleEnergyFilter}
                                        checked={filterByEnergy}
                                    />
                                </div>
                            </Form>
                        </div>
                        <div className="">
                            <Button variant='success' onClick={handleOpenModal} className="me-2"><FontAwesomeIcon icon={faFileImport} /> Import</Button>
                            <Button variant='primary' onClick={doExport} className="me-2"><FontAwesomeIcon icon={faDownload} /> Export</Button>
                            <Button variant='danger' onClick={doClear}><FontAwesomeIcon icon={faTrash} /> Clear</Button>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body>
                    {isLoading ? <Spinner animation="border" size="xl"/> :
                        <CardContainer cards={filteredDecklist} handleDoubleClick={handleDoubleClick} containerType={"Deck"}/>
                    }
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