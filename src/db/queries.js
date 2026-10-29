const { db } = require('./database');

// Column aliases turn snake_case database columns into camelCase JSON fields.
const CANDIDATE_COLUMNS = 'id, name, experience_years AS experienceYears, availability, quirk';
const JOB_COLUMNS = 'id, title, min_experience_years AS minExperienceYears, tagline';

// .pluck() returns the single selected column as a plain array, e.g. ['deduction', 'forensics'].
function getSkillsForCandidate(candidateId) {
  return db
    .prepare('SELECT skill FROM candidate_skills WHERE candidate_id = ? ORDER BY skill')
    .pluck()
    .all(candidateId);
}

function getTraitsForCandidate(candidateId) {
  return db
    .prepare('SELECT trait FROM candidate_traits WHERE candidate_id = ? ORDER BY trait')
    .pluck()
    .all(candidateId);
}

function getRequiredSkillsForJob(jobId) {
  return db
    .prepare('SELECT skill FROM job_required_skills WHERE job_id = ? ORDER BY skill')
    .pluck()
    .all(jobId);
}

function getCultureKeywordsForJob(jobId) {
  return db
    .prepare('SELECT keyword FROM job_culture_keywords WHERE job_id = ? ORDER BY keyword')
    .pluck()
    .all(jobId);
}

function withCandidateDetails(row) {
  return {
    ...row,
    skills: getSkillsForCandidate(row.id),
    traits: getTraitsForCandidate(row.id),
  };
}

function withJobDetails(row) {
  return {
    ...row,
    requiredSkills: getRequiredSkillsForJob(row.id),
    cultureKeywords: getCultureKeywordsForJob(row.id),
  };
}

// Groups rows like { candidate_id: 1, skill: 'deduction' } into a Map of id -> ['deduction', ...].
// The rows arrive already sorted, so each array stays in alphabetical order.
function groupById(rows, idColumn, valueColumn) {
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row[idColumn])) groups.set(row[idColumn], []);
    groups.get(row[idColumn]).push(row[valueColumn]);
  }
  return groups;
}

// Three queries in total, however many candidates there are.
function getAllCandidates() {
  const rows = db.prepare(`SELECT ${CANDIDATE_COLUMNS} FROM candidates ORDER BY id`).all();
  const skills = groupById(
    db.prepare('SELECT candidate_id, skill FROM candidate_skills ORDER BY candidate_id, skill').all(),
    'candidate_id',
    'skill',
  );
  const traits = groupById(
    db.prepare('SELECT candidate_id, trait FROM candidate_traits ORDER BY candidate_id, trait').all(),
    'candidate_id',
    'trait',
  );

  return rows.map((row) => ({
    ...row,
    skills: skills.get(row.id) || [],
    traits: traits.get(row.id) || [],
  }));
}

function getCandidateById(candidateId) {
  const row = db.prepare(`SELECT ${CANDIDATE_COLUMNS} FROM candidates WHERE id = ?`).get(candidateId);
  return row ? withCandidateDetails(row) : null;
}

// Three queries in total, however many jobs there are.
function getAllJobs() {
  const rows = db.prepare(`SELECT ${JOB_COLUMNS} FROM jobs ORDER BY id`).all();
  const requiredSkills = groupById(
    db.prepare('SELECT job_id, skill FROM job_required_skills ORDER BY job_id, skill').all(),
    'job_id',
    'skill',
  );
  const cultureKeywords = groupById(
    db.prepare('SELECT job_id, keyword FROM job_culture_keywords ORDER BY job_id, keyword').all(),
    'job_id',
    'keyword',
  );

  return rows.map((row) => ({
    ...row,
    requiredSkills: requiredSkills.get(row.id) || [],
    cultureKeywords: cultureKeywords.get(row.id) || [],
  }));
}

function getJobById(jobId) {
  const row = db.prepare(`SELECT ${JOB_COLUMNS} FROM jobs WHERE id = ?`).get(jobId);
  return row ? withJobDetails(row) : null;
}

module.exports = { getAllCandidates, getCandidateById, getAllJobs, getJobById };
