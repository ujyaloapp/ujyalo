-- =====================================================================
-- Practice questions — richer shape for real-exam-style questions.
-- Adds the columns the upgraded practice screen (chapter-practice.html)
-- needs to show multi-part questions, figures and Nepali — WITHOUT
-- touching or breaking any of the 281 questions already in the table.
--
-- Safe to run once in the Supabase SQL editor. All columns are nullable,
-- so existing questions keep working exactly as before (they simply have
-- no parts / figure / Nepali yet). Re-running is safe (IF NOT EXISTS).
--
-- NOTE on rollout order (dev + prod share one database):
--   1. Run THIS file (adds empty columns — harmless to the live site).
--   2. Deploy the new chapter-practice.html.
--   3. THEN load the new multi-part / figure questions.
-- Loading multi-part questions before step 2 would show only the stem.
-- =====================================================================

ALTER TABLE chapter_questions
  ADD COLUMN IF NOT EXISTS diagram_svg      text,   -- the figure (SVG), when a question has one
  ADD COLUMN IF NOT EXISTS parts            jsonb,   -- [{ "sub":"a", "q":"...", "q_np":"...", "marks":1 }, ...]
  ADD COLUMN IF NOT EXISTS question_text_np text,    -- Nepali version of the stem
  ADD COLUMN IF NOT EXISTS answer_text_np   text;    -- Nepali version of the model answer

-- How the columns map to a question the practice screen renders:
--   question_text        → the scenario stem (English)
--   question_text_np     → the scenario stem (Nepali)   [optional]
--   diagram_svg          → figure shown above the stem   [optional]
--   parts                → the (a),(b),(c)… parts with their marks   [optional]
--   marks                → total marks (used when there are no parts)
--   answer_text          → the full worked model answer (English)
--   answer_text_np       → the worked model answer (Nepali)   [optional]
--   question_type='mcq' + option_a..d + correct_option + explanation
--                        → a 1-mark multiple-choice question (existing columns)

-- Quick check that the columns are present:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'chapter_questions'
  AND column_name IN ('diagram_svg','parts','question_text_np','answer_text_np')
ORDER BY column_name;
