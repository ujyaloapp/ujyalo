-- ============================================================
-- Site settings — one row that the admin edits and the public site reads.
-- Powers: the SEE exam countdown, the announcement band, and which student
-- features are visible. Editing these no longer needs a code change.
--
-- The public site reads a safe copy via GET /api/settings (server-side,
-- service key). Only the admin writes, via the admin API. Run once.
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id               smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  see_exam_date    date,                          -- blank = countdown off
  announce_on      boolean NOT NULL DEFAULT true, -- show the top announcement band
  announce_text    text,                          -- null = use the built-in default
  feature_formulas boolean NOT NULL DEFAULT true, -- show the Formulas tab on the site
  feature_mocks    boolean NOT NULL DEFAULT false,-- (reserved — mock tests aren't student-facing yet)
  feature_plus     boolean NOT NULL DEFAULT false,-- (reserved — Plus not launched yet)
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Seed the single row (id is fixed at 1).
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Server-only via the service key, like the rest of the privileged data.
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
