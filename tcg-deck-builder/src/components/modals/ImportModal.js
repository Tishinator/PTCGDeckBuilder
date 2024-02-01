import React, { useState, useRef, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { AppThemeContext } from '../../context/AppThemeContext';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';


function ImportModal({ show, handleClose, importFunction }) {
    const { theme } = useContext(AppThemeContext);

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

    const modalThemeClass = theme === 'dark' ? 'bg-dark text-white' : '';
    const buttonVariant = 'primary';

    return (
        <Modal size='xl' show={show} onHide={handleClose} contentClassName={modalThemeClass}>
            <Modal.Header closeButton className={modalThemeClass}>
                <Modal.Title>Import Decklist</Modal.Title>
            </Modal.Header>
            <Modal.Header className={modalThemeClass}>
                <Modal.Title > 
                    <input
                        type="file"
                        accept=".csv, .txt"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }} // Hide the actual file input
                    />
                    <button className="btn btn-primary" onClick={handleButtonClick}>
                    <FontAwesomeIcon icon={faFileArrowUp} />  Upload File
                    </button>
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className={modalThemeClass}>
                    <Form.Group>
                        <Form.Control 
                            as="textarea" 
                            value={fileContent} 
                            onChange={(e) => setFileContent(e.target.value)} // Enable editing
                            rows={20} 
                            className="mt-3"
                            style={theme === 'dark' ? { backgroundColor: '#343a40', color: 'white' } : {}}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className={modalThemeClass}>
                    <Button variant='success' type="submit">
                        Import
                    </Button>
                    <Button variant={'secondary'} onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ImportModal;
