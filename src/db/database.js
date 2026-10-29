const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { seedDatabase } = require('./seed');

const DB_FILE = path.join(__dirname, '..', '..', 'data', 'recruiter_bot.db');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

const runAsScript = require.main === module;

// `npm run db:reset` deletes the old file so the database is rebuilt from scratch.
if (runAsScript && process.argv.includes('--reset')) {
  fs.rmSync(DB_FILE, { force: true });
  console.log(`Deleted ${DB_FILE}`);
}

fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

// better-sqlite3 creates the file if it does not exist yet.
const db = new Database(DB_FILE);

// SQLite only enforces foreign keys when this is switched on for the connection.
db.pragma('foreign_keys = ON');

function initDatabase() {
  const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
  db.exec(schemaSql);
  seedDatabase(db);
}

if (runAsScript) {
  initDatabase();
  const candidateCount = db.prepare('SELECT COUNT(*) AS count FROM candidates').get().count;
  const jobCount = db.prepare('SELECT COUNT(*) AS count FROM jobs').get().count;
  console.log(`Database ready at ${DB_FILE}`);
  console.log(`Candidates: ${candidateCount}, Jobs: ${jobCount}`);
  db.close();
}

module.exports = { db, initDatabase };
