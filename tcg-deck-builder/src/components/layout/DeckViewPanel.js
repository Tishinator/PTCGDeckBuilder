import { useEffect, useState } from 'react';
import styles from './css/DeckViewPanel.module.css';
import DeckViewContainer from '../DeckViewerContainer';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import TCGSim from '../../utils/TCGSimExportTemplate';

function areCardsEqual(obj1, obj2) {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);

    if (obj1Keys.length !== obj2Keys.length) {
        return false;
    }

    for (let key of obj1Keys) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}

function DeckViewPanel({doubleClickData}) {
    const [decklist, setDecklist] = useState({});

    const handleDrop = (e) => {
        e.preventDefault();
        console.log("card drop");
        console.log(e);
        const card = JSON.parse(e.dataTransfer.getData("card"));
        addCardToDecklist(card);
    };

    const addCardToDecklist = (card) => {
        console.log(`Current Decklist : ${decklist}`);
        console.log("Adding Card:");
        console.log(card);
        setDecklist((previousDecklist) => {
            const newDecklist = { ...previousDecklist };
            if (!newDecklist[card.name]) {
                newDecklist[card.name] = { cards: [], totalCount: 0 };
            }
            if (newDecklist[card.name].totalCount < 4) {
                let cardFound = false;
                for (let cardEntry of newDecklist[card.name].cards) {
                    if (areCardsEqual(cardEntry.data, card)) {
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
    

    useEffect(() => {
        if (doubleClickData) {
            addCardToDecklist(doubleClickData);
        }
    }, [doubleClickData]);


    function doExport(){
        console.log(decklist)
        TCGSim.export(decklist)
    }

    return(
        <div className={styles.viewPanel} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
           <Card>
                <Card.Header>Deck</Card.Header>
                <Card.Header>
                    <Button variant='primary' onClick={doExport}>Export</Button>
                </Card.Header>
                <Card.Body>
                    <DeckViewContainer cards={decklist} />
                </Card.Body>
            </Card>
        </div>
    );
}

export default DeckViewPanel;