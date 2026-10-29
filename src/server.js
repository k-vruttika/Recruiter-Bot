const { initDatabase } = require('./db/database');
const app = require('./app');

const PORT = process.env.PORT || 3000;

// Creates the tables and seed rows if they are missing. Safe to run on every start.
initDatabase();

// Express 5 passes startup errors, such as the port already being in use, to this callback.
app.listen(PORT, (error) => {
  if (error) {
    console.error(`Could not start the server on port ${PORT}: ${error.message}`);
    process.exit(1);
  }
  console.log(`Recruiter Bot API running at http://localhost:${PORT}`);
});
