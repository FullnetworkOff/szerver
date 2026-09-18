const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'gamehub.db'));

db.pragma('journal_mode = WAL');

// Felhasznalok tabla
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// Jatekok tabla
db.exec(`
  CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'egyeb',
    filename TEXT NOT NULL,
    uploaded_by INTEGER NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
  )
`);

module.exports = db;
