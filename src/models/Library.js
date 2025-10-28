import { EventEmitter } from 'node:events';
import Book from './Book.js';
import User from './User.js';
import { withTimeout } from '../services/utils.js';



class Library {
    constructor(name, maxBooksPerUser = 5) {
        this.name = name;
        this.books = [];
        this.users = [];
        this.loans = [];
        this.maxBooksPerUser = maxBooksPerUser;
        this.eventEmitter = new EventEmitter();
        this.eventHistory = [];

    }

    get totalBooks() {
        return this.books.length;
    }

    get availableBooks() {
        return this.books.filter(book => book.isAvailable).length;
    }

    get statistics() {
        return {
            name: this.name,
            totalBooks: this.totalBooks,
            availableBooks: this.availableBooks,
            totalUsers: this.users.length,
            activeLoans: this.loans.length
        };
    }

    addBook(bookData) {
        const {
            title = "Unknown",
            author = "Unknown",
            isbn,
            publicationYear = new Date().getFullYear(),
            totalCopies = 1,
            borrowedCopies = 0,
            genre = "General"
        } = bookData;

        if (!isbn) {
            throw new Error("ISBN is required to add a book.");
        }

        const existingBook = this.books.find(book => book.isbn === isbn);
        if (existingBook) {
            throw new Error("A book with this ISBN already exists.");
        }

        const newBook = new Book(title, author, isbn, publicationYear, totalCopies, borrowedCopies, genre);

        this.books.push(newBook);

        this.eventEmitter.emit('book:added', {
            book: newBook,
            timestamp: new Date()
        });

        return newBook;
    }

    removeBook(isbn) {
        const index = this.books.findIndex(book => book.isbn === isbn);

        if (index === -1) {
            throw new Error(`Book with ISBN ${isbn} not found.`);
        }

        this.books.splice(index, 1);
    }


    findBookByISBN(isbn) {
        return this.books.find(book => book.isbn === isbn);
    }

    findBooksByAuthor(author) {
        return this.books.filter(book => book.author.toLowerCase() === author.toLowerCase());
    }

    findBooksByGenre(genre) {
        return this.books.filter(book => book.genre.toLowerCase() === genre.toLowerCase());
    }

    updateBook(isbn, updates) {
        const book = this.findBookByISBN(isbn);
        if (!book) {
            throw new Error(`Book with ISBN ${isbn} not found.`);
        }

        Object.assign(book, updates);
    }

    registerUser(userData) {
        const {
            name = "Anonymous",
            email
        } = userData;

        if (!email) {
            throw new Error("Email is required to register a user.");
        }

        const existingUser = this.users.find(user => user.email === email);
        if (existingUser) {
            throw new Error("User with this email already exists.");
        }

        const newUser = new User(name, email);
        this.users.push(newUser);

        this.eventEmitter.emit('user:registered', {
            user: newUser,
            timestamp: new Date()
        });

    }


    removeUser(email) {
        const index = this.users.findIndex(user => user.email === email);

        if (index === -1) {
            throw new Error(`User with email ${email} not found.`);
        }

        this.users.splice(index, 1);
    }

    findUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    updateUser(email, updates) {
        const user = this.findUserByEmail(email);
        if (!user) {
            throw new Error(`User with email ${email} not found.`);
        }

        Object.assign(user, updates);
    }

    borrowBook(userEmail, isbn) {
        const user = this.findUserByEmail(userEmail);
        if (!user) {
            throw new Error(`User with email ${userEmail} not found.`);
        }

        const book = this.findBookByISBN(isbn);
        if (!book) {
            throw new Error(`Book with ISBN ${isbn} not found.`);
        }

        if (!book.isAvailable) {
            throw new Error(`No available copies of "${book.title}".`);
        }

        if (!user.canBorrow) {
            throw new Error(`${user.name} has reached the borrowing limit.`);
        }

        book.borrow();
        user.addBorrowedBook(isbn, book.title);

        this.loans.push({
            userEmail,
            isbn,
            borrowDate: new Date()
        });

        this.eventEmitter.emit('loan:created', {
            userEmail,
            isbn,
            bookTitle: book.title,
            timestamp: new Date()
        });

    }


