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

Module style: all `api/` functions use ESM (`export default async function handler`). (Historically `api/see-papers.js` used CommonJS; it was standardized to ESM.) Keep new functions ESM to match.

### Auth & roles
- Supabase Auth issues a JWT. The client stores it in `localStorage` as `ujyalo_token` and the user object as `ujyalo_user` (other client keys: `ujyalo_conf`, `ujyalo_progress`, `ujyalo_bookmarks`).
- **Roles are read from the `users` table, never hardcoded by email.** `auth.js` login maps role → landing page: `student → /dashboard.html`, `admin → /admin.html`, `teacher → /teacher.html`, `parent → /parent.html`, `editor → /verify.html`.
- A new auth user gets a `users` row automatically via a Postgres trigger (`on_auth_user_created → handle_new_user()`), so signup code does not insert it.
- Privileged endpoints re-verify on every call: take the caller's Bearer token, resolve the user via `/auth/v1/user`, then look up their `role` in the `users` table with the service key before allowing the action (see `getEditor()` in `api/admin-paper.js`). Don't trust client-claimed roles.

### Key backend files
- `api/auth.js` — all authentication + the public `config` action that hands the anon key to the browser.
- `api/practice.js` — chapter questions + AI: `generate`/`evaluate` call Anthropic; also reads `chapter_questions` and writes attempts/progress.
- `api/admin-paper.js` — editor/verification workflow for past papers; only `EDITABLE` fields can be patched; actions `whoami | list | load | update-field | set-status`.
- `api/admin-users.js` — admin-only (verified `admin` role). Actions: list users (GET, no action), `set-role` (POST), `messages` (GET — contact-form inbox), `stats` (GET — exact dashboard counts via Postgres `count=exact`). Reads with the service key so counts aren't capped (~1000-row limit) or RLS-filtered the way browser reads are — the admin dashboard reads its stats/messages here, not directly from Supabase.
- `api/see-papers.js` / `api/see-paper.js` / `api/see-paper-print.js` — past-paper library, single-paper view, print/PDF rendering.
- `api/contact.js`, `api/waitlist.js` — forms (email via Resend). `api/sitemap.js` — dynamic sitemap (rewritten from `/sitemap.xml`).

### Supabase tables in use
`users`, `chapter_questions`, `chapter_attempts`, `attempt_events`, `past_papers` (with `exam_subjects`), `waitlist`, `contact_messages`. Rows are typically gated by a `status` column (e.g. `status=eq.live` for published questions/papers; the verification flow moves papers toward a published/`live` state).

### Frontend
- `scripts/components.js` injects the shared **nav + footer on every page** and contains a site-wide SEE-exam countdown controlled by the single `SEE_EXAM_DATE` constant (blank = off; set to `YYYY-MM-DD` when NEB announces the date). It builds different navs for public vs. logged-in staff (`buildStaffNav`) based on role.
- `scripts/see-paper-client.js` drives the past-paper viewer. It reads paper identity from the **clean URL path first** (`/see/past-papers/:year/:province/:subject`) and falls back to the legacy query string (`?year=&province=&subject=`).
- `scripts/practice.js` drives the practice page (subject select → `POST /api/practice`).
- `styles/main.css` is the global stylesheet. **Design system — "Direction A" (green-forward, migrated 2026-07 on `dev`):** Fraunces (headlines) + Outfit (body). Palette — **teal-emerald brand `#0f766e`** (deep `#0b5c55`, soft tint `#d3f0ec`), **coral accent `#fb6f5c`** used *sparingly* for energy only (streaks, daily-goal, hot/new/free pops, the free-practice announcement band), **charcoal `#1f2933`** for ink/headings (muted `#52606d`), **cool near-white surfaces** (`#f7faf8` bg, `#ffffff` card, `#e6eae8` line). **Reserved feedback colours (never reuse for brand):** success/correct = green `#16a34a`/`#22c55e`, error = crimson `#e11d48`, warning/in-progress = amber `#f59e0b`. Retired: marigold (`#f59e0b` as brand), forest-green (`#11302a`), brass (`#c0913f`), warm creams (`#f4f0e6`) — don't reintroduce. **`components.js` `GLOBAL_STYLES` `:root` is the single source of truth** — it's injected at runtime and overrides every page's tokens, so palette changes go there first. `--orange` = coral, brand teal = `--teal`/`--brass`/`--navy`→charcoal. Green survives in the logo diya + the hero sun illustration.
- `scripts/ujyalo-auth.js` — tiny, side-effect-free `ujyaloGetUser()` / `ujyaloGetToken()` (read the signed-in user/token from localStorage). Loaded **before** the inline script on login/dashboard/profile/admin/verify. `components.js` keeps its own inline reads on purpose (so it has no load-order dependency across the ~15 pages it serves).
- Tabler icons (`ti ti-*`) load **per page** via a CDN `<link>` only where used (home, admin, chapter-practice…); `see.html` uses emoji, not Tabler — match the page you're editing.

