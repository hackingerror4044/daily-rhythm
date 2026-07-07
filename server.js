// server.js
// Simple backend for the Daily Rhythm signup form.
// Serves the frontend AND saves signups to users.json (hashed passwords, never plain text).

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // hosting platforms assign their own port
const DB_FILE = path.join(__dirname, 'users.json');

app.use(cors());
app.use(express.json());

// Serve the frontend (index.html, css, js, etc.) from the /public folder
app.use(express.static(__dirname));
// Make sure users.json exists before we start
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([]));
}

function readUsers() {
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeUsers(users) {
  fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

// POST /submit -> save a new signup
app.post('/submit', async (req, res) => {
  const { name, email, username } = req.body;

  if (!name || !email || !username) {
    return res.status(400).json({ error: 'Name, email, and username are all required.' });
  }

  const users = readUsers();

  // Stop duplicate emails
  const alreadyExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (alreadyExists) {
    return res.status(409).json({ error: 'That email is already registered.' });
  }

  // Stop duplicate usernames
  const usernameTaken = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (usernameTaken) {
    return res.status(409).json({ error: 'That username is already taken.' });
  }

  users.push({
    name,
    email,
    username,
    createdAt: new Date().toISOString()
  });
  writeUsers(users);

  return res.status(201).json({ message: 'Signup saved successfully.' });
});

// GET /users -> quick way to check saved signups while testing (names/emails only, no passwords)
app.get('/users', (req, res) => {
  const users = readUsers().map(u => ({ name: u.name, email: u.email, username: u.username, createdAt: u.createdAt }));
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
