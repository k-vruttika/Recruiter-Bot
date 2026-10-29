-- =====================================================================
-- Part 2: The SQL Detective Challenge (SQLite)
--
-- This file is self-contained: it creates the four tables, loads the
-- supplied data exactly as given, and then runs one query per question.
-- It can be run more than once because the tables are dropped first.
--
-- Run it with:  npm run sql:detective
-- or with the sqlite3 CLI:  sqlite3 -header -column :memory: ".read sql_detective.sql"
--
-- SQLite notes: VARCHAR(n) and DATE are accepted but stored as TEXT.
-- Dates are ISO strings (YYYY-MM-DD), so they sort correctly as text.
-- The REFERENCES clauses only document the relationships. The schema is
-- otherwise unchanged from the brief.
-- =====================================================================

DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS applicants;
DROP TABLE IF EXISTS job_postings;
DROP TABLE IF EXISTS recruiters;

CREATE TABLE recruiters (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  region VARCHAR(50)
);

CREATE TABLE job_postings (
  id INT PRIMARY KEY,
  title VARCHAR(100),
  recruiter_id INT REFERENCES recruiters(id),
  department VARCHAR(50),
  opened_date DATE,
  status VARCHAR(20) -- 'open', 'closed', 'on_hold'
);

CREATE TABLE applicants (
  id INT PRIMARY KEY,
  full_name VARCHAR(100),
  email VARCHAR(100),
  source VARCHAR(50), -- nullable
  applied_date DATE
);

CREATE TABLE interviews (
  id INT PRIMARY KEY,
  applicant_id INT REFERENCES applicants(id),
  job_posting_id INT REFERENCES job_postings(id),
  stage VARCHAR(20), -- 'Screen', 'Technical', 'Final'
  scheduled_date DATE,
  outcome VARCHAR(20) -- 'passed', 'failed', 'no_show', NULL (pending)
);

INSERT INTO recruiters VALUES
(1, 'Priya Shah', 'APAC'),
(2, 'Daniel Ortiz', 'NA'),
(3, 'Fatima Al-Sayed', 'EMEA'),
(4, 'Wei Zhang', 'APAC'),
(5, 'Grace Okafor', 'EMEA');

INSERT INTO job_postings VALUES
(1, 'Backend Engineer I', 1, 'Engineering', '2026-01-05', 'open'),
(2, 'Backend Engineer I', 2, 'Engineering', '2026-01-10', 'open'),
(3, 'Data Analyst', 3, 'Data', '2026-01-08', 'closed'),
(4, 'Backend Engineer II', 1, 'Engineering', '2026-02-01', 'open'),
(5, 'DevOps Engineer', 4, 'Infrastructure', '2026-01-20', 'open'),
(6, 'Data Analyst', 5, 'Data', '2026-02-05', 'on_hold'),
(7, 'Backend Engineer I', 2, 'Engineering', '2026-02-15', 'closed');

INSERT INTO applicants VALUES
(1, 'Ananya Rao', 'ananya.rao@mail.com', 'LinkedIn', '2026-01-06'),
(2, 'Ananya Rao', 'Ananya.Rao@mail.com', 'Referral', '2026-02-04'),
(3, 'Ben Turner', 'ben.turner@mail.com', 'Job Board', '2026-01-07'),
(4, 'Chloe Martin', 'chloe.martin@mail.com', NULL, '2026-01-09'),
(5, 'Devansh Patel', 'devansh.patel@mail.com', 'LinkedIn', '2026-01-11'),
(6, 'Elena Popescu', 'elena.popescu@mail.com', 'Referral', '2026-01-12'),
(7, 'Farid Haidari', 'farid.haidari@mail.com', 'Job Board', '2026-01-13'),
(8, 'Grace Lin', 'grace.lin@mail.com', 'LinkedIn', '2026-01-15'),
(9, 'Hassan Malik', 'hassan.malik@mail.com', NULL, '2026-01-16'),
(10, 'Isla Fraser', 'isla.fraser@mail.com', 'Referral', '2026-01-18'),
(11, 'Jonas Weber', 'jonas.weber@mail.com', 'Job Board', '2026-02-10');

INSERT INTO interviews VALUES
(1, 1, 1, 'Screen', '2026-01-10', 'passed'),
(2, 1, 1, 'Technical', '2026-01-15', 'passed'),
(3, 1, 1, 'Final', '2026-01-22', 'passed'),
(4, 2, 4, 'Screen', '2026-02-05', 'passed'),
(5, 3, 1, 'Screen', '2026-01-11', 'passed'),
(6, 3, 1, 'Technical', '2026-01-16', 'failed'),
(7, 3, 3, 'Final', '2026-01-28', 'passed'),
(8, 4, 1, 'Screen', '2026-01-12', 'passed'),
(9, 4, 1, 'Final', '2026-01-24', 'failed'),
(10, 5, 2, 'Screen', '2026-01-14', 'passed'),
(11, 5, 2, 'Technical', '2026-01-19', 'passed'),
(12, 5, 2, 'Final', '2026-01-25', 'passed'),
(13, 6, 2, 'Screen', '2026-01-15', 'passed'),
(14, 6, 2, 'Final', '2026-01-26', 'failed'),
(15, 7, 2, 'Screen', '2026-01-16', 'no_show'),
(16, 8, 4, 'Screen', '2026-02-03', 'passed'),
(17, 8, 4, 'Technical', '2026-02-08', 'passed'),
(18, 8, 4, 'Final', '2026-02-12', 'passed'),
(19, 9, 4, 'Screen', '2026-02-04', 'passed'),
(20, 9, 4, 'Final', '2026-02-14', 'passed'),
(21, 10, 5, 'Screen', '2026-01-22', 'passed'),
(22, 10, 5, 'Technical', '2026-01-28', NULL),
(23, 11, 7, 'Final', '2026-02-20', 'passed'),
(24, 6, 7, 'Final', '2026-02-21', 'failed');


