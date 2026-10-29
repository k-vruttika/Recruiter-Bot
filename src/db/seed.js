// Seed data as given in assignment brief.
// IDs are fixed so every fresh install gets the same IDs (job 1 is always Backend Detective).

const candidates = [
  {
    id: 1, name: 'Sherlock H.', experienceYears: 8, availability: 'Immediate',
    skills: ['deduction', 'pattern-recognition', 'forensics'],
    traits: ['analytical', 'blunt'],
    quirk: 'Solves problems by eliminating the impossible; occasionally insufferable in standups.',
  },
  {
    id: 2, name: 'Hermione G.', experienceYears: 4, availability: '2 weeks',
    skills: ['research', 'time-management', 'public-speaking'],
    traits: ['detail-oriented', 'overachiever'],
    quirk: 'Reads the entire documentation before writing a single line of code.',
  },
  {
    id: 3, name: 'Tony S.', experienceYears: 12, availability: 'Not looking',
    skills: ['systems-design', 'rapid-prototyping', 'leadership'],
    traits: ['confident', 'innovative'],
    quirk: 'Ships an MVP overnight, refuses to write tests.',
  },
  {
    id: 4, name: 'Leslie K.', experienceYears: 6, availability: 'Immediate',
    skills: ['project-management', 'stakeholder-management', 'public-speaking'],
    traits: ['tenacious', 'organized'],
    quirk: 'Has a binder for everything, including the binder.',
  },
  {
    id: 5, name: 'Ron S.', experienceYears: 15, availability: 'Not looking',
    skills: ['woodworking', 'minimalism', 'negotiation'],
    traits: ['stubborn', 'principled'],
    quirk: 'Refuses to use more than one monitor.',
  },
  {
    id: 6, name: 'Rick S.', experienceYears: 20, availability: 'Immediate',
    skills: ['systems-design', 'rapid-prototyping', 'chemistry'],
    traits: ['genius', 'reckless'],
    quirk: 'Solution works, mechanism deeply concerning.',
  },
  {
    id: 7, name: 'Elle W.', experienceYears: 3, availability: 'Immediate',
    skills: ['persuasion', 'research', 'public-speaking'],
    traits: ['optimistic', 'sharp'],
    quirk: 'Underestimated in every standup, correct in every retro.',
  },
  {
    id: 8, name: 'MacGyver', experienceYears: 10, availability: '2 weeks',
    skills: ['rapid-prototyping', 'resourcefulness', 'chemistry', 'systems-design'],
    traits: ['calm', 'improviser'],
    quirk: 'Fixes production outages with duct tape and a paperclip metaphor.',
  },
  {
    id: 9, name: 'Sheldon C.', experienceYears: 9, availability: 'Immediate',
    skills: ['theoretical-analysis', 'pattern-recognition', 'research'],
    traits: ['rigid', 'brilliant'],
    quirk: 'Correct 95% of the time, insufferable 100% of the time.',
  },
  {
    id: 10, name: 'Katniss E.', experienceYears: 5, availability: 'Immediate',
    skills: ['precision', 'strategy', 'crisis-management'],
    traits: ['resilient', 'decisive'],
    quirk: 'Excellent under pressure, terrible with public speaking.',
  },
  {
    id: 11, name: 'Michael S.', experienceYears: 11, availability: 'Not looking',
    skills: ['sales', 'public-speaking', 'team-building'],
    traits: ['enthusiastic', 'chaotic'],
    quirk: "World's best boss, according to a mug he bought himself.",
  },
  {
    id: 12, name: 'Olivia P.', experienceYears: 13, availability: '2 weeks',
    skills: ['crisis-management', 'negotiation', 'strategy', 'leadership'],
    traits: ['decisive', 'intense'],
    quirk: 'Handles it. Whatever it is.',
  },
  {
    id: 13, name: 'Ted L.', experienceYears: 7, availability: 'Immediate',
    skills: ['team-building', 'optimism', 'mentorship', 'public-speaking'],
    traits: ['empathetic', 'persistent'],
    quirk: 'Turns every technical setback into a folksy metaphor.',
  },
  {
    id: 14, name: 'Miranda P.', experienceYears: 18, availability: 'Not looking',
    skills: ['leadership', 'negotiation', 'stakeholder-management', 'precision'],
    traits: ['demanding', 'decisive'],
    quirk: 'Reviews every PR personally. Says nothing. Everyone panics.',
  },
  {
    id: 15, name: 'Dwight S.', experienceYears: 9, availability: 'Immediate',
    skills: ['sales', 'negotiation', 'security', 'loyalty'],
    traits: ['intense', 'loyal'],
    quirk: 'Assistant to the regional backend engineer.',
  },
];

