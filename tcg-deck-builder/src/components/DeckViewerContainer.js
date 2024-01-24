import React from "react";
import { useEffect, useState } from "react";
import styles from './css/CardViewerContainer.module.css';
import PkmnCard from "./PkmnCard";

function DeckViewContainer({ cards, handleDoubleClick }) {
    const [cardsToShow, setCardsToShow] = useState([]);

    useEffect(() => {
        let cardArray = [];
        for (let card in cards) {
            let innerArray = Object.values(cards[card].cards).map(cardInfo => ({
                id: cardInfo.data.id,
                name: cardInfo.data.name,
                image: cardInfo.data.image,
                count: cardInfo.count
            }));
            cardArray.push(...innerArray); // Spread operator to flatten the array
        }
    
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
                        <PkmnCard cardObj={thisCard} />
                        {/* Display count */}
                        <div className="card-count">x{thisCard.count}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeckViewContainer;
