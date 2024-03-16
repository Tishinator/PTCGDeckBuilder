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
import { Col, Image, Row } from 'react-bootstrap';
import tmLogo from '../../assets/TwilightMasquerade.png';
import tfLogo from '../../assets/Pokemon_TCG_Scarlet_Violet—Temporal_Forces_Logo.png';
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
                <Badge bg='primary' onClick={handleShow} className="badge-hover">v1.1.0</Badge>
            </Container>
            <NavBar.Collapse className='justify-content-end'>
                <Container fluid="true" style={{ paddingRight: '20px' }}>
                    <FontAwesomeIcon icon={darkMode ? farMoon : fasSun} onClick={toggleTheme} size='xl'/>
                </Container>
            </NavBar.Collapse>



            <Modal show={showAboutModal} onHide={handleClose} contentClassName={modalThemeClass} size='lg'>
                <Modal.Header closeButton>
                <Modal.Title>Deck Builder Version 1.1.0</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Container>
                        <Row>
                            <Col>Supported Prereleased Sets :</Col>
                            <Col>
                                <Image src={tfLogo} width={'50%'}/>
                                <Image src={tmLogo} width={'50%'}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col>Whats New?</Col>
                        </Row>
                        <Row>
                            <Col>
                                <ul>
                                    <li>The ability to toggle between JP and English card proxies now available. Note, some cards will not have english proxies. Proxies are taken from JustInBasil</li>
                                </ul>
                            </Col>
                        </Row>
                        <Row>
                            <Col>Bug Fixes</Col>
                        </Row>
                        <Row>
                            <Col>
                                <ul>
                                    <li>Fixed Issue where cards imported with type "Pokemon" (instead of "Pokémon") failed to import</li>
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