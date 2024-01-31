import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import styles from './css/PkmnCard.module.css';
import CardJSONValidator from '../utils/CardJsonValidator';

function PkmnCard({cardObj, container}){
    const [isLoading, setIsLoading] = useState(true);
    const validator = new CardJSONValidator();

    const handleDragStart = (e, card) => {
        // e.dataTransfer.setData("card", JSON.stringify(card));
        // e.dataTransfer.setData("origContainer", JSON.stringify(container));
        e.dataTransfer.setData("application/json", JSON.stringify({ card: card, origContainer: container }));
    }


    function getCardImage(cardObj){
        let returnImage;
        if (validator.isDatabaseCard(cardObj)){
            returnImage = cardObj.images.large;
        }else{

            if (cardObj.image.includes("Temporal") && !cardObj.image.includes("tishinator")){ // Internal
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