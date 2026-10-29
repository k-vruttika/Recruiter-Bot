-- Recruiter Bot schema (SQLite).
-- Skills, traits and culture keywords are stored one value per row so they can
-- be compared exactly, instead of parsing comma-separated strings.
-- Matches are not stored: they are calculated on request from these tables.

CREATE TABLE IF NOT EXISTS candidates (
  id               INTEGER PRIMARY KEY,
  name             TEXT    NOT NULL,
  experience_years INTEGER NOT NULL CHECK (experience_years >= 0),
  availability     TEXT    NOT NULL CHECK (availability IN ('Immediate', '2 weeks', 'Not looking')),
  quirk            TEXT
);

CREATE TABLE IF NOT EXISTS candidate_skills (
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  skill        TEXT    NOT NULL,
  PRIMARY KEY (candidate_id, skill)
);

CREATE TABLE IF NOT EXISTS candidate_traits (
  candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  trait        TEXT    NOT NULL,
  PRIMARY KEY (candidate_id, trait)
);

CREATE TABLE IF NOT EXISTS jobs (
  id                   INTEGER PRIMARY KEY,
  title                TEXT    NOT NULL,
  min_experience_years INTEGER NOT NULL CHECK (min_experience_years >= 0),
  tagline              TEXT
);

CREATE TABLE IF NOT EXISTS job_required_skills (
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill  TEXT    NOT NULL,
  PRIMARY KEY (job_id, skill)
);

CREATE TABLE IF NOT EXISTS job_culture_keywords (
  job_id  INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  keyword TEXT    NOT NULL,
  PRIMARY KEY (job_id, keyword)
);
