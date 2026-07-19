-- ============================================================
-- Chapter-practice verification — add "checked?" tracking, and make NEW
-- questions start hidden until an editor approves them.
--
-- Safe & backward-compatible:
--  • Existing questions keep their current status (the live ones stay live),
--    but come in as verified = false, so they show up in the review queue.
--  • From now on, a newly-inserted question defaults to status 'draft'
--    (hidden from students) until an editor approves it → 'live'.
--
-- Run once in the Supabase SQL editor.
-- ============================================================

ALTER TABLE chapter_questions
  ADD COLUMN IF NOT EXISTS verified     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_by  text,
  ADD COLUMN IF NOT EXISTS verified_at  timestamptz;

-- New questions are hidden until approved (existing rows are untouched).
ALTER TABLE chapter_questions ALTER COLUMN status SET DEFAULT 'draft';

-- Optional sanity check — see the spread of statuses / verified after running:
--   SELECT status, verified, count(*) FROM chapter_questions GROUP BY status, verified ORDER BY status, verified;
