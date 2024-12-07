const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Middleware to parse JSON
app.use(express.json());

// Initialize the database and create the table if it doesn’t exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER NOT NULL
        )
    `);
});

// API routes

// Get all items
app.get('/inventory', (req, res) => {
    db.all('SELECT * FROM inventory', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Add a new item
app.post('/inventory', (req, res) => {
    const { name, quantity } = req.body;
    db.run('INSERT INTO inventory (name, quantity) VALUES (?, ?)', [name, quantity], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, name, quantity });
    });
});

// Update an item by ID
app.put('/inventory/:id', (req, res) => {
    const { id } = req.params;
    const { name, quantity } = req.body;
    db.run(
        'UPDATE inventory SET name = ?, quantity = ? WHERE id = ?',
        [name, quantity, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: 'Item updated successfully' });
        }
    );
});

// Delete an item by ID
app.delete('/inventory/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM inventory WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Item deleted successfully' });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});