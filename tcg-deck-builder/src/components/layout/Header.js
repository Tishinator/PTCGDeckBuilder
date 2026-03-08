import { useContext, useState } from 'react';
import Container from 'react-bootstrap/Container';
import NavBar from 'react-bootstrap/Navbar';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faMoon as farMoon } from '@fortawesome/free-regular-svg-icons'; // regular moon
import { faSun as fasSun } from '@fortawesome/free-solid-svg-icons'; // solid sun
import { AppThemeContext } from '../../context/AppThemeContext';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Col, Row } from 'react-bootstrap';
import './Header.css'

function Header(){
    const {theme, toggleTheme} = useContext(AppThemeContext);
    const darkMode = theme === 'dark';
    const [showAboutModal, setShowAboutModal] = useState(false);
    const modalThemeClass = theme === 'dark' ? 'bg-dark text-white' : '';

    const handleClose = () => setShowAboutModal(false);
    const handleShow = () => setShowAboutModal(true);

    

    return (
        <NavBar bg={darkMode ?"dark" : "light"} data-bs-theme={darkMode?"dark" : "light"}  fixed='top'>
            <Container style={{ paddingLeft: '20px' }} fluid='true'>
                <NavBar.Brand>Pokemon TCG Deck Builder</NavBar.Brand>
                <Badge bg='primary' onClick={handleShow} className="badge-hover">v1.10.0</Badge>
            </Container>
            <NavBar.Collapse className='justify-content-end'>
                <Container fluid="true" style={{ paddingRight: '20px' }}>
                    <FontAwesomeIcon icon={darkMode ? farMoon : fasSun} onClick={toggleTheme} size='xl'/>
                </Container>
            </NavBar.Collapse>



            <Modal show={showAboutModal} onHide={handleClose} contentClassName={modalThemeClass} size='lg'>
                <Modal.Header closeButton>
                <Modal.Title>Deck Builder Version 1.10.0</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row className="mb-3">
                            <Col>
                                <strong>What's New</strong>
                                <ul className="mt-2">
                                    <li><strong>Live Validation Badge</strong> — Your deck is checked in real time against your selected format. The badge updates instantly as you build.</li>
                                    <li><strong>TCG Pocket Support</strong> — Filter card search results specifically for TCG Pocket format.</li>
                                    <li><strong>Smarter Search</strong> — Sort cards by Name or Release Date, and results reload automatically when you change a filter.</li>
                                    <li><strong>UI & Layout Polish</strong> — Improved scaling and spacing across the card search panel, deck view, and card viewer.</li>
                                </ul>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <strong>Under the Hood</strong>
                                <ul className="mt-2">
                                    <li>Migrated to Vite for faster builds and fewer security vulnerabilities.</li>
                                    <li>Switched to direct API calls (TCGDex & pokemontcg.io), removing the old SDK dependency.</li>
                                </ul>
                            </Col>
                        </Row>
                    </Container>
                </Modal.Body>
                <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                </Modal.Footer>
            </Modal>
        </NavBar>
    );
};

export default Header;