-- ============================================================
-- Team board — one-time setup.
-- Creates the table that holds tasks and goals for the team board
-- on the verification desk. Run this ONCE in the Supabase SQL editor.
-- ============================================================

create table if not exists team_items (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('task','goal')),
  title       text not null,
  area        text,                       -- tasks: content | social | code | outreach
  horizon     text,                       -- goals: term | future
  assignee    text,                       -- email of the partner a task is assigned to
  status      text not null default 'open', -- task: open|done   goal: open|achieved
  created_by  text,
  created_at  timestamptz not null default now(),
  done_at     timestamptz,
  sort        double precision not null default 0
);

-- helpful indexes (cheap, optional)
create index if not exists team_items_kind_status_idx on team_items (kind, status);
create index if not exists team_items_assignee_idx    on team_items (assignee);
