import { useEffect, useState } from 'react';
import styles from './css/DeckViewPanel.module.css';
// import DeckViewContainer from '../DeckViewerContainer';
import CardContainer from '../CardContainer';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { Form } from 'react-bootstrap';
import TCGSim from '../../utils/TCGsim/TCGSimController';
import CardJSONValidator from '../../utils/CardJsonValidator';
import ImportModal from '../modals/ImportModal';
import TCGLiveController from '../../utils/TCGLive/TCGLiveController';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faFileImport } from '@fortawesome/free-solid-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import { useDoubleClick } from '../../context/DoubleClickContext';
import FileNameModal from '../modals/FileNameModal';
import DeckImageModal from '../modals/DeckImageModal';

function DeckViewPanel() {
    const [decklist, setDecklist] = useState({});
    const [filteredDecklist, setFilteredDecklist] = useState({});
    const [filterByPokemon, setFilterByPokemon] = useState(true);
    const [filterByTrainer, setFilterByTrainer] = useState(true);
    const [filterByEnergy, setFilterByEnergy] = useState(true);
    const [pokemonCount, setPokemonCount] = useState(0);
    const [trainerCount, setTrainerCount] = useState(0);
    const [energyCount, setEnergyCount] = useState(0);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFileNameModalOpen, setIsFileNameModalOpen] = useState(false);
    const { doubleClickedData, doubleClickTrigger } = useDoubleClick();
    const [isDeckImageModalOpen, setDeckImageModalOpen] = useState(false);

    // const [lastProcessed, setLastProcessed] = useState(null);


    const validator = new CardJSONValidator();

    const handleOpenModal = () => setShowImportModal(true);
    const handleCloseModal = () => setShowImportModal(false);

    const handleFileNameOpenModal = () => {setIsFileNameModalOpen(true);};
    const handleFileNameCloseModal = () => {setIsFileNameModalOpen(false);};
    const handleFileNameSubmit = (fileName) => {doExport(fileName);};

    const handleDeckImageOpenModal = () => {setDeckImageModalOpen(true);};
    const handleDeckImageCloseModal = () => {setDeckImageModalOpen(false);};


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
        // console.log("Adding card to Deck:")
        // console.log(card)
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
                if(card.supertype === "Pokémon"){
                    setPokemonCount(prev => prev + 1);
                }
                if(card.supertype === "Trainer"){
                    setTrainerCount(prev => prev + 1);
                }
                if(card.supertype === "Energy"){
                    setEnergyCount(prev => prev + 1);
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
            if (newDecklist[card.name] === undefined){
                return newDecklist;
            }
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
            if(card.supertype === "Pokémon"){
                setPokemonCount(prev => prev - 1);
            }
            if(card.supertype === "Trainer"){
                setTrainerCount(prev => prev - 1);
            }
            if(card.supertype === "Energy"){
                setEnergyCount(prev => prev - 1);
            }
            if (newDecklist[card.name].totalCount <= 0){
                // console.log("Card should be completely removed from decklist");
                delete newDecklist[card.name];
                // console.log(newDecklist[card.name]);
                // console.log(newDecklist);
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
            alert("WARNING:\n\nWhen importing decks via the Pokemon Sim CSV format, the system may not accurately track the quantity of cards post-import.\n\nEnsure you manually monitor any additions or subtractions to maintain correct card counts.")

        }else{
            newDeck = await TCGLiveController.importDeck(fileContent);
        }

        setDecklist(newDeck);
        getCounts(newDeck);
        setIsLoading(false)

    }


    function doExport(fileName){
        // console.log(decklist)
        TCGSim.export(decklist, fileName)
    }

    function doClear(){
        setDecklist([]);
        setPokemonCount(0);
        setTrainerCount(0);
        setEnergyCount(0);
    }

    function getCounts(newDeck){
        // console.log("getting counts for decklist");
        // console.log(newDeck);
        for(let card in newDeck){
            
            for (let [index, cardVariant] of newDeck[card].cards.entries()) {
                let type = cardVariant.data.supertype;
                let count = Number(cardVariant.count);
                // console.log(`x${count}  - ${cardVariant.data.name} : ${type}`)
                if(type === "Pokémon"){
                    setPokemonCount(prev => prev + count);
                }
                if(type === "Trainer"){
                    setTrainerCount(prev => prev + count);
                }
                if(type === "Energy"){
                    setEnergyCount(prev => prev + count);
                }
            }
            

        }
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
                <Card.Header>Deck {`(${pokemonCount + trainerCount + energyCount})`}</Card.Header>
                <Card.Header>
                    <div className='d-flex justify-content-between'>
                        <div className={styles.checkboxContainer}>
                            <Form>
                                <div className={styles.checkboxes}>
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        label={`Pokemon (${pokemonCount})`}
                                        onChange={handlePokemonFilter}
                                        checked={filterByPokemon}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        label={`Trainer (${trainerCount})`}
                                        onChange={handleTrainerFilter}
                                        checked={filterByTrainer}
                                    />
                                    <Form.Check
                                        inline
                                        type="checkbox"
                                        label={`Energy (${energyCount})`}
                                        onChange={handleEnergyFilter}
                                        checked={filterByEnergy}
                                    />
                                </div>
                            </Form>
                        </div>
                        <div className="">
                            <Button variant='success' onClick={handleOpenModal} className="me-2"><FontAwesomeIcon icon={faFileImport} /> Import</Button>
                            <Button 
                                variant="primary" 
                                onClick={handleFileNameOpenModal} 
                                className="me-2" 
                                disabled={Object.keys(decklist).length === 0}
                                >
                                <FontAwesomeIcon icon={faDownload} /> Export
                            </Button>
                            <Button variant='primary' 
                                    onClick={handleDeckImageOpenModal} 
                                    className="me-2" 
                                    disabled={Object.keys(decklist).length === 0}>
                                        <FontAwesomeIcon icon={faImage} /> Open as Image</Button>
                            <Button variant='danger' onClick={doClear}><FontAwesomeIcon icon={faTrash} /> Clear</Button>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body>
                    {isLoading ? <Spinner animation="border" size="xl"/> :
                        <CardContainer
                            cards={filteredDecklist}
                            handleDoubleClick={handleDoubleClick}
                            containerType={"Deck"}
                            addCardToDecklist={addCardToDecklist}
                            removeCardFromDecklist={removeCardFromDecklist}
                        />
                    }
                </Card.Body>
            </Card>
            <ImportModal 
                show={showImportModal} 
                handleClose={handleCloseModal} 
                importFunction={doImport}
            />
            <FileNameModal
                show={isFileNameModalOpen}
                onHide={handleFileNameCloseModal}
                onSubmit={handleFileNameSubmit}
            />
            <DeckImageModal
                show={isDeckImageModalOpen}
                handleClose={handleDeckImageCloseModal}
                decklist={decklist}
            />
        </div>
    );
}

export default DeckViewPanel;