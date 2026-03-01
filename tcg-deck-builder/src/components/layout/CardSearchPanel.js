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

const CARD_FILTER_ALL    = 'all';
const CARD_FILTER_TCG    = 'tcg';
const CARD_FILTER_POCKET = 'pocket';

const SORT_FIELD_DATE = 'date';
const SORT_FIELD_NAME = 'name';
const SORT_ORDER_ASC = 'asc';
const SORT_ORDER_DESC = 'desc';

function CardSearchPanel() {
    const [searchResults, setSearchResults] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { handleDoubleClickData } = useDoubleClick();
    const [filteredSearchResults, setFilteredSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cardFilter, setCardFilter] = useState(CARD_FILTER_ALL);
    const [sortField, setSortField] = useState(SORT_FIELD_DATE);
    const [sortOrder, setSortOrder] = useState(SORT_ORDER_DESC);
    const [hasSearched, setHasSearched] = useState(false);

    const runSearch = async ({ term = searchTerm, filter = cardFilter } = {}) => {
        const trimmedTerm = (term || '').trim();

        if (!trimmedTerm) {
            setSearchResults([]);
            return;
        }

        setIsLoading(true);
        try {
            setSearchResults([]);
            const normalizedTerm = trimmedTerm.toLowerCase() === 'n' ? trimmedTerm : `*${trimmedTerm}*`;
            const results = await TCGController.query({ name: normalizedTerm, cardType: filter });
            setSearchResults(results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (event) => {
        event.preventDefault();
        setHasSearched(true);
        await runSearch({ term: searchTerm, filter: cardFilter });
    }

    const handleInputChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCardFilterChange = (event) => {
        setCardFilter(event.target.value);
    };

    const handleSortFieldChange = (event) => {
        setSortField(event.target.value);
    };

    const toggleSortOrder = () => {
        setSortOrder((current) => current === SORT_ORDER_DESC ? SORT_ORDER_ASC : SORT_ORDER_DESC);
    };

    useEffect(() => {
        const sortedResults = [...searchResults].sort((a, b) => {
            if (sortField === SORT_FIELD_NAME) {
                const nameA = (a?.name || '').toLowerCase();
                const nameB = (b?.name || '').toLowerCase();
                const comparison = nameA.localeCompare(nameB);
                return sortOrder === SORT_ORDER_ASC ? comparison : -comparison;
            }

            const dateA = new Date(a?.set?.releaseDate || 0).getTime();
            const dateB = new Date(b?.set?.releaseDate || 0).getTime();
            const comparison = dateA - dateB;
            return sortOrder === SORT_ORDER_ASC ? comparison : -comparison;
        });

        setFilteredSearchResults(sortedResults);
    }, [searchResults, sortField, sortOrder]);

    useEffect(() => {
        if (!hasSearched) {
            return;
        }

        runSearch({ term: searchTerm, filter: cardFilter });
    }, [cardFilter]);

    const SearchBar = (
        <Form onSubmit={handleSearch}>
            <Row className={styles.formRow}>
                <Col xs="auto" className={styles.checkbox}>
                    <div className={styles.controlsGroup}>
                        <Form.Select
                            size="sm"
                            value={cardFilter}
                            onChange={handleCardFilterChange}
                            className={styles.cardFilterSelect}
                        >
                            <option value={CARD_FILTER_ALL}>All Cards</option>
                            <option value={CARD_FILTER_TCG}>TCG Only</option>
                            <option value={CARD_FILTER_POCKET}>Pocket Only</option>
                        </Form.Select>

                        <Form.Select
                            size="sm"
                            value={sortField}
                            onChange={handleSortFieldChange}
                            className={styles.cardSortSelect}
                        >
                            <option value={SORT_FIELD_DATE}>Sort: Date</option>
                            <option value={SORT_FIELD_NAME}>Sort: Name</option>
                        </Form.Select>

                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className={styles.sortOrderButton}
                            onClick={toggleSortOrder}
                        >
                            {sortOrder === SORT_ORDER_DESC ? 'Desc' : 'Asc'}
                        </Button>
                    </div>
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
