-- ============================================================
-- Ujyalo — Daily Question feature — Phase 0 schema
-- Run ONCE in the Supabase SQL editor. Purely additive:
-- creates 3 new tables + 1 new column. Nothing existing is changed.
-- ============================================================

-- 1) The curated pool of daily questions.
--    Each row POINTS AT a real past-paper question (paper_id + question_number)
--    so the daily question renders exactly like it does in the paper viewer.
--    Editors add verified questions here from the verify tool.
create table if not exists daily_questions (
  id             uuid primary key default gen_random_uuid(),
  paper_id       uuid not null references past_papers(id) on delete cascade,
  question_number int  not null,
  subject_code   text,                       -- e.g. 'maths' (for filtering)
  source_label   text,                       -- e.g. 'SEE 2082 · Koshi · Q7' (provenance/display)
  status         text not null default 'approved',  -- 'approved' | 'retired'
  pinned_date    date,                        -- optional: force this question onto a specific day
  sort_order     int  not null default 0,     -- pool ordering for rotation
  added_by       text,                        -- editor email
  added_at       timestamptz not null default now(),
  unique (paper_id, question_number)          -- never add the same question twice
);
create index if not exists daily_questions_status_idx on daily_questions(status);
create index if not exists daily_questions_pinned_idx on daily_questions(pinned_date);

-- 2) The calendar: which question ran on which date.
--    Guarantees EVERY student sees the SAME question on a given day,
--    and doubles as the archive of past days.
create table if not exists daily_schedule (
  date              date primary key,
  daily_question_id uuid not null references daily_questions(id) on delete cascade,
  created_at        timestamptz not null default now()
);

-- 3) Every student's daily activity — one row per user per day.
--    This is the full record + what drives the streak.
create table if not exists daily_attempts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  date              date not null,
  daily_question_id uuid references daily_questions(id) on delete set null,
  self_assessment   text,               -- 'got' | 'almost' | 'missed'
  answer_text       text,               -- optional: the student's written attempt
  created_at        timestamptz not null default now(),
  unique (user_id, date)                -- one daily attempt per user per day
);
create index if not exists daily_attempts_user_idx on daily_attempts(user_id);
create index if not exists daily_attempts_date_idx on daily_attempts(date);

-- 4) Track each user's last daily-answer date so we can compute the 🔥 streak.
--    ('streak' column already exists on users.)
alter table users add column if not exists last_daily_date date;

-- 5) Lock the new tables down: only the server (service key) may read/write.
--    The browser never touches these directly — it goes through the API,
--    exactly like every other table. Service key bypasses RLS; anon gets nothing.
alter table daily_questions enable row level security;
alter table daily_schedule  enable row level security;
alter table daily_attempts  enable row level security;
