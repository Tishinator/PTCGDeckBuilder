import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Placeholder from 'react-bootstrap/Placeholder';
import Modal from 'react-bootstrap/Modal'; // Import Modal from react-bootstrap
import styles from './css/PkmnCard.module.css';
import CardJSONValidator from '../utils/CardJsonValidator';

function PkmnCard({ cardObj, container }) {
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false); // State for managing modal view
    const validator = new CardJSONValidator();

    const handleDragStart = (e, card) => {
        if (container !== 'Search') {
            e.preventDefault();
            return;
        }
        e.dataTransfer.setData("application/json", JSON.stringify({ card: card, origContainer: container }));
    };

    const handleCtrlClick = (e) => {
        if (e.ctrlKey) { // Check if Ctrl key is pressed during the click
            e.preventDefault(); // Prevent default to stop any undesired behavior
            setShowModal(!showModal); // Toggle the modal view
        }
    };

    function getCardImage(cardObj) {
        let returnImage;
        if (validator.isDatabaseCard(cardObj)) {
            returnImage = cardObj.images.large;
        } else {
            
            if (cardObj.image.includes("assets") && !cardObj.image.includes("tishinator")) {
                console.log(cardObj.image)
                returnImage = "/PTCGDeckBuilder/" + cardObj.image;
            } else {
                returnImage = cardObj.image;
            }
        }
        return returnImage;
    }

    return (
        <>
            <Card 
                className={styles.cardStyle} 
                draggable={container === "Search" ? true : false}  
                onDragStart={(e) => handleDragStart(e, cardObj)}
                onClick={handleCtrlClick} // Attach the click event handler
            >
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

            {/* Modal for the enlarged image */}
            <Modal 
                show={showModal} 
                onHide={() => setShowModal(false)} 
                centered
                dialogClassName={styles.modalBackdrop} // Apply custom backdrop style
                contentClassName={styles.modalContent} // Apply custom content style
            >
                <Modal.Body className={styles.modalBody}>
                    <img 
                        src={getCardImage(cardObj)} 
                        alt="Enlarged" 
                        className={styles.enlargedImg} // Apply custom image style
                    />
                </Modal.Body>
            </Modal>
        </>
    );
}

export default PkmnCard;
