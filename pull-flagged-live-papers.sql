-- ============================================================
-- One-time reconciliation: pull live papers that have flagged questions
-- back to draft, so a known-wrong answer isn't sitting in front of students.
-- This matches the app's rule ("a flag pulls a live paper down") applied to
-- the pre-existing flags that were set before that rule existed.
--
-- After this runs, a flagged paper is `draft` + flagged, which the verify desk
-- and admin both show under "In review" (fix these first). Publish it again
-- once its flags are resolved and every question is verified.
--
-- Run once in the Supabase SQL editor. Reversible: re-publish from the admin
-- "Publish" button after the paper is clean.
-- ============================================================

-- Preview first — see exactly which papers will be pulled:
SELECT p.id, p.year, p.province, s.code AS subject,
       count(*) FILTER (WHERE q.flagged) AS flagged_questions
FROM past_papers p
JOIN past_paper_questions q ON q.paper_id = p.id
LEFT JOIN exam_subjects s ON s.id = p.subject_id
WHERE p.status = 'live'
  AND q.flagged = true
GROUP BY p.id, p.year, p.province, s.code
ORDER BY flagged_questions DESC;

-- Then pull them offline:
UPDATE past_papers
SET status = 'draft'
WHERE status = 'live'
  AND id IN (
    SELECT DISTINCT paper_id
    FROM past_paper_questions
    WHERE flagged = true
  );
