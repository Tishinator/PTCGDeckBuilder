import { useContext } from 'react';
import Container from 'react-bootstrap/Container';
import NavBar from 'react-bootstrap/Navbar';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { faMoon as farMoon } from '@fortawesome/free-regular-svg-icons'; // regular moon
import { faSun as fasSun } from '@fortawesome/free-solid-svg-icons'; // solid sun
import { AppThemeContext } from '../../context/AppThemeContext';

function Header(){
    const {theme, toggleTheme} = useContext(AppThemeContext);
    const darkMode = theme === 'dark';
    return (
        <NavBar bg={darkMode ?"dark" : "light"} data-bs-theme={darkMode?"dark" : "light"}  fixed='top'>
            <Container style={{ paddingLeft: '20px' }} fluid='true'>
                <NavBar.Brand>Pokemon TCG Deck Builder</NavBar.Brand>
            </Container>
            <NavBar.Collapse className='justify-content-end'>
                <Container fluid="true" style={{ paddingRight: '20px' }}>
                    <FontAwesomeIcon icon={darkMode ? farMoon : fasSun} onClick={toggleTheme} size='xl'/>
                </Container>
            </NavBar.Collapse>
        </NavBar>
    );
};

export default Header;