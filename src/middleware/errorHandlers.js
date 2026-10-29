function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
}

// Express recognises an error handler by its four arguments, so `next` must stay in the signature.
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
}

module.exports = { notFoundHandler, errorHandler };
