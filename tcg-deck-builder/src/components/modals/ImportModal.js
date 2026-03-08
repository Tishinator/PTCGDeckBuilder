import React, { useState, useRef, useContext } from 'react';
import { Modal, Button, Form, ButtonGroup } from 'react-bootstrap';
import { AppThemeContext } from '../../context/AppThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowUp } from '@fortawesome/free-solid-svg-icons';

function ImportModal({ show, handleClose, importFunction }) {
    const { theme } = useContext(AppThemeContext);
    const dark = theme === 'dark';

    const [activeTab, setActiveTab] = useState('csv');
    const [csvContent, setCsvContent] = useState('');
    const [liveContent, setLiveContent] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setCsvContent(e.target.result);
            reader.readAsText(file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const content = activeTab === 'csv' ? csvContent : liveContent;
        importFunction(content);
    };

    const modalThemeClass = dark ? 'bg-dark text-white' : '';
    const textareaStyle = dark
        ? { backgroundColor: '#343a40', color: 'white', border: '1px solid #495057' }
        : {};

    return (
        <Modal size='xl' show={show} onHide={handleClose} contentClassName={modalThemeClass}>
            <Modal.Header closeButton className={modalThemeClass}>
                <Modal.Title>Import Decklist</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body className={modalThemeClass}>
                    <ButtonGroup className="mb-3 w-100">
                        <Button
                            variant={activeTab === 'csv' ? 'primary' : (dark ? 'outline-light' : 'outline-secondary')}
                            onClick={() => setActiveTab('csv')}
                        >
                            CSV
                        </Button>
                        <Button
                            variant={activeTab === 'live' ? 'primary' : (dark ? 'outline-light' : 'outline-secondary')}
                            onClick={() => setActiveTab('live')}
                        >
                            TCG Live / Limitless
                        </Button>
                    </ButtonGroup>

                    {activeTab === 'csv' && (
                        <>
                            <div className="mb-2">
                                <input
                                    type="file"
                                    accept=".csv, .txt"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                />
                                <Button variant="primary" onClick={() => fileInputRef.current.click()}>
                                    <FontAwesomeIcon icon={faFileArrowUp} /> Upload File
                                </Button>
                            </div>
                            <Form.Control
                                as="textarea"
                                value={csvContent}
                                onChange={(e) => setCsvContent(e.target.value)}
                                rows={20}
                                placeholder="Paste a CSV export here, or upload a file above..."
                                style={textareaStyle}
                            />
                        </>
                    )}

                    {activeTab === 'live' && (
                        <Form.Control
                            as="textarea"
                            value={liveContent}
                            onChange={(e) => setLiveContent(e.target.value)}
                            rows={20}
                            placeholder={"Paste Decklist here."}
                            style={textareaStyle}
                        />
                    )}
                </Modal.Body>
                <Modal.Footer className={modalThemeClass}>
                    <Button variant='success' type="submit">Import</Button>
                    <Button variant='secondary' onClick={handleClose}>Close</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default ImportModal;
