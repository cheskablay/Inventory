const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize the database
const dbPath = path.join(__dirname, 'data.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        // Create the table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS monitoring (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dr_no TEXT,
                dr_date TEXT,
                am_code TEXT,
                item TEXT,
                item_name TEXT,
                cust_name TEXT,
                ser_no TEXT,
                status TEXT,
                picture BLOB
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            }
        });
        db.run(`
            CREATE TABLE IF NOT EXISTS reports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dr_no TEXT,
                dr_date TEXT,
                am_code TEXT,
                item TEXT,
                item_name TEXT,
                cust_name TEXT,
                ser_no TEXT,
                status TEXT,
                picture BLOB
            )
        `, (err) => {
            if (err) {
                console.error('Error creating reports table:', err.message);
            }
        });
        db.run(`
            CREATE TABLE IF NOT EXISTS archive (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dr_no TEXT,
                dr_date TEXT,
                am_code TEXT,
                item TEXT,
                item_name TEXT,
                cust_name TEXT,
                ser_no TEXT,
                status TEXT,
                picture BLOB
            )
        `, (err) => {
            if (err) {
                console.error('Error creating archive table:', err.message);
            }
        });
    }
});

module.exports = db;