import React, { useRef, useContext, useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AppThemeContext } from '../../context/AppThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import backgroundImage from '../../assets/background.jpg';

function DeckImageModal({ show, handleClose, decklist }) {
    const { theme } = useContext(AppThemeContext);
    const modalThemeClass = theme === 'dark' ? 'bg-dark text-white' : '';
    const canvasRef = useRef(null);
    const modalBodyRef = useRef(null); // Reference to modal body for dynamic sizing

    useEffect(() => {
        // console.log(`Deck image : ${decklist}`)
        // console.log(decklist)
        // Ensure modalBodyRef.current is available before setting up the observer
        if (modalBodyRef.current) {
            const adjustCanvasSizeAndDraw = () => {
                if (!show || !modalBodyRef.current) return;
    
                // Use getComputedStyle to retrieve the actual padding values
                const style = getComputedStyle(modalBodyRef.current);
                const modalPaddingTop = parseFloat(style.paddingTop);
                const modalPaddingBottom = parseFloat(style.paddingBottom);
                const modalPaddingLeft = parseFloat(style.paddingLeft);
                const modalPaddingRight = parseFloat(style.paddingRight);
    
                const modalBodyRect = modalBodyRef.current.getBoundingClientRect();
                // Adjust dimensions to account for padding
                const modalWidth = modalBodyRect.width - modalPaddingLeft - modalPaddingRight;
                const modalHeight = modalBodyRect.height - modalPaddingTop - modalPaddingBottom;
    
                adjustCardSizeAndDraw(decklist, canvasRef, modalWidth, modalHeight);
            };

            const resizeObserver = new ResizeObserver(adjustCanvasSizeAndDraw);
            resizeObserver.observe(modalBodyRef.current);

            // Initial adjustment and draw
            adjustCanvasSizeAndDraw();

            // Cleanup observer on component unmount
            return () => resizeObserver.disconnect();
        }
    }, [show, decklist]);

    function adjustCardSizeAndDraw(decklist, canvasRef, modalWidth, modalHeight) {

        // Your existing priority map and sorting function
        const supertypePriority = {
            Pokémon: 1,
            Trainer: 2,
            Energy: 3,
            // Add other supertypes as needed
        };

        const sortCardsBySupertype = (a, b) => {
            const priorityA = supertypePriority[a.cards[0].data.supertype] || 999;
            const priorityB = supertypePriority[b.cards[0].data.supertype] || 999;

            if (priorityA < priorityB) return -1;
            if (priorityA > priorityB) return 1;
            return 0;
        };

        // Convert the object into an array of [key, value] pairs, sort it, then reconstruct the object
        const sortedArray = Object.entries(decklist).sort((a, b) => sortCardsBySupertype(a[1], b[1]));
        decklist = sortedArray.reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const padding = 10; // Fixed padding around cards
        const cardsPerRow = 8; // Maximum cards per row
        const aspectRatio = 3.5 / 2.5; // Standard card aspect ratio

        // Calculate initial card size without considering modal height
        let cardWidth = (modalWidth - (padding * (cardsPerRow + 1))) / cardsPerRow;
        let cardHeight = cardWidth * aspectRatio;

        // Determine rows needed and adjust card size based on modal height
        const uniqueCardCount = Object.keys(decklist).length;
        let rowsNeeded = Math.ceil(uniqueCardCount / cardsPerRow);
        let totalHeightNeeded = rowsNeeded * (cardHeight + padding) + padding;

        if (totalHeightNeeded > modalHeight) {
            // Adjust card sizes to fit within modal height
            cardHeight = (modalHeight - padding * (rowsNeeded + 1)) / rowsNeeded;
            cardWidth = cardHeight / aspectRatio;
        }

        canvas.height =(cardHeight * rowsNeeded) + (padding * rowsNeeded)
        
        canvas.width = (cardWidth * cardsPerRow) + (padding * cardsPerRow)

        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing

        const bgImage = new Image();
        bgImage.onload = () => {
            ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
            
            Object.keys(decklist).forEach((cardName, index) => {
                for(let i=0; i<decklist[cardName].cards.length; i++){
                    const card = decklist[cardName].cards[i];
                    const img = new Image();
                    let new_index = index+i;
                    img.onload = () => {
                        const row = Math.floor(new_index / cardsPerRow);
                        const col = new_index % cardsPerRow;
                        const x = col * (cardWidth + padding) + padding;
                        const y = row * (cardHeight + padding) + padding;
        
                        ctx.drawImage(img, x, y, cardWidth, cardHeight); // Draw card image
        
                        const dotRadius = 15; // Fixed size for visibility
                        const dotX = x + cardWidth / 2;
                        const dotY = y + cardHeight - 2*(dotRadius / 2);
                        ctx.fillStyle = 'red';
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
                        ctx.fill();
        
                        ctx.font = `${dotRadius * 1.5}px Arial`; // Size text based on dot size
                        ctx.fillStyle = 'white';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(card.count.toString(), dotX, dotY); // Draw count text
                    };
                    let image_url = card.data.image || card.data.images.large;
                    let formatted_url = image_url.startsWith('http') ? image_url : `https://tishinator.github.io/PTCGDeckBuilder/${image_url}`;
                    // console.log(formatted_url);
                    img.src = formatted_url;
                }
                
            });
        };
        bgImage.src = backgroundImage;

        
    }

    // Function to handle the download of the canvas as an image
    const handleDownload = () => {
        const canvas = canvasRef.current;
        // Convert the canvas to a Blob
        canvas.toBlob(function(blob) {
            // Create a Blob URL from the Blob
            const blobUrl = URL.createObjectURL(blob);
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'decklist-image.png'; // Set the filename for the download
            // Append the link to the document
            document.body.appendChild(link);
            // Programmatically click the link to trigger the download
            link.click();
            // Remove the link from the document
            document.body.removeChild(link);
            // Revoke the Blob URL to free up resources
            URL.revokeObjectURL(blobUrl);
        }, 'image/png');
    };

    

    return (
        <Modal show={show} onHide={handleClose} contentClassName={modalThemeClass} fullscreen>
            <Modal.Header closeButton className={modalThemeClass}>
                <Modal.Title>Decklist Image</Modal.Title>
            </Modal.Header>
            <Modal.Body className={modalThemeClass} ref={modalBodyRef}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <canvas ref={canvasRef} />
            </div>

            </Modal.Body>
            <Modal.Footer className={modalThemeClass}>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
                {/* <Button variant="primary" onClick={handleDownload}>
                    <FontAwesomeIcon icon={faFileArrowUp} /> Download Image
                </Button> */}
            </Modal.Footer>
        </Modal>
    );
}

export default DeckImageModal;
