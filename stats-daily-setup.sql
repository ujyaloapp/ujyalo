-- ============================================================
-- Daily stats snapshot — powers the admin dashboard's trend lines
-- honestly (we can only show a trend for numbers we've recorded over time).
--
-- One row per day. The admin backend upserts today's row every time the
-- dashboard loads (no cron needed) — so history builds as long as the admin
-- is opened. Reading it back gives real sparklines/trends that improve the
-- longer the site runs.
--
-- Run once in the Supabase SQL editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS stats_daily (
  day              date PRIMARY KEY,
  students         integer,
  papers_live      integer,
  papers_total     integer,
  q_verified       integer,
  q_total          integer,
  practice_live    integer,
  practice_checked integer,
  practice_total   integer,
  waitlist         integer,
  messages         integer,
  flagged          integer,
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- Only the server (service key) touches this table; keep it locked to the
-- backend like the rest of the privileged reads/writes.
ALTER TABLE stats_daily ENABLE ROW LEVEL SECURITY;
