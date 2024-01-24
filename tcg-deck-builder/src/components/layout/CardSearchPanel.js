import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
import CardViewerContainer from "../CardViewerContainer";
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'; 
import styles from './css/CardSearchPanel.module.css';
import TCGdexController  from '../../utils/TCGdex/TCGdexController';
import PrereleaseCardFilter from "../../utils/PrereleaseCardFilter";

function CardSearchPanel({onNewDoubleClickData}) {
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = async (event) =>{
        event.preventDefault();
        try {
            setSearchResults([]);
            // Database search
            const results = await TCGdexController.query({"name": searchTerm});
            console.log(results);
            // Internal search (from public/assets)
            const prereleaseResults = PrereleaseCardFilter.filter({"name": searchTerm});
            const combinedResults = [...prereleaseResults, ...results];
            setSearchResults(combinedResults);
        } catch (error) {
            console.error('Error fetching search results:', error);
            // Handle the error as needed
        }
    }

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const SearchBar = (
        <Form onSubmit={handleSearch}>
            <Row>
                <Col xs="auto">
                    <Form.Control
                        type="text"
                        placeholder="Search"
                        className="mr-sm-2"
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                </Col>
                <Col xs="auto">
                    <Button type="submit">Search</Button>
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
                    <CardViewerContainer cards={searchResults} handleDoubleClick={onNewDoubleClickData} />
                </Card.Body>
            </Card>
        </div>
    );
}

export default CardSearchPanel;