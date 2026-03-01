import { useEffect, useMemo, useState } from 'react';
import styles from './css/DeckViewPanel.module.css';
// import DeckViewContainer from '../DeckViewerContainer';
import CardContainer from '../CardContainer';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { Form, Modal } from 'react-bootstrap';
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
import { DECK_FORMATS, validateDeck } from '../../utils/DeckValidationRules';

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
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState(DECK_FORMATS.POCKET);

    // const [lastProcessed, setLastProcessed] = useState(null);


    const validator = new CardJSONValidator();

    const handleOpenModal = () => setShowImportModal(true);
    const handleCloseModal = () => setShowImportModal(false);

    const handleFileNameOpenModal = () => {setIsFileNameModalOpen(true);};
    const handleFileNameCloseModal = () => {setIsFileNameModalOpen(false);};
    const handleFileNameSubmit = (fileName) => {doExport(fileName);};

    const handleDeckImageOpenModal = () => {setDeckImageModalOpen(true);};
    const handleDeckImageCloseModal = () => {setDeckImageModalOpen(false);};

    const handleCloseValidationModal = () => {
        setShowValidationModal(false);
    };


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
        // console.log("Adding card to Deck:")
        // console.log(card)
        setDecklist((previousDecklist) => {
            const newDecklist = { ...previousDecklist };
            if (!newDecklist[card.name]) {
                newDecklist[card.name] = { cards: [], totalCount: 0 };
            }

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

            if(card.supertype === "Pokémon" || card.supertype === "Pokemon"){
                setPokemonCount(prev => prev + 1);
            }
            if(card.supertype === "Trainer"){
                setTrainerCount(prev => prev + 1);
            }
            if(card.supertype === "Energy"){
                setEnergyCount(prev => prev + 1);
            }

            newDecklist[card.name].totalCount += 1;
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
            if(card.supertype === "Pokémon" || card.supertype === "Pokemon"){
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
                    return (filterByPokemon  && (card.data.supertype === 'Pokémon' || card.data.supertype === "Pokemon")) ||
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
                if(type === "Pokémon" || type === "Pokemon"){
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

    const validationResult = useMemo(() => {
        return validateDeck(decklist, selectedFormat);
    }, [decklist, selectedFormat]);

    const handleStatusBadgeClick = () => {
        if (!validationResult.isValid) {
            setShowValidationModal(true);
        }
    };

    return(
        <div className={styles.viewPanel} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
           <Card>
                <Card.Header>
                    <div className={styles.headerTopRow}>
                        <span className={styles.deckTitle}>Deck {`(${pokemonCount + trainerCount + energyCount})`}</span>
                        <div className={styles.deckHeaderControls}>
                            <div className={styles.deckTypeControl}>
                                <span className={styles.deckTypeLabel}>Deck Type</span>
                                <Form.Select
                                    size="sm"
                                    value={selectedFormat}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                    className={styles.formatSelect}
                                >
                                    <option value={DECK_FORMATS.POCKET}>Pocket</option>
                                    <option value={DECK_FORMATS.TCG}>TCG</option>
                                </Form.Select>
                            </div>
                            <button
                                type="button"
                                className={`${styles.statusBadge} ${validationResult.isValid ? styles.validBadge : styles.invalidBadge}`}
                                onClick={handleStatusBadgeClick}
                                disabled={validationResult.isValid}
                                title={validationResult.isValid ? 'Deck is valid' : 'Click to view validation issues'}
                            >
                                {validationResult.isValid ? 'Valid' : 'Invalid'}
                            </button>
                        </div>
                    </div>
                </Card.Header>
                <Card.Header>
                    <div className={styles.headerActionRow}>
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
                        <div className={styles.actionButtons}>
                            <Button variant='success' onClick={handleOpenModal}><FontAwesomeIcon icon={faFileImport} /> Import</Button>
                            <Button 
                                variant="primary" 
                                onClick={handleFileNameOpenModal}
                                disabled={Object.keys(decklist).length === 0}
                                >
                                <FontAwesomeIcon icon={faDownload} /> Export
                            </Button>
                            <Button variant='secondary'
                                    onClick={handleDeckImageOpenModal}
                                    disabled={Object.keys(decklist).length === 0}>
                                        <FontAwesomeIcon icon={faImage} /> Image</Button>
                            <Button variant='danger' onClick={doClear}><FontAwesomeIcon icon={faTrash} /> Clear</Button>
                        </div>
                    </div>
                </Card.Header>

                <Card.Body>
                    {isLoading ? <Spinner animation="border" size="xl"/> :
                        <CardContainer
                            cards={filteredDecklist}
                            // handleDoubleClick={handleDoubleClick}
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
            <Modal show={showValidationModal} onHide={handleCloseValidationModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{validationResult.isValid ? 'Deck Valid' : 'Deck Not Valid'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div><strong>Format:</strong> {validationResult.formatName}</div>
                    <div><strong>Total cards:</strong> {validationResult.totalCards}</div>
                    {!validationResult.isValid && (
                        <ul className={styles.validationList}>
                            {validationResult.errors.map((error) => (
                                <li key={error}>{error}</li>
                            ))}
                        </ul>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseValidationModal}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default DeckViewPanel;