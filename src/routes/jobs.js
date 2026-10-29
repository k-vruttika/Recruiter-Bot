const express = require('express');
const validateId = require('../middleware/validateId');
const { getAllJobs } = require('../db/queries');
const { getMatchesForJob } = require('../services/matchingService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ jobs: getAllJobs() });
});

router.get('/:id/matches', validateId, (req, res) => {
  const jobId = Number(req.params.id);
  const result = getMatchesForJob(jobId);

  if (!result) {
    return res.status(404).json({ error: `Job with ID ${jobId} not found.` });
  }

  res.json(result);
});

module.exports = router;
