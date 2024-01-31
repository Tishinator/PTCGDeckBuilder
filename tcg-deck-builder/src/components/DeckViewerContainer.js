import React from "react";
import { useEffect, useState } from "react";
import styles from './css/CardViewerContainer.module.css';
import PkmnCard from "./PkmnCard";
import CardJSONValidator from "../utils/CardJsonValidator";

function DeckViewContainer({ cards, handleDoubleClick }) {
    const [cardsToShow, setCardsToShow] = useState([]);
    const validator = new CardJSONValidator();

    useEffect(() => {
        let cardArray = [];
        for (let card in cards) {
            let innerArray;
            innerArray = Object.values(cards[card].cards).map(cardInfo => {
                return {
                    ...cardInfo.data,
                    count: cardInfo.count
                };
            });
            
            // Assuming cardArray is already defined
            cardArray.push(...innerArray.filter(item => item !== null)); // Filtering out null values
            
        }
        console.log("CARD ARRAY (DECKVIEWERCONTAINER:");
        console.log(cardArray);
        setCardsToShow(cardArray);
    }, [cards]);
    

    const defaultOnDoubleClick = () => {
        console.log("No function provided for Double click.");
    };

    return (
        <div className={styles.container}>
            <div className={styles.cardContainer}>
                {cardsToShow.map((thisCard) => (
                    <div key={thisCard.id} className={styles.cardItem} onDoubleClick={handleDoubleClick ? () => handleDoubleClick(thisCard) : defaultOnDoubleClick}>
                        <PkmnCard cardObj={thisCard} container="Deck"/>
                        {/* Display count */}
                        <div className="card-count">x{thisCard.count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeckViewContainer;
