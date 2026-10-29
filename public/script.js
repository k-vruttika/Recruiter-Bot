// Demo page for the Recruiter Bot API. It only calls the existing JSON endpoints.

const jobSelect = document.getElementById('job-select');
const candidateSelect = document.getElementById('candidate-select');
const results = document.getElementById('results');

async function getJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

// Small helper so text is always inserted with textContent, never as HTML.
function createElement(tag, text, className) {
  const element = document.createElement(tag);
  if (text !== undefined) element.textContent = text;
  if (className) element.className = className;
  return element;
}

function showMessage(text, className = 'message') {
  results.replaceChildren(createElement('p', text, className));
}

function addOption(select, value, label) {
  const option = createElement('option', label);
  option.value = value;
  select.appendChild(option);
}

async function loadDropdowns() {
  try {
    const { jobs } = await getJson('/jobs');
    const { candidates } = await getJson('/candidates');
    jobs.forEach((job) => addOption(jobSelect, job.id, `${job.id}. ${job.title}`));
    candidates.forEach((candidate) => addOption(candidateSelect, candidate.id, `${candidate.id}. ${candidate.name}`));
  } catch (error) {
    showMessage(`Could not load data: ${error.message}`, 'error');
  }
}

function buildSummary(title, lines) {
  const summary = createElement('div', undefined, 'summary');
  summary.appendChild(createElement('h2', title));
  lines.forEach((line) => summary.appendChild(createElement('p', line)));
  return summary;
}

function buildScoreCell(score) {
  const cell = createElement('td', undefined, 'number');
  cell.appendChild(createElement('div', String(score), 'score'));

  const bar = createElement('div', undefined, 'bar');
  const fill = createElement('div', undefined, 'bar-fill');
  fill.style.width = `${score}%`;
  bar.appendChild(fill);
  cell.appendChild(bar);
  return cell;
}

// nameLabel is "Candidate" or "Job". getName reads the right field from each match.
function buildTable(matches, nameLabel, getName) {
  const headers = [
    'Rank', nameLabel, 'Score', 'Skills (60)', 'Experience (25)', 'Culture (10)', 'Availability (5)', 'Reason',
  ];

  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  headers.forEach((header) => headerRow.appendChild(createElement('th', header)));
  table.appendChild(headerRow);

  matches.forEach((match) => {
    const { skills, experience, culture, availability } = match.details;
    const row = document.createElement('tr');
    row.appendChild(createElement('td', String(match.rank), 'number'));
    row.appendChild(createElement('td', getName(match), 'name'));
    row.appendChild(buildScoreCell(match.score));
    row.appendChild(createElement('td', String(skills.points), 'number'));
    row.appendChild(createElement('td', String(experience.points), 'number'));
    row.appendChild(createElement('td', String(culture.points), 'number'));
    row.appendChild(createElement('td', String(availability.points), 'number'));
    row.appendChild(createElement('td', match.reason, 'reason'));
    table.appendChild(row);
  });

  const wrapper = createElement('div', undefined, 'table-wrapper');
  wrapper.appendChild(table);
  return wrapper;
}

async function showJobMatches(jobId) {
  showMessage('Loading...');
  try {
    const { job, matches } = await getJson(`/jobs/${jobId}/matches`);
    const summary = buildSummary(job.title, [
      `Required skills: ${job.requiredSkills.join(', ')}`,
      `Minimum experience: ${job.minExperienceYears} years`,
      `Culture keywords: ${job.cultureKeywords.join(', ')}`,
    ]);
    results.replaceChildren(summary, buildTable(matches, 'Candidate', (match) => match.candidateName));
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

async function showCandidateMatches(candidateId) {
  showMessage('Loading...');
  try {
    const { candidate, matches } = await getJson(`/candidates/${candidateId}/matches`);
    const summary = buildSummary(candidate.name, [
      `Skills: ${candidate.skills.join(', ')}`,
      `Experience: ${candidate.experienceYears} years`,
      `Traits: ${candidate.traits.join(', ')}`,
      `Availability: ${candidate.availability}`,
    ]);
    results.replaceChildren(summary, buildTable(matches, 'Job', (match) => match.jobTitle));
  } catch (error) {
    showMessage(error.message, 'error');
  }
}

// Choosing one dropdown clears the other, so it is clear which results are shown.
jobSelect.addEventListener('change', () => {
  candidateSelect.value = '';
  if (jobSelect.value) showJobMatches(jobSelect.value);
  else showMessage('Results will appear here.');
});

candidateSelect.addEventListener('change', () => {
  jobSelect.value = '';
  if (candidateSelect.value) showCandidateMatches(candidateSelect.value);
  else showMessage('Results will appear here.');
});

loadDropdowns();
