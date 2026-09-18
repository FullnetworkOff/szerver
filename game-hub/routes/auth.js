const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

const router = express.Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 nap
  // secure: true  // HTTPS mogott kapcsold be production-ben!
};

// Regisztracio
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Felhasznalonev es jelszo megadasa kotelezo.' });
  }
  if (username.length < 3) {
    return res.status(400).json({ error: 'A felhasznalonev legalabb 3 karakter legyen.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'A jelszo legalabb 6 karakter legyen.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Ez a felhasznalonev mar foglalt.' });
  }

  const hash = await bcrypt.hash(password, 10);
  const info = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);

  const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, COOKIE_OPTS);
  res.json({ success: true, username });
});

// Bejelentkezes
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Felhasznalonev es jelszo megadasa kotelezo.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Hibas felhasznalonev vagy jelszo.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Hibas felhasznalonev vagy jelszo.' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, COOKIE_OPTS);
  res.json({ success: true, username: user.username });
});

// Kijelentkezes
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Jelenlegi felhasznalo lekerese
router.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

module.exports = router;
