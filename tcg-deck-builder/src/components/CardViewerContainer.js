import React from "react";
import { useEffect, useState } from "react";
import styles from './css/CardViewerContainer.module.css';
import PkmnCard from "./PkmnCard";

function CardViewerContainer({cards, handleDoubleClick}){
    const [cardsToShow, setCardsToShow] = useState([]);

    useEffect(()=>{
        // console.log(cards)
        setCardsToShow(cards)
    }, [cards]);
    
    const defaultOnDoubleClick = () => {
        console.log("No function provided for Double click.");
    }

    const doubleClickFunction = (card) => {
        console.log(`Double clicked :`);
        console.log(card)
        handleDoubleClick(card)
    }

    return (
        <div className={styles.container}>
            <div className={styles.cardContainer}>
                {Array.isArray(cardsToShow) && cardsToShow.length > 0 ? 
                    cardsToShow.map((thisCard) => (
                        <div key={thisCard.id} className={styles.cardItem} onDoubleClick={handleDoubleClick ? () => doubleClickFunction(thisCard) : defaultOnDoubleClick}>
                            <PkmnCard cardObj={thisCard} container="Search"/>
                        </div>
                    ))
                    :
                    <div></div>
                }

            </div>
        </div>
    );
};

export default CardViewerContainer;