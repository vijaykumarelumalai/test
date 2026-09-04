const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

// Ensure database storage directory exists
const dbDir = path.resolve(__dirname, '../../../database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'vktraders.sqlite');
const db = new DatabaseSync(dbPath);

// Enable foreign key constraints
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize schema
const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schemaSql);

module.exports = {
  db,
  query(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },
  get(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },
  run(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  }
};
