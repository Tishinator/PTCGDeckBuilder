import React from "react";
import { useEffect, useState } from "react";
import styles from './css/CardViewerContainer.module.css';
import PkmnCard from "./PkmnCard";

function CardViewerContainer({cards}){
    const [cardsToShow, setCardsToShow] = useState([]);

    useEffect(()=>{
        setCardsToShow(cards)
    }, [cards]);
    
    return (
        <div className={styles.container}>
            <div className={styles.cardContainer}>
                {cardsToShow ? 
                        cardsToShow.map((thisCard) => (
                            <div  key={thisCard.id} className={styles.cardItem}>
                                <PkmnCard cardObj={thisCard} />
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