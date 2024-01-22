import { useEffect, useState } from 'react';
import styles from './css/DeckViewPanel.module.css';
import CardViewerContainer from '../CardViewerContainer';
import Card from 'react-bootstrap/Card';

function DeckViewPanel({doubleClickData}) {
    const [decklist, setDecklist] = useState([]);

    const handleDrop = (e) => {
        e.preventDefault();
        const card = JSON.parse(e.dataTransfer.getData("card"));
        addCardToDecklist(card);
    };

    const addCardToDecklist = (card) => {
        setDecklist((previousDecklist) => {
            return [...previousDecklist, card];
        })
    }

    useEffect(() => {
        if (doubleClickData) {
            addCardToDecklist(doubleClickData);
        }
    }, [doubleClickData]);

    return(
        <div className={styles.viewPanel} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
           <Card>
                <Card.Header>Deck</Card.Header>
                <Card.Body>
                    <CardViewerContainer cards={decklist} />
                </Card.Body>
            </Card>
        </div>
    );
}

export default DeckViewPanel;