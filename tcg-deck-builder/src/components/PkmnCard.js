import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import styles from './css/PkmnCard.module.css';
import CardJSONValidator from '../utils/CardJsonValidator';

function PkmnCard({cardObj}){
    const [isLoading, setIsLoading] = useState(true);
    const validator = new CardJSONValidator();

    const handleDragStart = (e, card) => {
        // console.log("DRAGGING CARD");
        console.log(card);
        e.dataTransfer.setData("card", JSON.stringify(card));
    }


    function getCardImage(cardObj){
        let returnImage;
        if (validator.isInternalSetCard(cardObj)){
            returnImage = "/PokemonTCGDeckBuilder/" + cardObj.image;
        }else if (validator.isDatabaseCard(cardObj)){
            returnImage = cardObj.images.large;
        }else if (validator.isFormattedDeckCard(cardObj)){
            console.log(cardObj)
            if (cardObj.image.includes("Temporal")){ // Internal
                returnImage = "/PokemonTCGDeckBuilder/" + cardObj.image;
            }else{
                returnImage = cardObj.image; // Database

            }
        }
        return returnImage;
    }

    return(
        <Card className={styles.cardStyle} draggable onDragStart={(e) => handleDragStart(e, cardObj)}>
            {isLoading && 
                <Placeholder as={Card} animation="glow">
                    <Placeholder style={{ width: '10vw', height: '27vh' }} />
                </Placeholder>
            }
            <Card.Img 
                src={getCardImage(cardObj)}
                onLoad={() => setIsLoading(false)}
                style={isLoading ? { display: 'none' } : {}}
            />

        </Card>
    );
}

export default PkmnCard;