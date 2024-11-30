const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');

const router = express.Router();

// Mock Database (for testing purposes)
const users = [];

// Serve Signup Page
router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'signup.html'));
});

// Handle Signup
router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).send('All fields are required');
    }

    // Check if username already exists
    if (users.some(user => user.username === username)) {
        return res.status(400).send('Username already exists');
    }

    // Hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.redirect('/auth/login');
});
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'faculty.html'));
});
// Serve Login Page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'login.html'));
});

// Handle Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).send('All fields are required');
    }

    const user = users.find(u => u.username === username);

    // Authenticate user
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = { username: user.username };
        res.redirect('/');
    } else {
        res.status(400).send('Invalid credentials');
    }
});
app.get('/', (req, res) => {
    console.log('Session:', req.session); // Debugging session data

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
                ${
                    username
                        ? `<h1>Welcome, ${username}!</h1>`
                        : `<h1>Welcome to Syed Academy</h1>`
                }
                <p>Explore our website to learn more about our institution, faculty, and student opportunities.</p>
            </main>
        </body>
        </html>
    `);
});

// Handle Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;
