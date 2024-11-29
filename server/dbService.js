const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

// Database connection
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DB_PORT,
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Database connected:', connection.state);
    }
});

class DbService {
    static instance = null;

    static getDbServiceInstance() {
        return this.instance ? this.instance : new DbService();
    }

    // Fetch all data
    async getAllData() {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = 'SELECT * FROM names;';

                connection.query(query, (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error) {
            console.error('Error in getAllData:', error.message);
            throw error;
        }
    }

    // Insert new name
    async insertNewName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = 'INSERT INTO names (name) VALUES (?);';

                connection.query(query, [name], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve({ id: result.insertId, name });
                });
            });
            return response;
        } catch (error) {
            console.error('Error in insertNewName:', error.message);
            throw error;
        }
    }

    // Update name by ID
    async updateNameById(id, name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = 'UPDATE names SET name = ? WHERE id = ?;';

                connection.query(query, [name, id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows > 0);
                });
            });
            return response;
        } catch (error) {
            console.error('Error in updateNameById:', error.message);
            throw error;
        }
    }

    // Delete row by ID
    async deleteRowById(id) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = 'DELETE FROM names WHERE id = ?;';

                connection.query(query, [id], (err, result) => {
                    if (err) reject(new Error(err.message));
                    resolve(result.affectedRows > 0);
                });
            });
            return response;
        } catch (error) {
            console.error('Error in deleteRowById:', error.message);
            throw error;
        }
    }

    // Search by name
    async searchByName(name) {
        try {
            const response = await new Promise((resolve, reject) => {
                const query = 'SELECT * FROM names WHERE name LIKE ?;';

                connection.query(query, [`%${name}%`], (err, results) => {
                    if (err) reject(new Error(err.message));
                    resolve(results);
                });
            });
            return response;
        } catch (error) {
            console.error('Error in searchByName:', error.message);
            throw error;
        }
    }
}

module.exports = DbService;
