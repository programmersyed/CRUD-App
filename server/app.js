const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const dbService = require('./dbService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve Static Files
app.use(express.static(path.join(__dirname, '..', 'client')));

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// Create
app.post('/insert', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const db = dbService.getDbServiceInstance();

    const result = db.insertNewName(name);

    result
        .then(data => res.json({ success: true, data }))
        .catch(err => {
            console.error('Error inserting data:', err);
            res.status(500).json({ success: false, message: 'Failed to insert data' });
        });
});

// Read
app.get('/getAll', (req, res) => {
    const db = dbService.getDbServiceInstance();

    const result = db.getAllData();

    result
        .then(data => res.json({ success: true, data }))
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).json({ success: false, message: 'Failed to fetch data' });
        });
});

// Update
app.patch('/update', (req, res) => {
    const { id, name } = req.body;
    if (!id || !name) {
        return res.status(400).json({ success: false, message: 'ID and Name are required' });
    }

    const db = dbService.getDbServiceInstance();

    const result = db.updateNameById(id, name);

    result
        .then(data => res.json({ success: true, updated: data }))
        .catch(err => {
            console.error('Error updating data:', err);
            res.status(500).json({ success: false, message: 'Failed to update data' });
        });
});

// Delete
app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: 'ID is required' });
    }

    const db = dbService.getDbServiceInstance();

    const result = db.deleteRowById(id);

    result
        .then(data => res.json({ success: true, deleted: data }))
        .catch(err => {
            console.error('Error deleting data:', err);
            res.status(500).json({ success: false, message: 'Failed to delete data' });
        });
});

// Search
app.get('/search/:name', (req, res) => {
    const { name } = req.params;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const db = dbService.getDbServiceInstance();

    const result = db.searchByName(name);

    result
        .then(data => res.json({ success: true, data }))
        .catch(err => {
            console.error('Error searching data:', err);
            res.status(500).json({ success: false, message: 'Failed to search data' });
        });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
