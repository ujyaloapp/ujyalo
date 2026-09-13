-- ============================================================
-- Make dpskarki100@gmail.com an admin
-- ============================================================
-- Why: the ujyalo.app premium mailbox is being cancelled, so the old
-- admin@ujyalo.app account will lose password resets and access.
-- This moves admin rights to a personal Gmail that is not going away.
--
-- HOW TO RUN: Supabase dashboard -> SQL Editor -> New query ->
-- paste this whole file -> Run. Read the result of each step.
--
-- IF STEP 1 RETURNS NO ROWS, the account does not exist yet. Sign-ups are
-- blocked on the site, so create it by hand first:
--   Supabase -> Authentication -> Users -> Add user
--   email: dpskarki100@gmail.com, set a password,
--   tick "Auto Confirm User", then come back and run this again.
-- ============================================================


-- STEP 1 — does the account exist? (expect exactly one row)
select u.id, a.email, u.role
from public.users u
join auth.users a on a.id = u.id
where lower(a.email) = 'dpskarki100@gmail.com';


-- STEP 2 — promote to admin
update public.users u
set role = 'admin'
from auth.users a
where a.id = u.id
  and lower(a.email) = 'dpskarki100@gmail.com';


-- STEP 3 — confirm it worked (role must now read 'admin')
select u.id, a.email, u.role
from public.users u
join auth.users a on a.id = u.id
where lower(a.email) = 'dpskarki100@gmail.com';


-- STEP 4 — who else holds admin or editor rights right now?
-- Any account on an @ujyalo.app address is about to lose its mailbox,
-- which means no password reset and no email confirmation for it.
select a.email, u.role
from public.users u
join auth.users a on a.id = u.id
where u.role in ('admin', 'editor')
order by u.role, a.email;
