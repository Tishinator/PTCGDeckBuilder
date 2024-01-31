class ImportValidator {
    constructor(text) {
        this.text = text;
    }

    validate() {
        if (this.isCSVFormat()) {
            return this.validateCSVFormat();
        } else if (this.isListFormat()) {
            return this.validateListFormat();
        } else {
            return false;
        }
    }

    isCSVFormat() {
        return this.text.trim().startsWith("QTY,Name,Type,URL");
    }

    isListFormat() {
        return /Pokémon: \d+/.test(this.text) && /Trainer: \d+/.test(this.text) && /Energy: \d+/.test(this.text);
    }

    validateCSVFormat() {
        const lines = this.text.trim().split('\n');
        if (lines.length < 2) return false; // At least one line of data besides headers

        for (let i = 1; i < lines.length; i++) {
            const fields = lines[i].split(',');
            if (fields.length !== 4 || isNaN(parseInt(fields[0]))) {
                return false;
            }
        }
        return true;
    }

    validateListFormat() {
        const sections = this.text.trim().split('\n\n');
        for (const section of sections) {
            if (section.startsWith('Total Cards: ')) {
                continue; // Skip validation for Total Cards section
            }

            const lines = section.split('\n');
            if (lines.length < 2) return false; // Each section should have at least one line of data

            for (let i = 1; i < lines.length; i++) {
                if (!/^\d+ .+/.test(lines[i])) {
                    return false; // Validates line starts with a number followed by space and text
                }
            }
        }

        return true;
    }
}

export default ImportValidator;

// // Usage
// const validator = new DecklistValidator(yourTextareaContent);
// const isValid = validator.validate();
