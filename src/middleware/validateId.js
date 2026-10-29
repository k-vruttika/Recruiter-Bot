// Rejects IDs that are not positive whole numbers, such as "abc", "0", "-1" or "1.5".
function validateId(req, res, next) {
  const { id } = req.params;

  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
    return res.status(400).json({ error: `Invalid ID "${id}". The ID must be a positive whole number.` });
  }

  next();
}

module.exports = validateId;
