const express = require('express');
const validateId = require('../middleware/validateId');
const { getAllCandidates } = require('../db/queries');
const { getMatchesForCandidate } = require('../services/matchingService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ candidates: getAllCandidates() });
});

router.get('/:id/matches', validateId, (req, res) => {
  const candidateId = Number(req.params.id);
  const result = getMatchesForCandidate(candidateId);

  if (!result) {
    return res.status(404).json({ error: `Candidate with ID ${candidateId} not found.` });
  }

  res.json(result);
});

module.exports = router;
