import React, { useEffect, useState } from "react";
import styles from './css/CardViewerContainer.module.css';
import PkmnCard from "./PkmnCard";
import CardJSONValidator from "../utils/CardJsonValidator";

function CardContainer({ cards, handleDoubleClick, containerType }) {
    const [cardsToShow, setCardsToShow] = useState([]);
    const validator = new CardJSONValidator();

    useEffect(() => {
        if (containerType === "Search") {
            // Logic from CardViewerContainer
            setCardsToShow(cards);
        } else if (containerType === "Deck") {
            // Logic from DeckViewContainer
            let cardArray = [];
            for (let card in cards) {
                let innerArray = Object.values(cards[card].cards).map(cardInfo => ({
                    ...cardInfo.data,
                    count: cardInfo.count
                }));
                cardArray.push(...innerArray.filter(item => item !== null)); // Filtering out null values
            }
            console.log("CARD ARRAY (CardContainer):");
            console.log(cardArray);
            setCardsToShow(cardArray);
        }
    }, [cards, containerType]);

    const defaultOnDoubleClick = () => console.log("No function provided for Double click.");
    const doubleClickHandler = card => handleDoubleClick ? handleDoubleClick(card) : defaultOnDoubleClick();

    return (
        <div className={styles.container}>
            <div className={styles.cardContainer}>
                {cardsToShow.map((thisCard) => (
                    <div key={thisCard.id} className={styles.cardItem} onDoubleClick={() => doubleClickHandler(thisCard)}>
                        <PkmnCard cardObj={thisCard} container={containerType} />
                        {containerType === "Deck" && (
                            <div className="card-count">x{thisCard.count}</div> // Ensure you have styles for "card-count"
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CardContainer;
