import React, { useEffect, useState } from "react";
import styles from './css/CardViewerContainer.module.css'
import PkmnCard from "./PkmnCard";
import CardJSONValidator from "../utils/CardJsonValidator";

function CardContainer({ cards, handleDoubleClick, containerType, addCardToDecklist, removeCardFromDecklist }) {
    // Existing code remains unchanged
  
    const [cardsToShow, setCardsToShow] = useState([]);
    const validator = new CardJSONValidator();

    useEffect(() => {
        if (containerType === "Search") {
            // Logic from CardViewerContainer
            setCardsToShow(cards);
        } else if (containerType === "Deck") {
            // console.log(cards)
            let cardArray = [];
            for (let card in cards) {
                let innerArray = Object.values(cards[card].cards).map(cardInfo => ({
                    ...cardInfo.data,
                    count: cards[card].totalCount
                }));
                cardArray.push(...innerArray.filter(item => item !== null)); // Filtering out null values
            }
            // console.log("CARD ARRAY (CardContainer):");
            // console.log(cardArray);
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
                        {containerType === "Deck" ? 
                            <div className={styles.cardButtons}>
                                <div className={styles.minus} onClick={(e) => {e.stopPropagation(); removeCardFromDecklist(thisCard);}}>-</div>
                                <div className={styles.plus} onClick={(e) => {e.stopPropagation(); addCardToDecklist(thisCard);}}>+</div>
                            </div> 
                        :
                            <div></div>
                        }

                        <PkmnCard cardObj={thisCard}
                            container={containerType} 
                        />
                        {containerType === "Deck" && (
                            <div className={styles.cardCount}>x{thisCard.count}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CardContainer;
