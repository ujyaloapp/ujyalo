# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working with the owner (read first)

- The owner is non-technical and solo on the tech side. Always explain what you're doing in plain, non-jargon language.
- Before changing any file, briefly say what you'll change and why, and show the change for approval. Prefer small, reviewable changes over large sweeping ones.
- Default to working on the `dev` branch.
- Never commit, push, or merge to `main` (the live production site) without explicit confirmation from the owner. When the owner wants to go live, walk them through it step by step.
- Never deploy untested changes. Verify locally with `vercel dev` first.

## What this is

Ujyalo is a free SEE (Secondary Education Examination — Nepal's national grade-10 exam) practice and past-papers web app. It is a **static HTML/CSS/JS site with serverless API functions**, deployed on **Vercel**, backed by **Supabase** (Postgres + Auth) and **Anthropic** (Claude) for AI question generation/evaluation.

There is **no build step, no `package.json`, no test suite, and no linter**. Pages are hand-authored `.html` files at the repo root; shared behavior lives in `scripts/` and `styles/`; the backend is plain Node serverless functions in `api/`.

## Commands

- **Local dev:** `vercel dev` (runs the static site + `api/` functions together; install with `npm i -g vercel` if missing). Opening `.html` files directly will not work because every page calls the `/api/*` functions.
- **Deploy:** push to a branch — Vercel auto-deploys. The **production branch is `main`** (repo default); `dev` and `staging` produce preview deployments. There is no deploy config in the repo; the Git/production-branch mapping lives in the Vercel dashboard, not here.
- **Tests/lint:** none exist. Verify changes by running `vercel dev` and exercising the page in a browser.

## Required environment variables

Set in the Vercel project (not committed). All `api/` functions assume these exist:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY` — anon key is the only Supabase value ever sent to the browser (via `GET /api/auth?action=config`).
- `SUPABASE_SERVICE_KEY` — service-role key, **server-side only**; used for any privileged read/write. Never expose it to client code.
- `ANTHROPIC_API_KEY` — used by `api/practice.js` (model `claude-haiku-4-5`).
- `RESEND_API_KEY` — transactional email (contact/waitlist).

## Architecture

### Request flow
Browser page (`*.html`) → `fetch('/api/<name>?action=<verb>')` → serverless function in `api/` → Supabase REST (`/rest/v1/...`) or Auth (`/auth/v1/...`) or Anthropic. The browser never talks to Supabase directly for privileged data; the API layer is the trust boundary that holds the service key.

### API convention (important)
Each file in `api/` is **one Vercel function that multiplexes many operations via an `?action=` parameter** (and HTTP method), not one endpoint per file. To add behavior, add another `if (action === '...')` branch in the relevant file rather than a new file. Example actions: `auth.js` handles `login | signup | forgot-password | change-password | config | get-role`.

Module style is inconsistent and **intentional to match the file you're editing**: most functions use ESM (`export default async function handler`), but `api/see-papers.js` uses CommonJS (`module.exports`). Match the existing file.

### Auth & roles
- Supabase Auth issues a JWT. The client stores it in `localStorage` as `ujyalo_token` and the user object as `ujyalo_user` (other client keys: `ujyalo_conf`, `ujyalo_progress`, `ujyalo_bookmarks`).
- **Roles are read from the `users` table, never hardcoded by email.** `auth.js` login maps role → landing page: `student → /dashboard.html`, `admin → /admin.html`, `teacher → /teacher.html`, `parent → /parent.html`, `editor → /verify.html`.
- A new auth user gets a `users` row automatically via a Postgres trigger (`on_auth_user_created → handle_new_user()`), so signup code does not insert it.
- Privileged endpoints re-verify on every call: take the caller's Bearer token, resolve the user via `/auth/v1/user`, then look up their `role` in the `users` table with the service key before allowing the action (see `getEditor()` in `api/admin-paper.js`). Don't trust client-claimed roles.

### Key backend files
- `api/auth.js` — all authentication + the public `config` action that hands the anon key to the browser.
- `api/practice.js` — chapter questions + AI: `generate`/`evaluate` call Anthropic; also reads `chapter_questions` and writes attempts/progress.
- `api/admin-paper.js` — editor/verification workflow for past papers; only `EDITABLE` fields can be patched; actions `whoami | list | load | update-field | set-status`.
- `api/admin-users.js` — admin user management.
- `api/see-papers.js` / `api/see-paper.js` / `api/see-paper-print.js` — past-paper library, single-paper view, print/PDF rendering.
- `api/contact.js`, `api/waitlist.js` — forms (email via Resend). `api/sitemap.js` — dynamic sitemap (rewritten from `/sitemap.xml`).

### Supabase tables in use
`users`, `chapter_questions`, `chapter_attempts`, `attempt_events`, `past_papers` (with `exam_subjects`), `waitlist`, `contact_messages`. Rows are typically gated by a `status` column (e.g. `status=eq.live` for published questions/papers; the verification flow moves papers toward a published/`live` state).

### Frontend
- `scripts/components.js` injects the shared **nav + footer on every page** and contains a site-wide SEE-exam countdown controlled by the single `SEE_EXAM_DATE` constant (blank = off; set to `YYYY-MM-DD` when NEB announces the date). It builds different navs for public vs. logged-in staff (`buildStaffNav`) based on role.
- `scripts/see-paper-client.js` drives the past-paper viewer. It reads paper identity from the **clean URL path first** (`/see/past-papers/:year/:province/:subject`) and falls back to the legacy query string (`?year=&province=&subject=`).
- `scripts/practice.js` drives the practice page (subject select → `POST /api/practice`).
- `styles/main.css` is the global stylesheet (design system: Fraunces + Outfit fonts, "Editorial Scholar" palette — forest `#11302a`, brass `#c0913f`).

### Routing (`vercel.json`)
Only URL rewrites, no build/env config. It maps `/sitemap.xml → /api/sitemap`, `/see → /see.html`, and the clean past-paper paths to their `.html` files. Note: `/see/past-papers` rewrites to `see-past-papers.html`, which does not currently exist in the repo — keep this in mind when touching that route.

## Conventions to follow

- Keep the **service key server-side**; the only secret the browser may receive is the anon key via the `config` action.
- Add operations as new `?action=` branches in the existing `api/` file; match that file's ESM/CJS style.
- Roles come from the `users` table — don't reintroduce hardcoded email checks.
- Most `.html` pages are standalone; rely on `components.js` for nav/footer rather than duplicating markup.
