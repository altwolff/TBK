// Zad. 3 - Jakub Kłos (s29749)

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
        this.database = new AsyncDatabase();
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

    async addBookAsync(bookData) {
        if (!Validator.isValidISBN(bookData.isbn)) throw new Error("Invalid ISBN");
        const book = new Book(
            bookData.title ?? "Unknown",
            bookData.author ?? "Unknown",
            bookData.isbn,
            bookData.publicationYear ?? new Date().getFullYear(),
            bookData.totalCopies ?? 1,
            bookData.borrowedCopies ?? 0,
            bookData.genre ?? "General"
        );
        await this.database.save(`book_${book.isbn}`, book);
        this.books.push(book);
        return book;
    }

    async getBookAsync(isbn) {
        return this.database.get(`book_${isbn}`);
    }

    async removeBookAsync(isbn) {
        const book = await this.getBookAsync(isbn);
        if (!book) throw new Error("Book not found");
        if (book.borrowedCopies > 0) throw new Error("Cannot remove borrowed book");
        await this.database.delete(`book_${isbn}`);
        this.books = this.books.filter(b => b.isbn !== isbn);
    }

    async registerUserAsync(userData) {
        if (!Validator.isValidEmail(userData.email)) throw new Error("Invalid email");
        const user = new User(userData.name ?? "Anonymous", userData.email);
        await this.database.save(`user_${user.email}`, user);
        this.users.push(user);
        return user;
    }

    async getUserAsync(email) {
        return this.database.get(`user_${email}`);
    }

    async borrowBookAsync(userEmail, isbn) {
        const [user, book] = await Promise.all([this.getUserAsync(userEmail), this.getBookAsync(isbn)]);
        if (!user) throw new Error("User not found");
        if (!book) throw new Error("Book not found");
        if (!book.isAvailable) throw new Error("No copies available");
        if (!user.canBorrow) throw new Error("User reached borrowing limit");

        book.borrow();
        user.addBorrowedBook(isbn, book.title);

        await Promise.all([
            this.database.save(`book_${isbn}`, book),
            this.database.save(`user_${userEmail}`, user),
            this.database.save(`loan_${userEmail}_${isbn}`, { userEmail, isbn, borrowDate: new Date() })
        ]);

        this.loans.push({ userEmail, isbn, borrowDate: new Date() });
        return { user, book };
    }

    async returnBookAsync(userEmail, isbn) {
        const [user, book] = await Promise.all([this.getUserAsync(userEmail), this.getBookAsync(isbn)]);
        if (!user || !book) throw new Error("User or book not found");

        book.return();
        user.removeBorrowedBook(isbn);

        await Promise.all([
            this.database.save(`book_${isbn}`, book),
            this.database.save(`user_${userEmail}`, user),
            this.database.delete(`loan_${userEmail}_${isbn}`)
        ]);

        this.loans = this.loans.filter(loan => !(loan.userEmail === userEmail && loan.isbn === isbn));
        return { user, book };
    }

    async initializeLibraryAsync(booksData, usersData) {
        const bookPromises = booksData.map(b => this.addBookAsync(b));
        const userPromises = usersData.map(u => this.registerUserAsync(u));

        const books = await Promise.all(bookPromises);
        const users = await Promise.all(userPromises);

        return { books, users, total: books.length + users.length };
    }

    async getMultipleBooksAsync(isbns) {
        const books = await Promise.all(isbns.map(isbn => this.getBookAsync(isbn)));
        return books.filter(b => b !== null);
    }

    async batchBorrowBooksAsync(userEmail, isbns) {
        return Promise.all(isbns.map(isbn => this.borrowBookAsync(userEmail, isbn)));
    }

    async searchWithTimeout(searchFunction, timeoutMs = 3000) {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeoutMs));
        return Promise.race([searchFunction(), timeoutPromise]);
    }

    async getFastestResult(operations) {
        return Promise.race(operations.map(op => op()));
    }

    async findBookAnywhere(isbn) {
        const local = () => this.getBookAsync(isbn);
        const db = () => this.database.get(`book_${isbn}`);
        const externalAPI = () => new Promise((res, rej) =>
            setTimeout(() => Math.random() < 0.7 ? res(createBook({ title: "External Book", author: "API", isbn })) : rej("Not found"), 300)
        );

        try {
            const book = await Promise.any([local(), db(), externalAPI()]);
            const source = book.title === "External Book" ? "externalAPI" : "database";
            return { book, source };
        } catch {
            return null;
        }
    }

    async verifyUserInMultipleSystems(email) {
        const checkSystem = () => new Promise((res, rej) =>
            setTimeout(() => Math.random() < 0.3 ? rej(false) : res(true), 200)
        );

        try {
            await Promise.any([checkSystem(), checkSystem(), checkSystem()]);
            return true;
        } catch {
            return false;
        }
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


class AsyncDatabase {
    constructor(delay = 500) {
        this.delay = delay;
        this.data = new Map();
    }

    _simulateNetwork(value) {
        const effectiveDelay = Math.random() < 0.1 ? this.delay * 2 : this.delay;
        return new Promise(resolve => setTimeout(() => resolve(value), effectiveDelay));
    }

    save(key, value) {
        return this._simulateNetwork().then(() => {
            this.data.set(key, value);
            return value;
        });
    }

    get(key) {
        return this._simulateNetwork().then(() => this.data.get(key) ?? null);
    }

    delete(key) {
        return this._simulateNetwork().then(() => this.data.delete(key));
    }

    getAll() {
        return this._simulateNetwork().then(() => Array.from(this.data.values()));
    }

    clear() {
        const size = this.data.size;
        this.data.clear();
        return this._simulateNetwork().then(() => size);
    }
}


Library.prototype.initializeLibraryAsync = async function(booksData, usersData) {
    const bookPromises = booksData.map(b => this.addBookAsync(b));
    const userPromises = usersData.map(u => this.registerUserAsync(u));

    const books = await Promise.all(bookPromises);
    const users = await Promise.all(userPromises);

    return { books, users, total: books.length + users.length };
};

Library.prototype.getMultipleBooksAsync = async function(isbns) {
    const books = await Promise.all(isbns.map(isbn => this.getBookAsync(isbn)));
    return books.filter(b => b !== null);
};

Library.prototype.batchBorrowBooksAsync = async function(userEmail, isbns) {
    return Promise.all(isbns.map(isbn => this.borrowBookAsync(userEmail, isbn)));
};


function createTimeout(ms, errorMessage = "Timeout") {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(errorMessage)), ms));
}

