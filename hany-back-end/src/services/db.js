const Database = require('better-sqlite3');
const fs = require('fs');
const dbFile = process.env.DB_FILE || './db/database.sqlite';
const initSql = fs.readFileSync('./db/init.sql', 'utf8');

if (!fs.existsSync(dbFile)) {
  fs.mkdirSync('./db', { recursive: true });
  fs.writeFileSync(dbFile, '');
}

const db = new Database(dbFile);
db.exec(initSql);

module.exports = db;