### Routing (`vercel.json`)
Only URL rewrites, no build/env config. It maps `/sitemap.xml → /api/sitemap`, `/see → /see.html`, `/see/past-papers → /see.html` (the library — repointed here; the old `see-past-papers.html` never existed), and `/see/past-papers/:year/:province/:subject → /see-paper.html` (single paper).

## Conventions to follow

- Keep the **service key server-side**; the only secret the browser may receive is the anon key via the `config` action.
- Add operations as new `?action=` branches in the existing `api/` file; match that file's ESM/CJS style.
- Roles come from the `users` table — don't reintroduce hardcoded email checks.
- Most `.html` pages are standalone; rely on `components.js` for nav/footer rather than duplicating markup.
- **Palette discipline (Direction A):** teal-emerald brand `#0f766e` + charcoal ink `#1f2933` + cool near-white surfaces. Coral `#fb6f5c` is the accent — use it *sparingly* (streaks/goals/hot-new-free), never on ordinary links/buttons (those are teal). Keep feedback colours reserved and distinct from brand: green success, crimson error, amber warning/in-progress. Don't reintroduce marigold-as-brand, forest-green, brass, or warm creams. Per-subject signal colours (maths blue, science green, etc.) and the logo stay as-is.
- **No fabricated content:** the site is pre-launch — never add fake stats, user counts, or testimonials. Use honest copy until real data exists.
- **Admin counts come from the server:** the browser only sees a capped/RLS-filtered slice of tables, so compute dashboard counts via `api/admin-users?action=stats` (service key, `count=exact`), not client-side `.length`.

## Figure standard (`diagram_svg`) — every figure must follow this

Figures are hand-authored SVG stored in `past_paper_questions.diagram_svg` (and rendered
by three places: `styles/see-paper.css`, `see.html` daily, `api/see-paper-print.js`).
Renderers **silently drop** any SVG that fails to parse, so a broken figure disappears
with no error. Follow these rules exactly when drawing or editing one.

**Canvas — the most important rule.** Always `viewBox="0 0 320 H"` (H free). Every renderer
caps figures at ~340–360px wide, so 320 units ≈ 1 unit per pixel: what you draw is what is
seen. Drawing wider does **not** buy space — it only shrinks the text (a 640-wide canvas
renders its labels at ~7px, unreadable). A figure that needs more room grows **taller**,
never wider.

- `font-size` ≥ 12, `stroke-width` ~1.5 — safe because the canvas is fixed.
- **Always set `width` and `height` on the root `<svg>` to match the viewBox** (e.g.
  `<svg width="320" height="180" viewBox="0 0 320 180">`). CSS still overrides it, but the
  figure then survives anywhere CSS doesn't reach. Omitting them is what made 2082 Bagmati
  Q11 collapse into an empty box.
- Root must carry `xmlns="http://www.w3.org/2000/svg"`, `role="img"`, and
  `font-family="Outfit, Noto Sans Devanagari, system-ui, sans-serif"` (the Devanagari
  fallback is what makes Nepali labels render), plus a `<title>` and `<desc>`.

**Palette — match the site, not the old one.** Ink/strokes `#1f2933`, muted `#52606d`,
teal `#0f766e`, soft fill `#d3f0ec`, white `#ffffff`. Never `#11302a`, `#1a1208`, `#5d685f`,
warm creams (`#e5e0d5`, `#fbf9f3`) or slate (`#334155`, `#475569`) — those are the retired
palette and still appear in older figures.

**No IDs, no `<defs>`, no `<marker>`.** SVG IDs are page-global and many figures render on
one paper, so `url(#x)` can resolve to another figure's element. Draw arrowheads as plain
`<polyline>` (2082 Bagmati Q11 does this). If an ID is truly unavoidable, prefix it with the
question (`q11-...`).

**Must parse as XML** — escape `&` as `&amp;`; no HTML entities like `&nbsp;`. No `<script>`,
no `<foreignObject>`, no external images/fonts/URLs (the CSP blocks them anyway).

**Never reveal the answer.** `diagram_svg` shows only what the question *gives*. Any figure
that contains the result (a completed Punnett square, a solved value, a drawn conclusion)
belongs in `answer_text`, not the question. This is a recurring bug — check it every time.

**Placement.** A figure renders after the question text by default; put `[[diagram]]` in the
question text to render it at that point instead.

Check a figure with `python3 tools/check-figures.py <file.sql|->` before applying it.
