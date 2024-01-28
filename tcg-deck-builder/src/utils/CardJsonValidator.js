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
}
export default CardJSONValidator;