class CardJSONValidator {
    constructor() {
        // Define unique keys for each type of object
        this.databaseUniqueKeys = ['id', 'supertype', 'subtypes'];
        this.internalSetUniqueKeys = ['image', 'category'];
        this.formattedDeckAllKeys = ['count']
    }

    isDatabaseCard(card) {
        // Check if all unique database keys are in the card object
        return this.databaseUniqueKeys.every(key => card.hasOwnProperty(key));
    }

    isInternalSetCard(card) {
        // Check if all unique internal set keys are in the card object
        return this.internalSetUniqueKeys.every(key => card.hasOwnProperty(key));
    }

    isFormattedDeckCard(card) {
        // Check if all unique database keys are in the card object
        return this.formattedDeckAllKeys.every(key => card.hasOwnProperty(key));
    }

    determineCardType(card) {
        if (this.isDatabaseCard(card)) {
            return 'DatabaseCard';
        } else if (this.isInternalSetCard(card)) {
            return 'InternalSetCard';
        } else if (this.isFormattedDeckCard(card)){
            return 'FormattedDeckCard';
        } else {
            return 'Unknown';
        }
    }

    areCardsEqual(obj1, obj2) {
        const obj1Keys = Object.keys(obj1);
        const obj2Keys = Object.keys(obj2);
    
        // Adjust key length check to handle the "count" field condition
        if (obj1Keys.length !== obj2Keys.length) {
            if (!((obj1Keys.includes("count") && !obj2Keys.includes("count")) || (obj2Keys.includes("count") && !obj1Keys.includes("count")))) {
                return false;
            }
        }
    
        for (let key of obj1Keys) {
            // Skip the "count" field if it's not present in both objects
            if (key === 'count' && (!obj2Keys.includes(key))) {
                continue;
            }
    
            const val1 = obj1[key];
            const val2 = obj2[key];
    
            const areObjects = this.isObject(val1) && this.isObject(val2);
            if (
                areObjects && !this.areCardsEqual(val1, val2) ||
                !areObjects && val1 !== val2
            ) {
                return false;
            }
        }
    
        return true;
    }
    
    isObject(object) {
        return object != null && typeof object === 'object';
    }
}
    
export default CardJSONValidator;