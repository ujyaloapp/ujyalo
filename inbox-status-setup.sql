-- ============================================================
-- UJYALO — Inbox triage status (run ONCE in the Supabase SQL editor)
--
-- Adds a per-message status so the admin Inbox can be triaged instead of
-- growing into an endless list:
--   new       → just arrived, still needs a look   (default)
--   done      → replied / handled (kept, dimmed)
--   archived  → cleared out of the list (kept, never deleted)
--
-- Messages are NEVER hard-deleted — 'archived' just hides them from the
-- default view. Existing rows have no status; the default backfills them
-- to 'new', and the admin UI also treats a missing status as 'new', so the
-- site keeps working even before this runs.
-- ============================================================

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Belt-and-braces: make sure any pre-existing rows are explicitly 'new'.
UPDATE contact_messages SET status = 'new' WHERE status IS NULL;

-- Optional guard so only the three known values can ever be written.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_messages_status_chk'
  ) THEN
    ALTER TABLE contact_messages
      ADD CONSTRAINT contact_messages_status_chk
      CHECK (status IN ('new','done','archived'));
  END IF;
END $$;
