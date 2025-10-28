class Validator {
    static isValidISBN(isbn) {
        const str = String(isbn);
        return str.length === 13 && /^\d{13}$/.test(str);
    }

    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidYear(year) {
        const now = new Date().getFullYear();
        return (1000 < year && year <= now);
    }

    static isValidPageCount(pages) {
        return (pages > 0);
    }
}