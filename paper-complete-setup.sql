-- ============================================================
-- UJYALO — Paper "complete / locked" flag (run ONCE in the Supabase SQL editor)
--
-- Adds a per-paper switch so a paper can be built up over time and then LOCKED:
--   complete = false  → "Building": you can add / remove questions
--   complete = true   → "Complete": locked, no new questions (reopen to change)
--
-- Every paper is independent, so you can have many half-built papers at once
-- (e.g. typing questions from several different papers) without them affecting
-- each other.
--
-- SAFE & ADDITIVE. Existing papers become complete = true (locked) by default —
-- so none of your already-finished papers can get a stray question. New papers
-- created by the "Add a paper" wizard start as complete = false (Building).
-- Re-running is harmless.
-- ============================================================

ALTER TABLE past_papers
  ADD COLUMN IF NOT EXISTS complete boolean NOT NULL DEFAULT true;

-- Check after running:
--   SELECT complete, count(*) FROM past_papers GROUP BY complete;
