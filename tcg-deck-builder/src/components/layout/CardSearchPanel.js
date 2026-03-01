import React, { useState, useEffect } from "react";
import Card from 'react-bootstrap/Card';
// import CardViewerContainer from "../CardViewerContainer";
import CardContainer from "../CardContainer";
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import styles from './css/CardSearchPanel.module.css';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import Spinner from 'react-bootstrap/Spinner';
import TCGController from "../../utils/TCGapi/TCGController";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useDoubleClick } from "../../context/DoubleClickContext";

function CardSearchPanel() {
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { handleDoubleClickData } = useDoubleClick();
    const [filteredSearchResults, setFilteredSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (event) =>{
        setIsLoading(true);
        event.preventDefault();
        try {
            setSearchResults([]);
            const results = await TCGController.query(searchTerm.toLowerCase() === "n" ? {"name": `${searchTerm}`} : {"name": `*${searchTerm}*`});
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally{
            setIsLoading(false);
        }
    }

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    useEffect(() => {
        setFilteredSearchResults(searchResults);
    }, [searchResults]);

    const SearchBar = (
        <Form onSubmit={handleSearch}>
            <Row className={styles.formRow}>
                <Col className={styles.searchCol}>
                    <Row className="justify-content-end">
                    <Col xs="auto">
                        <Form.Control
                        type="text"
                        placeholder="Search"
                        className={`mr-sm-2 ${styles.searchInput}`}
                        value={searchTerm}
                        onChange={handleInputChange}
                        />
                    </Col>
                    <Col xs="auto">
                        <Button type="submit" className={styles.searchButton}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} size='x1'/> Search
                        </Button>
                    </Col>
                    </Row>
                </Col>
            </Row>
    </Form>
    );

    return (
        <div className={styles.searchPanel}>
            <Card>
                <Card.Header>Card Search</Card.Header>
                <Card.Header>{SearchBar}</Card.Header>
                <Card.Body>
                {isLoading ? <Spinner animation="border" size="xl"/> :
                    <CardContainer cards={filteredSearchResults} handleDoubleClick={handleDoubleClickData} containerType={"Search"}/>
                }
                </Card.Body>
            </Card>
        </div>
    );
}

export default CardSearchPanel;