Library.prototype.searchWithTimeout = async function(searchFunction, timeoutMs = 3000) {
    return Promise.race([searchFunction(), createTimeout(timeoutMs)]);
};

Library.prototype.getFastestResult = async function(operations) {
    return Promise.race(operations.map(op => op()));
};


Library.prototype.findBookAnywhere = async function(isbn) {
    const local = async () => this.getBookAsync(isbn);
    const db = async () => this.database.get(`book_${isbn}`);
    const externalAPI = async () => new Promise((res, rej) => {
        setTimeout(() => Math.random() < 0.7 ? res(createBook({ title: "External Book", author: "API", isbn })) : rej("Not found"), 300);
    });

    try {
        const book = await Promise.any([local(), db(), externalAPI()]);
        const source = book.title === "External Book" ? "externalAPI" : "database";
        return { book, source };
    } catch {
        return null;
    }
};

Library.prototype.verifyUserInMultipleSystems = async function(email) {
    const checkSystem = async () => new Promise((res, rej) => {
        setTimeout(() => Math.random() < 0.3 ? rej(false) : res(true), 200);
    });

    try {
        await Promise.any([checkSystem(), checkSystem(), checkSystem()]);
        return true;
    } catch {
        return false;
    }
};



// TESTING:

(async () => {
    const library = new Library("City Library");

    console.log("=== Adding books asynchronously ===");
    const booksData = [
        { title: "The Lord of the Rings", author: "J.R.R. Tolkien", isbn: "9788324589456", publicationYear: 1954, totalCopies: 3, genre: "Fantasy" },
        { title: "1984", author: "George Orwell", isbn: "9788328708815", publicationYear: 1949, totalCopies: 2, genre: "Dystopia" },
        { title: "Clean Code", author: "Robert C. Martin", isbn: "9780132350884", publicationYear: 2008, totalCopies: 1, genre: "Programming" }
    ];

    const usersData = [
        { name: "John Smith", email: "john.smith@example.com" },
        { name: "Anna Nowak", email: "anna.nowak@example.com" }
    ];

    const { books, users, total } = await library.initializeLibraryAsync(booksData, usersData);
    console.log(`Initialized ${books.length} books and ${users.length} users (total ${total})`);

    console.log("\n=== Fetching a single book ===");
    const lotr = await library.getBookAsync("9788324589456");
    console.log(lotr.getFormattedInfo());

    console.log("\n=== Borrowing books asynchronously ===");
    await library.borrowBookAsync("john.smith@example.com", "9788324589456");
    await library.borrowBookAsync("anna.nowak@example.com", "9788328708815");

    console.log("\n=== Fetching multiple books ===");
    const multipleBooks = await library.getMultipleBooksAsync(["9788324589456", "9788328708815", "9780132350884"]);
    multipleBooks.forEach(b => console.log(`• ${b.title} (Available: ${b.isAvailable})`));

    console.log("\n=== Returning a book ===");
    await library.returnBookAsync("john.smith@example.com", "9788324589456");
    const updatedLotr = await library.getBookAsync("9788324589456");
    console.log(`${updatedLotr.title} available copies: ${updatedLotr.availableCopies}`);

    console.log("\n=== Finding book anywhere ===");
    const foundBook = await library.findBookAnywhere("9780132350884");
    console.log(`Found "${foundBook.book.title}" in ${foundBook.source}`);

    console.log("\n=== Verifying user across multiple systems ===");
    const isVerified = await library.verifyUserInMultipleSystems("anna.nowak@example.com");
    console.log(`User verified: ${isVerified}`);

    console.log("\n=== Testing batch borrow ===");
    const batchBorrow = await library.batchBorrowBooksAsync("john.smith@example.com", ["9780132350884"]);
    console.log("Batch borrow completed");

    console.log("\n=== Library Statistics ===");
    console.log(library.statistics);
})();