    returnBook(userEmail, isbn) {
        const user = this.findUserByEmail(userEmail);
        if (!user) {
            throw new Error(`User with email ${userEmail} not found.`);
        }

        const book = this.findBookByISBN(isbn);
        if (!book) {
            throw new Error(`Book with ISBN ${isbn} not found.`);
        }

        const loanIndex = this.loans.findIndex(
            loan => loan.userEmail === userEmail && loan.isbn === isbn
        );

        if (loanIndex === -1) {
            throw new Error(`${user.name} did not borrow "${book.title}".`);
        }

        book.return();
        user.removeBorrowedBook(isbn);

        this.loans.splice(loanIndex, 1);

        this.eventEmitter.emit('loan:returned', {
            userEmail,
            isbn,
            bookTitle: book.title,
            timestamp: new Date()
        });

    }


    getUserLoans(userEmail) {
        return this.loans.filter(loan => loan.userEmail === userEmail);
    }


    getOverdueLoans(days) {
        const now = new Date();
        return this.loans.filter(loan => {
            const diffTime = now - new Date(loan.borrowDate);
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            return diffDays > days;
        });
    }

    getPopularBooks(limit = 5) {
        return this.books.slice().sort((a, b) => b.borrowedCopies - a.borrowedCopies).slice(0, limit);
    }

    getActiveUsers(limit = 5) {
        return this.users.slice().sort((a, b) => b.borrowHistory.length - a.borrowHistory.length).slice(0, limit);
    }


    generateReport() {
        const popularBooks = this.getPopularBooks(5).map(book => `• ${book.title} (Borrowed: ${book.borrowedCopies})`).join("\n");

        const activeUsers = this.getActiveUsers(5).map(user => `• ${user.name} (Borrowed: ${user.borrowHistory.length})`).join("\n");

        return `
    Library: ${this.name}
    Total Books: ${this.totalBooks}
    Available Books: ${this.availableBooks}
    Total Users: ${this.users.length}
    Active Loans: ${this.loans.length}
    
    Top 5 Popular Books:
    ${popularBooks}
    
    Top 5 Active Users:
    ${activeUsers}`;
    }


    on(eventName, handler) {
        this.eventEmitter.on(eventName, (data) => {
            this.eventHistory.push({ eventName, data });
            if (this.eventHistory.length > 50) {
                this.eventHistory.shift();
            }

            handler(data);
        });
    }

    getEventHistory(limit = 10) {
        return this.eventHistory.slice(-limit);
    }

    getEventStats() {
        const counts = {};
        for (const ev of this.eventHistory) {
            counts[ev.eventName] = (counts[ev.eventName] || 0) + 1;
        }

        const first = this.eventHistory[0];
        const last = this.eventHistory[this.eventHistory.length - 1];

        return {
            eventCounts: counts,
            totalEvents: this.eventHistory.length,
            lastEvent: last,
            firstEventTime: first?.data.timestamp || null,
            lastEventTime: last?.data.timestamp || null
        };
    }

    async initializeFromData(booksData, usersData) {
        let addedBooks = 0, failedBooks = 0;
        let addedUsers = 0, failedUsers = 0;

        await Promise.all(booksData.map(async (b) => {
            try { await this.addBook(b); addedBooks++; } catch { failedBooks++; }
        }));

        await Promise.all(usersData.map(async (u) => {
            try { await this.registerUser(u); addedUsers++; } catch { failedUsers++; }
        }));

        return { addedBooks, addedUsers, failedBooks, failedUsers };
    }


    async saveWithTimeout(dataManager, timeoutMs = 5000) {
        return withTimeout(
            dataManager.saveLibrary(this),
            timeoutMs,
            'saveLibrary'
        );
    }

    async findBookFromMultipleSources(isbn) {
        const searchLocal = async () => {
            const book = this.findBookByISBN(isbn);
            if (book) return { book, source: 'local' };
            throw new Error('Not in local');
        };
    
        const searchCache = async () => {
            await new Promise(r => setTimeout(r, 100));
            if (Math.random() > 0.2) return { book: {/*...*/}, source: 'cache' };
            throw new Error('Not in cache');
        };
    
        const searchAPI = async () => {
            await new Promise(r => setTimeout(r, 500));
            if (Math.random() > 0.5) return { book: {/*...*/}, source: 'api' };
            throw new Error('API failed');
        };
    
        try {
            return await Promise.any([searchLocal(), searchCache(), searchAPI()]);
        } catch {
            return null;
        }
    }

}

export default Library;
