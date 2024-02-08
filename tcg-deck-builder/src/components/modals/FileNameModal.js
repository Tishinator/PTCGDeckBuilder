import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { AppThemeContext } from '../../context/AppThemeContext';


const FileNameModal = ({ show, onHide, onSubmit }) => {
  const [fileName, setFileName] = useState('');
  const { theme } = useContext(AppThemeContext);

  const modalThemeClass = theme === 'dark' ? 'bg-dark text-white' : '';


  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent form from refreshing the page
    const cleanedFileName = formatFileName(fileName); // Clean up the file name
    onSubmit(cleanedFileName); // Pass the cleaned file name back to the parent component
    setFileName(''); // Reset the input field
    onHide(); // Close the modal
  };

  function formatFileName(input) {
    const invalidChars = /[\/:*?"<>|]/g; // Regex for invalid file name characters
    const trimmedInput = input.trim(); // Trim whitespace
    const noInvalidChars = trimmedInput.replace(invalidChars, ''); // Remove invalid characters
    const formattedFileName = noInvalidChars.replace(/\s+/g, '_'); // Replace spaces with underscores
  
    return formattedFileName;
  }

  return (
    <Modal show={show} onHide={onHide} contentClassName={modalThemeClass} centered>
      <Modal.Header closeButton>
        <Modal.Title>Enter Deck Name</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
            <Form.Group>
              <Form.Label>File Name</Form.Label>
              <Form.Control
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                autoFocus
              />
            </Form.Group>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="primary" type="submit">Submit</Button>
            <Button variant="secondary" onClick={onHide}>Close</Button>
          
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FileNameModal;
