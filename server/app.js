const express = require('express');
const session = require('express-session');
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

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));
function isSignedUp(req, res, next) {
    if (req.session.user) {
        next(); // User is signed up, proceed to the next middleware/route
    } else {
        res.status(401).send('<h1>401 Unauthorized</h1><p>You must sign up and log in to access this page.</p><a href="/signup">Sign Up</a>');
    }
}

// Serve Static Files
app.use(express.static(path.join(__dirname, '..', 'client')));

// Root Route
app.get('/', (req, res) => {
    const username = req.session.user ? req.session.user.username : null;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="/stylesheet.css">
            <title>School Website</title>
        </head>
        <body>
            <header>
                <div class="header-logo">Syed Academy</div>
                <nav>
                    <ul>
                        <li><a href="/about-school">About School</a></li>
                        <li><a href="/faculty">Faculty</a></li>
                        <li><a href="/admissions">Admissions</a></li>
                        <li><a href="/awards-results">Awards & Results</a></li>
                        <li><a href="/events">Events</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/courses">Courses</a></li>
                    </ul>
                </nav>
                ${
                    username
                        ? `<button onclick="window.location.href='/auth/logout';">${username}</button>`
                        : `<button onclick="window.location.href='/login';">Login</button>`
                }
            </header>
            <main>
                <h1>Welcome to Syed Academy</h1>
                <p>Explore our website to learn more about our institution, faculty, and student opportunities.</p>
            </main>
        </body>
        </html>
    `);
});


// Static Routes for Other Pages
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'login.html')));
app.get('/signup', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'signup.html')));
// Protect faculty route
app.get('/faculty', isSignedUp, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'faculty.html'));
});

// Protect awards-results route
app.get('/awards-results', isSignedUp, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'client', 'awards-results.html'));
});

app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'contact.html')));
app.get('/admissions', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'admissions.html')));
app.get('/about-school', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'about-school.html')));
app.get('/courses', isSignedUp, (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'courses.html')));

// In-Memory User Storage
const users = [];

// Signup Route
app.post('/auth/signup', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    const userExists = users.some(user => user.username === username || user.email === email);
    if (userExists) {
        return res.status(400).send('User already exists');
    }

    users.push({ username, email, password });
    console.log('Users:', users);
    res.redirect('/login');
});

// Login Route
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('All fields are required');
    }

    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).send('Invalid username or password');
    }

    req.session.user = { username: user.username };
    res.redirect('/');
});

// Logout Route
app.get('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out');
    }
    res.redirect('/');
    });
});

// CRUD Routes
app.post('/insert', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const db = dbService.getDbServiceInstance();
    const result = db.insertNewName(name);

    result
        .then(data => res.json({ success: true, data }))
        .catch(err => res.status(500).json({ success: false, message: 'Failed to insert data' }));
});

app.get('/getAll', (req, res) => {
    const db = dbService.getDbServiceInstance();
    const result = db.getAllData();

    result
        .then(data => res.json({ success: true, data }))
        .catch(err => res.status(500).json({ success: false, message: 'Failed to fetch data' }));
});

app.patch('/update', (req, res) => {
    const { id, name } = req.body;
    if (!id || !name) {
        return res.status(400).json({ success: false, message: 'ID and Name are required' });
    }

    const db = dbService.getDbServiceInstance();
    const result = db.updateNameById(id, name);

    result
        .then(data => res.json({ success: true, updated: data }))
        .catch(err => res.status(500).json({ success: false, message: 'Failed to update data' }));
});

app.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: 'ID is required' });
    }

    const db = dbService.getDbServiceInstance();
    const result = db.deleteRowById(id);

    result
        .then(data => res.json({ success: true, deleted: data }))
        .catch(err => res.status(500).json({ success: false, message: 'Failed to delete data' }));
});

app.get('/search/:name', (req, res) => {
    const { name } = req.params;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const db = dbService.getDbServiceInstance();
    const result = db.searchByName(name);

    result
        .then(data => res.json({ success: true, data }))
        .catch(err => res.status(500).json({ success: false, message: 'Failed to search data' }));
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
