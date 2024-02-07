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
import PrereleaseCardFilter from "../../utils/PrereleaseCardFilter";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useDoubleClick } from "../../context/DoubleClickContext";
import CardJSONValidator from "../../utils/CardJsonValidator";

const validator = new CardJSONValidator();

function CardSearchPanel() {
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { handleDoubleClickData } = useDoubleClick();
    const [usePrereleasedCards, setUsePrereleaseCards] = useState(false);
    const [filteredSearchResults, setFilteredSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async (event) =>{
        setIsLoading(true);
        event.preventDefault();
        try {
            setSearchResults([]);
            // Database search
            const results = await TCGController.query({"name": `*${searchTerm}*`});
            // Internal search (from public/assets)
            const prereleaseResults = PrereleaseCardFilter.filter({"name": searchTerm});
            let combinedResults = [...prereleaseResults, ...results];
             
            setSearchResults(combinedResults);
        } catch (error) {
            console.error('Error fetching search results:', error);
            // Handle the error as needed
        } finally{
            setIsLoading(false);
        }
    }

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handlePrereleaseCheckbox = (e) => {
        setUsePrereleaseCards(e.target.checked); 
    };

    // UPDATE WHEN FILTERS CHANGE
    useEffect(() => {
        setFilteredSearchResults(() => {
            if (!searchResults.length) {
                return [];
            }
            
            return searchResults.filter(card => {
                // If using prereleased cards, include all; otherwise, include only database cards.
                return usePrereleasedCards || validator.isDatabaseCard(card);
            });
        });
    }, [usePrereleasedCards, searchResults]);

    const SearchBar = (
        <Form onSubmit={handleSearch}>
            <Row className={styles.formRow}>
                <Col xs="auto" className={styles.checkbox}>
                    <Form.Check
                    inline
                    type="checkbox"
                    label="Include Prereleased Cards"
                    onChange={handlePrereleaseCheckbox}
                    checked={usePrereleasedCards}
                    />
                </Col>
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