-- Question 1: All currently open job postings with the owning recruiter's name.
-- LEFT JOIN keeps an open posting even if its recruiter_id had no matching recruiter.
SELECT
  jp.id          AS job_posting_id,
  jp.title,
  jp.department,
  jp.opened_date,
  r.name         AS recruiter_name
FROM job_postings AS jp
LEFT JOIN recruiters AS r ON r.id = jp.recruiter_id
WHERE jp.status = 'open'
ORDER BY jp.id;


-- Question 2: For each job posting, the number of applicants who reached the Final stage.
-- The stage filter is in the ON clause, not in WHERE, so postings with no Final
-- interviews are kept and show 0. People are counted by email, compared
-- case-insensitively, using the same identity rule as Question 3. This way one
-- person with two applicant records is counted once.
SELECT
  jp.id                                       AS job_posting_id,
  jp.title,
  COUNT(DISTINCT LOWER(TRIM(a.email)))        AS applicants_reached_final
FROM job_postings AS jp
LEFT JOIN interviews AS i
  ON i.job_posting_id = jp.id
 AND i.stage = 'Final'
LEFT JOIN applicants AS a
  ON a.id = i.applicant_id
GROUP BY jp.id, jp.title
ORDER BY jp.id;


-- Question 3: People who effectively applied to more than one job posting.
-- Identity rule: the same person is identified by email compared case-insensitively
-- and ignoring surrounding spaces. Applicants 1 and 2 (Ananya Rao) differ only in
-- email letter case, so they are treated as one person. Name alone is not used
-- because two different people can share a name.
-- There is no applications table, so an application to a posting is taken to be
-- any interview row linking that applicant to that posting.
SELECT
  LOWER(TRIM(a.email))                     AS person_email,
  MIN(a.full_name)                         AS full_name,
  GROUP_CONCAT(DISTINCT a.id)              AS applicant_ids,
  COUNT(DISTINCT i.job_posting_id)         AS job_postings_applied,
  GROUP_CONCAT(DISTINCT i.job_posting_id)  AS job_posting_ids
FROM applicants AS a
JOIN interviews AS i ON i.applicant_id = a.id
GROUP BY LOWER(TRIM(a.email))
HAVING COUNT(DISTINCT i.job_posting_id) > 1
ORDER BY full_name;


-- Question 4: Final-stage conversion rate per recruiter (passed / total Final interviews),
-- only for recruiters with at least 3 Final-stage interviews.
-- HAVING guarantees the denominator is at least 3, so there is no division by zero.
-- 100.0 forces decimal division. A pending (NULL) Final outcome would count as not passed.
SELECT
  r.id                                                   AS recruiter_id,
  r.name                                                 AS recruiter_name,
  COUNT(*)                                               AS final_interviews,
  SUM(CASE WHEN i.outcome = 'passed' THEN 1 ELSE 0 END)  AS final_passed,
  ROUND(100.0 * SUM(CASE WHEN i.outcome = 'passed' THEN 1 ELSE 0 END) / COUNT(*), 2)
                                                         AS conversion_rate_percent
FROM recruiters AS r
JOIN job_postings AS jp ON jp.recruiter_id = r.id
JOIN interviews   AS i  ON i.job_posting_id = jp.id
WHERE i.stage = 'Final'
GROUP BY r.id, r.name
HAVING COUNT(*) >= 3
ORDER BY conversion_rate_percent DESC, r.id;


-- Question 5 (Bonus): Recruiter(s) with the most successful placements per department.
-- A placement is a Final-stage interview with outcome 'passed'. The department comes
-- from the job posting. RANK() gives tied recruiters the same rank, so every recruiter
-- sharing the top count is returned. Departments with no placements are not listed.
WITH placements AS (
  SELECT
    jp.department,
    r.id      AS recruiter_id,
    r.name    AS recruiter_name,
    COUNT(*)  AS successful_placements
  FROM interviews AS i
  JOIN job_postings AS jp ON jp.id = i.job_posting_id
  JOIN recruiters   AS r  ON r.id = jp.recruiter_id
  WHERE i.stage = 'Final'
    AND i.outcome = 'passed'
  GROUP BY jp.department, r.id, r.name
),
ranked AS (
  SELECT
    department,
    recruiter_id,
    recruiter_name,
    successful_placements,
    RANK() OVER (PARTITION BY department ORDER BY successful_placements DESC) AS department_rank
  FROM placements
)
SELECT department, recruiter_id, recruiter_name, successful_placements
FROM ranked
WHERE department_rank = 1
ORDER BY department, recruiter_id;
