const { getAllCandidates, getCandidateById, getAllJobs, getJobById } = require('../db/queries');

// Maximum points for each part of the score. They add up to 100.
const WEIGHTS = {
  skills: 60,
  experience: 25,
  culture: 10,
  availability: 5,
};

const AVAILABILITY_POINTS = {
  Immediate: 5,
  '2 weeks': 3,
  'Not looking': 0,
};

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

// Share of the job's required skills that the candidate has.
function scoreSkills(candidateSkills, requiredSkills) {
  const matched = requiredSkills.filter((skill) => candidateSkills.includes(skill));
  const missing = requiredSkills.filter((skill) => !candidateSkills.includes(skill));

  // A job with no required skills cannot be failed on skills, and this avoids dividing by zero.
  const points = requiredSkills.length === 0
    ? WEIGHTS.skills
    : (WEIGHTS.skills * matched.length) / requiredSkills.length;

  return { matched, missing, requiredCount: requiredSkills.length, points: roundToOneDecimal(points) };
}

// Full points at or above the minimum, partial points in proportion when below it.
function scoreExperience(candidateYears, requiredYears) {
  const meetsMinimum = candidateYears >= requiredYears;
  const points = meetsMinimum || requiredYears === 0
    ? WEIGHTS.experience
    : (WEIGHTS.experience * candidateYears) / requiredYears;

  return {
    candidateYears,
    requiredYears,
    yearsDifference: candidateYears - requiredYears,
    meetsMinimum,
    points: roundToOneDecimal(points),
  };
}

// Exact matches between the candidate's traits and the job's culture keywords.
function scoreCulture(candidateTraits, cultureKeywords) {
  const matched = cultureKeywords.filter((keyword) => candidateTraits.includes(keyword));
  const points = cultureKeywords.length === 0
    ? WEIGHTS.culture
    : (WEIGHTS.culture * matched.length) / cultureKeywords.length;

  return { matched, keywordCount: cultureKeywords.length, points: roundToOneDecimal(points) };
}

function scoreAvailability(availability) {
  return { status: availability, points: AVAILABILITY_POINTS[availability] ?? 0 };
}

function buildReason(skills, experience, culture, availability) {
  let skillsText;
  if (skills.requiredCount === 0) {
    skillsText = 'Job lists no required skills';
  } else if (skills.matched.length === 0) {
    skillsText = `Has 0 of ${skills.requiredCount} required skills`;
  } else {
    skillsText = `Has ${skills.matched.length} of ${skills.requiredCount} required skills (${skills.matched.join(', ')})`;
  }

  const experienceText = experience.meetsMinimum
    ? `${experience.candidateYears} yrs experience meets the ${experience.requiredYears}-yr minimum`
    : `${experience.candidateYears} yrs experience is below the ${experience.requiredYears}-yr minimum`;

  let cultureText;
  if (culture.keywordCount === 0) {
    cultureText = 'job lists no culture keywords';
  } else if (culture.matched.length > 0) {
    cultureText = `culture fit: ${culture.matched.join(', ')}`;
  } else {
    cultureText = 'no culture keyword match';
  }

  const availabilityText = `availability: ${availability.status}`;

  return `${skillsText}; ${experienceText}; ${cultureText}; ${availabilityText}.`;
}

// The single scoring function used by both endpoints.
function scoreMatch(candidate, job) {
  const skills = scoreSkills(candidate.skills, job.requiredSkills);
  const experience = scoreExperience(candidate.experienceYears, job.minExperienceYears);
  const culture = scoreCulture(candidate.traits, job.cultureKeywords);
  const availability = scoreAvailability(candidate.availability);

  const score = roundToOneDecimal(skills.points + experience.points + culture.points + availability.points);

  return {
    score,
    reason: buildReason(skills, experience, culture, availability),
    details: { skills, experience, culture, availability },
  };
}

// Highest score first. Ties: more matched skills, then sooner availability,
// then more experience, then lower ID.
// For the candidate endpoint, availability and experience are the same for every job, so it falls through to job id.
function compareResults(a, b) {
  return (
    b.result.score - a.result.score ||
    b.result.details.skills.matched.length - a.result.details.skills.matched.length ||
    (AVAILABILITY_POINTS[b.availability] ?? 0) - (AVAILABILITY_POINTS[a.availability] ?? 0) ||
    b.experienceYears - a.experienceYears ||
    a.id - b.id
  );
}

// A pair only counts as a match if they share at least one skill.
// A job with no required skills still matches everyone.
function hasSkillOverlap(result) {
  const { skills } = result.details;
  return skills.requiredCount === 0 || skills.matched.length > 0;
}

function getMatchesForJob(jobId) {
  const job = getJobById(jobId);
  if (!job) return null;

  const scored = getAllCandidates()
    .map((candidate) => ({
      id: candidate.id,
      availability: candidate.availability,
      experienceYears: candidate.experienceYears,
      candidate,
      result: scoreMatch(candidate, job),
    }))
    .filter(({ result }) => hasSkillOverlap(result));
  scored.sort(compareResults);

  return {
    job,
    totalMatches: scored.length,
    matches: scored.map(({ candidate, result }, index) => ({
      rank: index + 1,
      candidateId: candidate.id,
      candidateName: candidate.name,
      score: result.score,
      reason: result.reason,
      details: result.details,
    })),
  };
}

function getMatchesForCandidate(candidateId) {
  const candidate = getCandidateById(candidateId);
  if (!candidate) return null;

  const scored = getAllJobs()
    .map((job) => ({
      id: job.id,
      availability: candidate.availability,
      experienceYears: candidate.experienceYears,
      job,
      result: scoreMatch(candidate, job),
    }))
    .filter(({ result }) => hasSkillOverlap(result));
  scored.sort(compareResults);

  return {
    candidate,
    totalMatches: scored.length,
    matches: scored.map(({ job, result }, index) => ({
      rank: index + 1,
      jobId: job.id,
      jobTitle: job.title,
      score: result.score,
      reason: result.reason,
      details: result.details,
    })),
  };
}

module.exports = { scoreMatch, getMatchesForJob, getMatchesForCandidate };
