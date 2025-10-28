class User {
    constructor(name, email) {
        this.name = name
        this.email = email
        this.registrationDate = new Date()
        this.borrowedBooks = []
        this.borrowHistory = []
    }


    get canBorrow() {
        return this.borrowedBooks.length < 5;
    }

    get borrowCount() {
        return this.borrowedBooks.length;
    }

    get profile() {
        return {
            name: this.name,
            email: this.email,
            registrationDate: this.registrationDate,
            borrowedBooks: this.borrowedBooks,
            borrowHistory: this.borrowHistory,
        };
    }

    set info({ name, email }) {
        if (name) this.name = name;
        if (email) this.email = email;
    }

    addBorrowedBook(isbn, bookTitle) {
        if (!this.canBorrow) {
            throw new Error("Book limit reached.");
        }
        const borrowedBook = {
            isbn,
            title: bookTitle,
            borrowDate: new Date()
        };

        this.borrowedBooks.push(borrowedBook);
        this.borrowHistory.push(borrowedBook);
    }

    removeBorrowedBook(isbn) {
        const index = this.borrowedBooks.findIndex(book => book.isbn === isbn);
        if (index === -1) {
            throw new Error("Book not found in borrowed books.");
        }

        this.borrowedBooks.splice(index, 1);
    }


    getBorrowHistory() {
        return this.borrowHistory;
    }


    getFormattedHistory() {
        const historyDetails = this.borrowHistory
            .map(book => `• ${book.title} (ISBN: ${book.isbn}) borrowed on ${book.borrowDate.toLocaleDateString()}`)
            .join('\n');

        return `User: ${this.name}
    Email: ${this.email}
    No. Borrowed Books: ${this.borrowCount}
    Account History:
    ${historyDetails}`;
    }


    hasOverdueBooks(days) {
        let overdue = false;
        const now = new Date();

        this.borrowedBooks.forEach(book => {
            const diffTime = now - book.borrowDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);

            if (diffDays > days) {
                overdue = true;
            }
        });

        return overdue;
    }
}

export default User;
