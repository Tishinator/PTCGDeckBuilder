import { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import styles from './css/PkmnCard.module.css';

function PkmnCard({cardObj}){
    const [isLoading, setIsLoading] = useState(true);

    const handleDragStart = (e, card) => {
        // console.log("DRAGGING CARD");
        console.log(card);
        e.dataTransfer.setData("card", JSON.stringify(card));
    }

    return(
        <Card className={styles.cardStyle} draggable onDragStart={(e) => handleDragStart(e, cardObj)}>
            {isLoading && 
                <Placeholder as={Card} animation="glow">
                    <Placeholder style={{ width: '10vw', height: '27vh' }} />
                </Placeholder>
            }
            <Card.Img src={cardObj.image.includes('pre-released-sets') ? "/PokemonTCGDeckBuilder/" + cardObj.image : cardObj.image + "/high.webp"}
                onLoad={()=>setIsLoading(false)}
                style={isLoading ? {display:'none'} : {}}/>
        </Card>
    );
}

export default PkmnCard;