const jobs = [
  {
    id: 1, title: 'Backend Detective', minExperienceYears: 3,
    requiredSkills: ['deduction', 'pattern-recognition', 'forensics'],
    cultureKeywords: ['analytical', 'autonomous'],
    tagline: 'We have a bug. We have no leads. We have you.',
  },
  {
    id: 2, title: 'Rapid Prototyping Engineer', minExperienceYears: 2,
    requiredSkills: ['rapid-prototyping', 'systems-design'],
    cultureKeywords: ['innovative', 'fast-paced'],
    tagline: 'Ship first, document never (kidding — please document).',
  },
  {
    id: 3, title: 'Developer Relations Lead', minExperienceYears: 2,
    requiredSkills: ['public-speaking', 'research'],
    cultureKeywords: ['energetic', 'curious'],
    tagline: 'Explain complex things to confused humans, cheerfully.',
  },
  {
    id: 4, title: 'Engineering Manager, Chaos Team', minExperienceYears: 5,
    requiredSkills: ['team-building', 'stakeholder-management', 'leadership'],
    cultureKeywords: ['empathetic', 'organized'],
    tagline: 'Herd cats. The cats are senior engineers.',
  },
  {
    id: 5, title: 'Incident Commander', minExperienceYears: 4,
    requiredSkills: ['crisis-management', 'strategy', 'negotiation'],
    cultureKeywords: ['decisive', 'calm-under-pressure'],
    tagline: "3am page. You're the one who picks up.",
  },
  {
    id: 6, title: 'Sales Engineer', minExperienceYears: 3,
    requiredSkills: ['sales', 'public-speaking', 'negotiation'],
    cultureKeywords: ['enthusiastic', 'persistent'],
    tagline: 'Sell the vision, then go build it.',
  },
];

// INSERT OR IGNORE skips rows whose primary key already exists,
// so running the seed again does not create duplicates.
function seedDatabase(db) {
  const insertCandidate = db.prepare(
    'INSERT OR IGNORE INTO candidates (id, name, experience_years, availability, quirk) VALUES (?, ?, ?, ?, ?)'
  );
  const insertCandidateSkill = db.prepare(
    'INSERT OR IGNORE INTO candidate_skills (candidate_id, skill) VALUES (?, ?)'
  );
  const insertCandidateTrait = db.prepare(
    'INSERT OR IGNORE INTO candidate_traits (candidate_id, trait) VALUES (?, ?)'
  );
  const insertJob = db.prepare(
    'INSERT OR IGNORE INTO jobs (id, title, min_experience_years, tagline) VALUES (?, ?, ?, ?)'
  );
  const insertJobSkill = db.prepare(
    'INSERT OR IGNORE INTO job_required_skills (job_id, skill) VALUES (?, ?)'
  );
  const insertJobKeyword = db.prepare(
    'INSERT OR IGNORE INTO job_culture_keywords (job_id, keyword) VALUES (?, ?)'
  );

  // db.transaction() wraps the inserts in BEGIN/COMMIT, so a failure leaves no half-seeded data.
  const seedAll = db.transaction(() => {
    for (const candidate of candidates) {
      insertCandidate.run(candidate.id, candidate.name, candidate.experienceYears, candidate.availability, candidate.quirk);
      for (const skill of candidate.skills) insertCandidateSkill.run(candidate.id, skill);
      for (const trait of candidate.traits) insertCandidateTrait.run(candidate.id, trait);
    }

    for (const job of jobs) {
      insertJob.run(job.id, job.title, job.minExperienceYears, job.tagline);
      for (const skill of job.requiredSkills) insertJobSkill.run(job.id, skill);
      for (const keyword of job.cultureKeywords) insertJobKeyword.run(job.id, keyword);
    }
  });

  seedAll();
}

module.exports = { seedDatabase, candidates, jobs };
