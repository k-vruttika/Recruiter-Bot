const path = require('path');
const express = require('express');
const jobRoutes = require('./routes/jobs');
const candidateRoutes = require('./routes/candidates');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandlers');

const app = express();

// Indent JSON responses so they are readable in a browser.
app.set('json spaces', 2);

// Serves the demo page in public/ at http://localhost:3000/
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/jobs', jobRoutes);
app.use('/candidates', candidateRoutes);

// These two must be registered after all routes.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
