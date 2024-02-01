import React, { useState } from "react";
import Card from 'react-bootstrap/Card';
// import CardViewerContainer from "../CardViewerContainer";
import CardContainer from "../CardContainer";
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'; 
import styles from './css/CardSearchPanel.module.css';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome'
// import TCGdexController  from '../../utils/TCGdex/TCGdexController';
import TCGController from "../../utils/TCGapi/TCGController";
import PrereleaseCardFilter from "../../utils/PrereleaseCardFilter";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function CardSearchPanel({onNewDoubleClickData}) {
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = async (event) =>{
        event.preventDefault();
        try {
            setSearchResults([]);
            // Database search
            const results = await TCGController.query({"name": `${searchTerm}`});
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
            <Row className="justify-content-end">
                <Col xs="auto" >
                    <Form.Control
                        type="text"
                        placeholder="Search"
                        className="mr-sm-2"
                        value={searchTerm}
                        onChange={handleInputChange}
                    />
                </Col>
                <Col xs="auto">
                    <Button type="submit"><FontAwesomeIcon icon={faMagnifyingGlass} size='x1'/> Search</Button>
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
                    <CardContainer cards={searchResults} handleDoubleClick={onNewDoubleClickData} containerType={"Search"}/>
                </Card.Body>
            </Card>
        </div>
    );
}

export default CardSearchPanel;
