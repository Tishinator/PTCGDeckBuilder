import Container from 'react-bootstrap/Container';
import NavBar from 'react-bootstrap/Navbar';

function Header(){
    return (
        <NavBar variant='dark' bg='dark'>
            <Container>
                <NavBar.Brand>Pokemon TCG Deck Builder</NavBar.Brand>
            </Container>
        </NavBar>
    );
};

export default Header;