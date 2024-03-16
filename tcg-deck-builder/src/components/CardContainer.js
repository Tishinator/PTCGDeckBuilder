import React, { useEffect, useState } from "react";
import styles from './css/CardViewerContainer.module.css'
import PkmnCard from "./PkmnCard";
import CardJSONValidator from "../utils/CardJsonValidator";

function CardContainer({ cards, handleDoubleClick, containerType, addCardToDecklist, removeCardFromDecklist }) {
    // Existing code remains unchanged
  
    const [cardsToShow, setCardsToShow] = useState([]);
    const validator = new CardJSONValidator();

    // Define the priority for each supertype
    const supertypePriority = {
        "Pokémon": 1,
        "Pokemon": 1,
        "Trainer": 2,
        "Energy": 3
    };

    // Sorting function that compares the supertype of each card
    const sortCardsBySupertype = (a, b) => {
        // Get the priority of each supertype. If not found, default to a large number to sort them at the end.
        const priorityA = supertypePriority[a.supertype] || 999;
        const priorityB = supertypePriority[b.supertype] || 999;

        if (priorityA < priorityB) return -1; // a comes first
        if (priorityA > priorityB) return 1;  // b comes first
        return 0; // a and b are of the same supertype, so keep their current order
    };

    useEffect(() => {
        if (containerType === "Search") {
            // Logic from CardViewerContainer
            setCardsToShow(cards);
        } else if (containerType === "Deck") {
            console.log(cards)
            
            let cardArray = [];
            for (let card in cards) {
                let innerArray = Object.values(cards[card].cards).map(cardInfo => ({
                    ...cardInfo.data,
                    count: cardInfo.count
                }));
                cardArray.push(...innerArray.filter(item => item !== null)); // Filtering out null values
            }
            
            // Sort the cardArray by supertype
            cardArray.sort(sortCardsBySupertype);
            
            // Now cardArray is sorted by supertype in the order of Pokémon, Trainer, and Energy
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
