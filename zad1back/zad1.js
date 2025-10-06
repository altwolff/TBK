// Zad. 1 - Jakub Kłos (s29749)

String.prototype.reverse = function () {
    return this.split('').reverse().join('');
};


String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};


String.prototype.truncate = function (length) {
    return this.slice(0, length) + "...";
};


// Array prototypes:

Array.prototype.myEvery = function (callback) {
    for (let i = 0; i < this.length; i++) {
        if (!callback(this[i], i, this)) {
            return false
        }
    }
    return true;
};


Array.prototype.myFilter = function (callback) {
    let newArray = [];
    for (let i = 0; i < this.length; i++) {
        if (callback(this[i], i, this)) {
            newArray.push(this[i]);
        }
    }
    return newArray;
};


Array.prototype.groupBy = function (key) {
    const result = {};
    this.forEach(item => {
        const group = item[key];

        if (!result[group]) {
            result[group] = [];
        }

        result[group].push(item);
    });

    return result;
};


Array.prototype.unique = function () {
    const uniqueArray = [];
    this.forEach(item => {
        if (!uniqueArray.includes(item)) {
            uniqueArray.push(item);
        }
    });

    return uniqueArray;

};


// Klasy pomocnicze:
class DateUtils {
    static isLeapYear(year) {
        return (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0));
    }

    static getDaysBetween(date1, date2) {
        const diffInMs = date2 - date1;
        return diffInMs / (1000 * 60 * 60 * 24);
    }

    static formatDate(date) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        return `${day}-${month}-${year}`;
    }

    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
}


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


class Book {
    constructor(title, author, isbn, publicationYear, totalCopies, borrowedCopies, genre) {
        this.title = title;
        this.author = author;
        this.isbn = isbn;
        this.publicationYear = publicationYear;
        this.totalCopies = totalCopies;
        this.borrowedCopies = borrowedCopies;
        this.genre = genre;
    }

    get availableCopies() {
        return this.totalCopies - this.borrowedCopies;
    }

    get isAvailable() {
        return (this.availableCopies > 0);
    }

    get info() {
        return `Title: ${this.title}
    Author: ${this.author}
    ISBN: ${this.isbn}
    Publication Year: ${this.publicationYear}
    Genre: ${this.genre}`;
    }

    get age() {
        const currentYear = new Date().getFullYear();
        return currentYear - this.publicationYear;
    }

    set copies({ total, borrowed }) {
        if (typeof total !== "number" || total < 0) {
            throw new Error("Total copies cannot be less than 0.");
        }
        if (typeof borrowed !== "number" || borrowed < 0 || borrowed > total) {
            throw new Error("Borrowed copies must be between 0 and total copies.");
        }
        this.totalCopies = total;
        this.borrowedCopies = borrowed;
    }

    set details({ title, author, genre }) {
        if (title !== undefined) this.title = title;
        if (author !== undefined) this.author = author;
        if (genre !== undefined) this.genre = genre;
    }

    borrow() {
        if (!this.isAvailable) {
            throw new Error("No copies available.");
        }
        this.borrowedCopies += 1;
    }


    return() {
        if (this.borrowedCopies <= 0) {
            throw new Error("No copies left to return.");
        }
        this.borrowedCopies -= 1;
    }

    getFormattedInfo() {
        return `Title: ${this.title}
        Author: ${this.author}
        ISBN: ${this.isbn}
        Publication Year: ${this.publicationYear}
        Book Age: ${this.age} years
        Total Copies: ${this.totalCopies}
        Borrowed Copies: ${this.borrowedCopies}
        Available Copies: ${this.availableCopies}
        Genre: ${this.genre}
        Available: ${this.isAvailable ? "Yes" : "No"}`;
    }

    isValidBook(bookData) {
        return Validator.isValidISBN(bookData.isbn) &&
            Validator.isValidYear(bookData.publicationYear) &&
            Validator.isValidPageCount(bookData.totalCopies);
    }

    compareByYear(book1, book2) {
        return book1.publicationYear - book2.publicationYear;
    }

}


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


class Library {
    constructor(name, maxBooksPerUser = 5) {
        this.name = name;
        this.books = [];
        this.users = [];
        this.loans = [];
        this.maxBooksPerUser = maxBooksPerUser;
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
}

function swapElements([el1, el2]) {
    [el1, el2] = [el2, el1];
    return [el1, el2];
}

function mergeArrays(...arrays) {
    return [].concat(...arrays);
}

function uniqueValues(array) {
    return [...new Set(array)];
}

function extendObject(obj1, obj2) {
    return { ...obj1, ...obj2 };
}

function cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function pickProperties(obj, keys) {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

function createBook({ title, author, isbn, publicationYear, totalCopies = 1, genre = "Other" }) {
    return {
        title,
        author,
        isbn,
        publicationYear,
        totalCopies,
        borrowedCopies: 0,
        genre
    };
}

function createUser({ name, email, registrationDate = new Date() }) {
    return {
        name,
        email,
        registrationDate,
        borrowedBooks: [],
        borrowHistory: []
    };
}

function createLoan({ userEmail, isbn, borrowDate = new Date(), dueDate }) {
    return {
        userEmail,
        isbn,
        borrowDate,
        dueDate
    };
}

function sortBooksByYear(books, order = 'asc') {
    return books.slice().sort((a, b) => {
        return order === 'asc'
            ? a.publicationYear - b.publicationYear
            : b.publicationYear - a.publicationYear;
    });
}

function filterAvailableBooks(books) {
    return books.filter(book => book.totalCopies - book.borrowedCopies > 0);
}

function groupBooksByGenre(books) {
    return books.reduce((acc, book) => {
        const genre = book.genre || "Other";
        if (!acc[genre]) acc[genre] = [];
        acc[genre].push(book);
        return acc;
    }, {});
}

function calculateStatistics(books, users, loans) {
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.totalCopies - book.borrowedCopies > 0).length;
    const totalUsers = users.length;
    const activeLoans = loans.length;

    return {
        totalBooks,
        availableBooks,
        totalUsers,
        activeLoans
    };
}



// TESTING:

const library = new Library("City Library");

const lotrBook = library.addBook({
    title: "The Lord of the Rings",
    author: "J.R.R. Tolkien",
    isbn: "9788324589456",
    publicationYear: 1954,
    totalCopies: 3,
    genre: "Fantasy"
});

const orwellBook = library.addBook(createBook({
    title: "1984",
    author: "George Orwell",
    isbn: "9788328708815",
    publicationYear: 1949,
    totalCopies: 2,
    genre: "Dystopia"
}));

library.registerUser({
    name: "John Smith",
    email: "john.smith@example.com"
});

library.registerUser(createUser({
    name: "Anna Nowak",
    email: "anna.nowak@example.com"
}));

library.borrowBook("john.smith@example.com", "9788324589456");
library.borrowBook("anna.nowak@example.com", "9788328708815");

const tolkienBooks = library.findBooksByAuthor("Tolkien");
const fantasyBooks = library.findBooksByGenre("Fantasy");

console.log(library.statistics);
console.log(library.generateReport());

library.returnBook("john.smith@example.com", "9788324589456");

const title = "the lord of the rings";
console.log(title.capitalize());
console.log(title.reverse());

const numbers = [1, 2, 3, 4, 5];
console.log(numbers.myEvery(n => n > 0));     
console.log(numbers.myFilter(n => n % 2 === 0));

const [book1, book2] = swapElements([lotrBook, orwellBook]);
const allBooks = mergeArrays(fantasyBooks, tolkienBooks);
const extended = extendObject(book1, { genre: "Epic Fantasy" });
