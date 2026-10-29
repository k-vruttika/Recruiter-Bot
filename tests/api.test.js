// API tests. They use only Node's built-in test runner, assert module and fetch.
// Run them with `npm test`.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { db, initDatabase } = require('../src/db/database');
const app = require('../src/app');
const { scoreMatch } = require('../src/services/matchingService');

const JOB_IDS = [1, 2, 3, 4, 5, 6];

let server;
let baseUrl;

before(async () => {
  initDatabase();
  // Port 0 asks the operating system for any free port, so tests never clash with `npm start`.
  await new Promise((resolve, reject) => {
    server = app.listen(0, (error) => (error ? reject(error) : resolve()));
  });
  baseUrl = `http://localhost:${server.address().port}`;
});

after(() => {
  server.close();
});

async function get(path) {
  const response = await fetch(`${baseUrl}${path}`);
  return { status: response.status, body: await response.json() };
}

// Collects every number inside an object, however deeply nested.
function collectNumbers(value, numbers = []) {
  if (typeof value === 'number') numbers.push(value);
  else if (value && typeof value === 'object') Object.values(value).forEach((child) => collectNumbers(child, numbers));
  return numbers;
}

test('1. GET /jobs/1/matches ranks Sherlock H. first with 95', async () => {
  const { status, body } = await get('/jobs/1/matches');
  assert.equal(status, 200);
  assert.equal(body.matches[0].candidateName, 'Sherlock H.');
  assert.equal(body.matches[0].score, 95);
});

test('2. Every job: scores never go up and ranks are 1..n with no gaps', async () => {
  for (const jobId of JOB_IDS) {
    const { status, body } = await get(`/jobs/${jobId}/matches`);
    assert.equal(status, 200);
    assert.equal(body.totalMatches, body.matches.length);
    body.matches.forEach((match, index) => {
      assert.equal(match.rank, index + 1, `job ${jobId}: rank at position ${index}`);
      if (index > 0) {
        assert.ok(match.score <= body.matches[index - 1].score, `job ${jobId}: score order at rank ${match.rank}`);
      }
    });
  }
});

test('3. Both endpoints give the same score for the same pair', async () => {
  const { body: jobBody } = await get('/jobs/1/matches');
  for (const match of jobBody.matches) {
    const { body: candidateBody } = await get(`/candidates/${match.candidateId}/matches`);
    const sameJob = candidateBody.matches.find((jobMatch) => jobMatch.jobId === 1);
    assert.ok(sameJob, `${match.candidateName} should list job 1`);
    assert.equal(sameJob.score, match.score, `${match.candidateName} score for job 1`);
  }
});

test('4. Candidates with no matching skills are left out', async () => {
  for (const jobId of JOB_IDS) {
    const { body } = await get(`/jobs/${jobId}/matches`);
    for (const match of body.matches) {
      assert.ok(match.details.skills.matched.length > 0, `job ${jobId}: ${match.candidateName} has no matched skill`);
    }
  }

  const { body } = await get('/jobs/1/matches');
  const names = body.matches.map((match) => match.candidateName);
  assert.ok(!names.includes('Rick S.'));
  assert.deepEqual(names, ['Sherlock H.', 'Sheldon C.']);
});

test('5. Tie-break: Rick S. (Immediate) ranks above Tony S. (Not looking) for job 2', async () => {
  const { body } = await get('/jobs/2/matches');
  const rick = body.matches.find((match) => match.candidateName === 'Rick S.');
  const tony = body.matches.find((match) => match.candidateName === 'Tony S.');
  assert.equal(rick.score, 90);
  assert.equal(tony.score, 90);
  assert.ok(rick.rank < tony.rank);
});

test('6. Invalid IDs give 400 and unknown IDs give 404, each with an error message', async () => {
  const cases = [
    ['/jobs/abc/matches', 400],
    ['/candidates/abc/matches', 400],
    ['/jobs/999/matches', 404],
    ['/candidates/999/matches', 404],
  ];
  for (const [path, expectedStatus] of cases) {
    const { status, body } = await get(path);
    assert.equal(status, expectedStatus, path);
    assert.equal(typeof body.error, 'string', path);
  }
});

test('7. A job with no required skills or keywords does not divide by zero', () => {
  const job = { requiredSkills: [], cultureKeywords: [], minExperienceYears: 0 };
  const candidate = { skills: ['deduction'], traits: ['curious'], experienceYears: 2, availability: 'Immediate' };
  const result = scoreMatch(candidate, job);

  assert.ok(Number.isFinite(result.score));
  assert.equal(result.details.skills.points, 60);
  for (const number of collectNumbers(result)) {
    assert.ok(!Number.isNaN(number), 'found NaN in the result');
  }
});

test('8. A candidate who shares no skill with any job gets 200 with an empty list', async () => {
  // No seed candidate hits this case, so the test adds a temporary one and removes it afterwards.
  const tempId = 9999;
  db.prepare("INSERT INTO candidates (id, name, experience_years, availability) VALUES (?, 'Test Person', 3, 'Immediate')").run(tempId);
  db.prepare("INSERT INTO candidate_skills (candidate_id, skill) VALUES (?, 'underwater-basket-weaving')").run(tempId);

  try {
    const { status, body } = await get(`/candidates/${tempId}/matches`);
    assert.equal(status, 200);
    assert.equal(body.totalMatches, 0);
    assert.deepEqual(body.matches, []);
  } finally {
    // ON DELETE CASCADE also removes the temporary skill row.
    db.prepare('DELETE FROM candidates WHERE id = ?').run(tempId);
  }
});
