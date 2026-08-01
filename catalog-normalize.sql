-- ============================================================
-- UJYALO — Catalog one-time cleanup (run ONCE in the Supabase SQL editor)
--
-- Why: we're about to make the student site obey the Catalog's Shown/Hidden
-- switch strictly ("show only what's marked Shown"). This makes sure every
-- CHAPTER that already has real, live questions is marked 'live' first — so
-- turning on strict gating hides NOTHING that students already use.
--
-- 100% SAFE: it only flips content-bearing chapters UP to 'live'. It never
-- hides anything, never touches 'archived' (Hidden) rows, never deletes.
-- Subjects are left exactly as you set them (Maths/Science live; English/Nepali
-- "Coming soon") — your choices are respected. Re-running it is harmless.
-- ============================================================

UPDATE chapters c
   SET status = 'live'
 WHERE c.status IS DISTINCT FROM 'live'
   AND c.status IS DISTINCT FROM 'archived'
   AND EXISTS (
     SELECT 1 FROM chapter_questions q
      WHERE q.chapter_id = c.id AND q.status = 'live'
   );

-- Check afterwards — how chapters are spread across statuses now:
--   SELECT status, count(*) FROM chapters GROUP BY status ORDER BY status;
-- And any chapters still not 'live' (should be only empty/unused ones):
--   SELECT subject_code, name, status FROM chapters WHERE status <> 'live' ORDER BY subject_code, name;
