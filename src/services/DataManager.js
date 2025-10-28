import fs from 'node:fs/promises';
import path from 'node:path';

class DataManager {
    constructor(dataFolder = './data') {
        this.dataFolder = dataFolder;
    }

    async saveLibrary(library) {
        try {
            await fs.mkdir(this.dataFolder, { recursive: true });

            const booksPath = path.join(this.dataFolder, 'books.json');
            const usersPath = path.join(this.dataFolder, 'users.json');
            const loansPath = path.join(this.dataFolder, 'loans.json');

            const booksData = JSON.stringify(library.books, null, 2);
            const usersData = JSON.stringify(library.users, null, 2);
            const loansData = JSON.stringify(library.loans, null, 2);

            await Promise.all([
                fs.writeFile(booksPath, booksData),
                fs.writeFile(usersPath, usersData),
                fs.writeFile(loansPath, loansData)
            ]);

            return {
                booksCount: library.books.length,
                usersCount: library.users.length,
                loansCount: library.loans.length
            };

        } catch (err) {
            console.error('Error while saving library: ', err);
            throw err;
        }
    }

    async loadLibrary() {
        try {
            const readJson = async (filePath) => {

                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    return JSON.parse(content);

                } catch (err) {
                    return [];
                }
            };

            const booksPath = path.join(this.dataFolder, 'books.json');
            const usersPath = path.join(this.dataFolder, 'users.json');
            const loansPath = path.join(this.dataFolder, 'loans.json');

            const [books, users, loans] = await Promise.all([
                readJson(booksPath),
                readJson(usersPath),
                readJson(loansPath)
            ]);

            return { books, users, loans };

        } catch (err) {
            console.error('Error loading library:', err);
            return { books: [], users: [], loans: [] };
        }
    }

    async clearAllData() {
        try {
            const files = await fs.readdir(this.dataFolder).catch(() => []);
            const jsonFiles = files.filter(file => file.endsWith('.json'));

            await Promise.all(
                jsonFiles.map(file =>
                    fs.unlink(path.join(this.dataFolder, file))
                )
            );

            return jsonFiles.length;

        } catch (err) {
            console.error('Error clearing data:', err);
            return 0;
        }
    }
}

export default DataManager;