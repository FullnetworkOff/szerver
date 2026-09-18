const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '.html');
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const isHtml = file.mimetype === 'text/html' || file.originalname.toLowerCase().endsWith('.html');
    if (!isHtml) return cb(new Error('Csak .html fajlok tolthetok fel.'));
    cb(null, true);
  }
});

// Osszes jatek listazasa (szurheto kategoria szerint)
router.get('/', optionalAuth, (req, res) => {
  const { category } = req.query;
  let rows;
  if (category && category !== 'osszes') {
    rows = db.prepare(`
      SELECT games.id, games.title, games.description, games.category, games.created_at, users.username AS uploaded_by
      FROM games JOIN users ON games.uploaded_by = users.id
      WHERE games.category = ?
      ORDER BY games.created_at DESC
    `).all(category);
  } else {
    rows = db.prepare(`
      SELECT games.id, games.title, games.description, games.category, games.created_at, users.username AS uploaded_by
      FROM games JOIN users ON games.uploaded_by = users.id
      ORDER BY games.created_at DESC
    `).all();
  }
  res.json(rows);
});

// Uj jatek feltoltese (bejelentkezes szukseges)
router.post('/upload', requireAuth, upload.single('gamefile'), (req, res) => {
  const { title, description, category } = req.body;
  if (!title || !req.file) {
    return res.status(400).json({ error: 'Cim es HTML fajl megadasa kotelezo.' });
  }

  const info = db.prepare(`
    INSERT INTO games (title, description, category, filename, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(title, description || '', category || 'egyeb', req.file.filename, req.user.id);

  res.json({ success: true, id: info.lastInsertRowid });
});

// Egy jatek lejatszasa (a feltoltott HTML kiszolgalasa)
router.get('/play/:id', (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!game) return res.status(404).send('A jatek nem talalhato.');
  res.sendFile(path.join(UPLOAD_DIR, game.filename));
});

// Jatek torlese (csak a feltolto)
router.delete('/:id', requireAuth, (req, res) => {
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(req.params.id);
  if (!game) return res.status(404).json({ error: 'Nem talalhato.' });
  if (game.uploaded_by !== req.user.id) return res.status(403).json({ error: 'Ez nem a te jatekod.' });

  const filePath = path.join(UPLOAD_DIR, game.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.prepare('DELETE FROM games WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
