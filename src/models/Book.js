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

export default Book;
