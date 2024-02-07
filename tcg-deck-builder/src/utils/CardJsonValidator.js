class CardJSONValidator {
    constructor() {
        // Define unique keys for each type of object
        this.databaseUniqueKeys = ['id', 'images'];
        this.formattedDeckAllKeys = ['image']; // Updated to include keys from both sets
    }

    isDatabaseCard(card) {
        // Check if all unique database keys are in the card object
        return this.databaseUniqueKeys.every(key => card.hasOwnProperty(key));
    }

    isFormattedDeckCard(card) {
        // Check if all unique keys for formatted deck are in the card object
        return this.formattedDeckAllKeys.every(key => card.hasOwnProperty(key));
    }

    determineCardType(card) {
        if (this.isDatabaseCard(card)) {
            return 'DatabaseCard';
        } else if (this.isFormattedDeckCard(card)) {
            return 'FormattedDeckCard'; // Updated type name
        } else {
            return 'Unknown';
        }
    }

    areCardsEqual(obj1, obj2) {
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj2);
    
        // Check for keys in both objects, but skip 'image' and 'count' as they are optional
        for (let key of obj1Keys) {
            if (!obj2Keys.includes(key) && key !== 'image' && key !== 'count') {
                return false; // Key is missing in obj2 and it's not 'image' or 'count'
            }
        }
    
        for (let key of obj2Keys) {
            if (!obj1Keys.includes(key) && key !== 'image' && key !== 'count') {
                return false; // Key is missing in obj1 and it's not 'image' or 'count'
            }
        }
    
        // Now compare values for keys present in both objects
        for (let key of obj1Keys) {
            if (key === 'image' || key === 'count') {
                continue; // Skip optional fields
            }
    
            const val1 = obj1[key];
            const val2 = obj2[key];
    
            const areObjects = this.isObject(val1) && this.isObject(val2);
            if (areObjects) {
                if (!this.areCardsEqual(val1, val2)) {
                    return false; // Nested objects are not equal
                }
            } else if (Array.isArray(val1) && Array.isArray(val2)) {
                if (val1.length !== val2.length || !val1.every((v, i) => this.areCardsEqual(val1[i], val2[i]))) {
                    return false; // Arrays are not equal
                }
            } else if (val1 !== val2) {
                return false; // Primitive values are not equal
            }
        }
    
        return true; // Objects are considered equal
    }
    
    isObject(object) {
        return object != null && typeof object === 'object';
    }
    
}

export default CardJSONValidator;
