// server.js
// Daily Rhythm signup form backend — using Postgres so data persists across redeploys.

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create the table if it doesn't exist yet (safe to run every startup)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);
  console.log('Database ready.');
}
initDB().catch(err => console.error('DB init failed:', err));

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// POST /submit -> save a new signup
app.post('/submit', async (req, res) => {
  const { name, email, username } = req.body;

  if (!name || !email || !username) {
    return res.status(400).json({ error: 'Name, email, and username are all required.' });
  }

  try {
    const emailCheck = await pool.query('SELECT 1 FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'That email is already registered.' });
    }

    const usernameCheck = await pool.query('SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(409).json({ error: 'That username is already taken.' });
    }

    await pool.query(
      'INSERT INTO users (name, email, username) VALUES ($1, $2, $3)',
      [name, email, username]
    );

    return res.status(201).json({ message: 'Signup saved successfully.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong saving your info.' });
  }
});

// GET /users -> list saved signups
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT name, email, username, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch users.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
