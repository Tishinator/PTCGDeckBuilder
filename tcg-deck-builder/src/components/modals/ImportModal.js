import React, { useState, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function ImportModal({ show, handleClose, importFunction }) {

    const [fileContent, setFileContent] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                setFileContent(text);
            };
            reader.readAsText(file);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        importFunction(fileContent);
    }


    return (
        <Modal size='xl' show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Import Decklist</Modal.Title>
            </Modal.Header>
            <Modal.Header>
                <Modal.Title>From File: 
                    <input
                        type="file"
                        accept=".csv, .txt"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }} // Hide the actual file input
                    />
                    <button className="btn btn-primary" onClick={handleButtonClick}>
                        Upload File
                    </button>
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group>
                        <Form.Control 
                            as="textarea" 
                            value={fileContent} 
                            onChange={(e) => setFileContent(e.target.value)} // Enable editing
                            rows={20} 
                            className="mt-3"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="success" type="submit">
                        Import
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ImportModal;
