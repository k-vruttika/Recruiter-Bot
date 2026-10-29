// Runs sql_detective.sql in a temporary in-memory SQLite database and prints each query's result.
// checks Part 2 without installing the sqlite3 command-line tool
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const SQL_FILE = path.join(__dirname, '..', 'sql_detective.sql');

const db = new Database(':memory:');
const sqlText = fs.readFileSync(SQL_FILE, 'utf8');

const statements = sqlText.split(';');

for (const statement of statements) {
  const codeOnly = statement
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .trim();
  if (codeOnly === '') continue;

  const prepared = db.prepare(statement);

  // `reader` is true for statements that return rows (SELECT / WITH ... SELECT).
  if (prepared.reader) {
    const heading = statement.match(/-- (Question \d.*)/);
    console.log(`\n${heading ? heading[1] : 'Query'}`);
    console.table(prepared.all());
  } else {
    prepared.run();
  }
}

db.close();
