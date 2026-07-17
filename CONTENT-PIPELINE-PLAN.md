# Content Pipeline Plan

**Owner:** Dipesh · **Author:** CTO (Claude) · **Status:** Plan — not started · **Drafted:** 2026-07-17

---

## The promise this protects

> **No question reaches a student until a human has verified it and an admin has published it.**

Everything below serves that one sentence. A scanned paper enters as **Pending**, is checked into **Verified**, and only an admin flips it to **Published**. Unverified content can never be live — not by mistake, not by a wrong click.

---

## The model: four stages, one source of truth

Every paper is always in exactly one stage. The stage is *computed*, not stored — it falls out of numbers the system already tracks (verified count, flagged count, total, live-or-not). **No new database columns are needed** for the core model.

| Stage | Plain meaning | How it's derived |
|-------|---------------|------------------|
| **Pending** | New paper, nobody has started | not live · 0 verified · 0 flagged |
| **In Review** | An editor is checking it | not live · (some verified **or** some flagged) · not all done |
| **Verified** (Ready) | Every question checked, waiting for you | not live · all questions verified |
| **Published** | Live to students | status = `live` |

**Architectural rule (the important one):** the stage is decided in **one place** — the `overview` action in `api/admin-paper.js` — which both the verify desk and the admin screen already call. That endpoint will return a `stage` field per paper. Both screens read `p.stage` and group by it. This guarantees the two screens can **never** show different stages for the same paper.

**CTO decision — what counts as "started":** a paper moves Pending → In Review the moment an editor **verifies or flags its first question**. No new buttons, no new data, ships immediately, fully reversible. If two editors ever start colliding on the same paper, we add an explicit "Start reviewing / being checked by [name]" claim later (Phase 1b, below). We do **not** build that now — it's speculative plumbing for a problem a small team doesn't have yet.

---

## Phase 0 — Safety foundations (do first, small, low-risk)

These protect the core promise. They ship before any cosmetic change.

**0.1 — Confirm new papers are born safe.**
The public shows only papers where `past_papers.status = 'live'`. So the whole promise rests on new papers defaulting to `draft`. None of the repo's SQL files create papers, so this default lives in Supabase and is currently **unverified from the code**.
- *Action:* check the `past_papers.status` column default in Supabase. It must be `draft` (or anything ≠ `live`).
- *If wrong:* change the column default to `draft`.
- *Risk:* none (read-only check; the fix only affects future inserts).

**0.2 — Make the publish gate a real wall (server-enforced).**
Today "only verified papers can go live" is enforced only by *hiding a button in the browser* ([admin.html:461](admin.html#L461)); the actual status change is an unguarded database write ([admin.html:509](admin.html#L509)). A bug, a stale page, or a direct call could publish an unverified paper.
- *Action:* add a `publish` / `unpublish` action to `api/admin-paper.js` (admin-role only). `publish` re-checks on the server that **every question is verified** before setting `status = 'live'`; it refuses otherwise. The browser calls this action instead of patching Supabase directly.
- *Bonus:* this becomes the single audited choke point for going live (we can log who published + when here).
- *Risk:* low. Backward-compatible; the UI simply points at the new action. Deployable to the shared Supabase with no data migration.

**0.3 — Protect against drift (LOCKED — by severity).**
A paper can currently be **live *and* unverified** — publish a verified paper, then edit/flag a question afterward, and it stays live. The admin grid literally has a colour for this state ([admin.html:442](admin.html#L442)). This is a rare "second eye caught something" case. We handle it by **how serious the change is:**
- **A question is FLAGGED on a live paper** = "this is WRONG." → **The paper is auto-pulled** back to **In Review** (students stop seeing it), admin is notified, it's fixed + re-verified, then republished. A known-wrong answer must not stay in front of a student.
- **A verified question is EDITED (no flag)** = a typo/wording tweak. → **The paper stays live.** Only *that one question* is quietly marked "re-check," so the **Verified** badge stays honest (Verified means *a human checked this exact text*, and the text changed).
- *Rationale:* severity-matched. Flags (real errors) protect students immediately; small edits don't pull a paper over a typo. The everyday flow is untouched — this is only the safety net.

---

## Phase 1 — Show the four stages everywhere (the main ask)

Pure presentation. Reads the new `stage` field from Phase 0's single source. No schema change.

**1.1 — Server: emit the stage.**
In `api/admin-paper.js` `overview`, compute and return `stage` (`pending` | `review` | `ready` | `published`) per paper, using the table above. One definition, both screens consume it.

**1.2 — Verify desk (`verify.html`): give Pending a home.**
Today new papers are buried inside subject cards with a small "Not started" badge ([verify.html:529](verify.html#L529)) — no waiting room of their own.
- Add a top-of-picker **"Pending — new papers waiting"** section listing every `pending` paper, so a worker sees exactly what to pick up next.
- Keep **"Continue verifying"** for `review` papers, and the **"Fully verified"** drawer for `ready`/`published`.
- Nothing deleted — we *promote* hidden Pending papers into their own visible section.

**1.3 — Admin (`admin.html`): stop lumping Pending with In Review.**
Today both fall into one "Being verified" group ([admin.html:475](admin.html#L475)).
- Split it: the Content tab reads top-to-bottom **Needs attention → Pending → In Review → Ready to publish → Published** — same words, same order as the verify desk.
- Update the coverage grid legend to match the four stages.

**1.4 — Consistent labels.**
One vocabulary everywhere: **Pending · In Review · Verified · Published**. No synonyms ("draft", "being verified", "not started") in the UI — they cause confusion for a new worker.

**Phase 1b (only if needed later):** explicit "Start reviewing" claim + "being checked by [name]" tag, so a paper enters In Review on claim rather than on first mark. Deferred until collisions actually happen.

---

## Phase 2 — AI paper ingestion ("Model A") — DEFERRED

Gated on: **company Anthropic account** (off the personal account). Do not start before then. Full design is in memory (`ai-paper-ingestion`). Summary:

- Worker opens an editor-only **"Add a paper"** screen, uploads the scan photos.
- Claude (vision, a stronger model than the practice page's Haiku) **drafts** every question — number, sub-parts, marks, English + Nepali.
- Worker corrects the few misreads in a review table, then saves.
- Saved questions land as **Pending** (draft) and flow into Phase 1's pipeline. AI can **never** publish; it only fills the top of the funnel.
- **Not covered:** diagrams (hand-authored SVG stays specialist). Extraction quality depends on scan cleanliness.
- Labelled clearly as a machine-made draft so the worker knows to check it.

---

## Decisions locked (CTO calls)

1. **One vocabulary, four stages** — Pending · In Review · Verified · Published.
2. **Stage computed once on the server** (`overview`), consumed by both screens — no drift possible.
3. **"Started" = first question marked** for now; explicit claim only if collisions appear.
4. **Publish enforced on the server**, not by a hidden button.
5. **No new database columns** for the core model; Phase 0.1 may change one column *default*.
6. **Build order (updated per owner — verify desk first).** The verify desk is where the real editing/verifying work happens, so it gets built and made right *before* admin. Admin is a mirror of the same server data and follows.
   1. Confirm the `draft` default (0.1) — kept first; "Pending" depends on new papers landing as drafts.
   2. Server emits the `stage` field (1.1).
   3. **Verify desk pipeline (1.2)** — the priority deliverable.
   4. Then admin: publish-gate wall (0.2), Pending/In-Review split (1.3), drift handling (0.3).
   5. Later, gated on company account: Phase 2 (AI ingestion).

## Design & UX (locked direction)

Built inside the site's design system (Direction A): **Fraunces** headlines + **Outfit** body; teal-emerald brand `#0f766e`, charcoal ink `#1f2933`, cool near-white surfaces; feedback colours reserved. The four stages get **one colour language, used identically in both screens** so the pipeline reads the same everywhere:

| Stage | Colour | Feel |
|-------|--------|------|
| **Pending** | slate `#52606d` + a soft coral `#fb6f5c` "new" dot | untouched, just arrived |
| **In Review** | amber `#f59e0b` | in progress (matches the reserved in-progress colour) |
| **Verified** | green `#16a34a` | all checked (reserved success) |
| **Published** | teal `#0f766e` (brand) | live / public |

The progression slate → amber → green → teal reads as a natural "cold → warming → done → out in the world" flow.

**Signature elements:**
1. **Pipeline rail** — a horizontal 4-segment bar at the top of *both* the admin Content tab and the verify desk, showing live counts **Pending → In Review → Verified → Published** with a subtle flow arrow. The at-a-glance "where does everything stand," doubling as jump navigation.
2. **Stage sections** — clean cards grouped under each stage. Each card shows paper identity, subject chip, verified/total progress, who verified it, and **only the action valid for that stage** (the Publish button appears *only* under Verified).
3. **Drift treatment** — a flagged live paper renders as **"Pulled for a fix"** and drops to In Review; a small edit shows a quiet **"re-check this question"** chip without pulling the paper.
4. **One story, two screens** — identical rail, colours, and words in the verify desk and admin, guaranteed because both read the same server `stage` field.

**Mobile:** the rail collapses to a compact scrollable strip; stage sections stack vertically.

## Verify desk — future-proof architecture (LOCKED)

Design the verify desk as a **generic Verification Console**, not a SEE-past-papers page. One shell; content types plug in; one universal pipeline. This is built *first* (before admin) because it's where the real verifying work happens.

**Navigation nests in four levels:** `Exam → Mode → Stage → Item`.
- **Exam** — SEE today; a switcher that becomes a dropdown past ~3 exams. Everything is scoped to an exam. The **Board** tab stays a peer (team ops, not content). Driven by the existing `EXAMS` config in `verify.html`.
- **Mode** — what kind of content. Three *species* (this is the future-proofing):
  1. **Pipeline modes** (verify-before-publish): **Past papers, Chapter practice, Mock tests** — all share the four-stage rail.
  2. **Lens modes** (cross-cutting filters, not content types): **Flags**, later *My queue*, *Recently published* — read across all pipelines.
  3. **Curation modes** (pick already-verified content): **Daily questions** — downstream of verification; a lighter flow, NOT forced into the stage pipeline.
- **Stage** — the universal Pending → In Review → Verified → Published rail (within pipeline modes only).
- **Item** — the per-item editor (already exists for papers).

**Adapter contract — how any content type plugs in.** Each content type provides: `list()` → items with verified/total/flagged counts (shell derives the stage) · `load(id)` → questions to edit · `verify`/`flag` → actions · `publish(id)` → the type defines what "publish" means (a paper, a whole mock test, a chapter question). The shell — rail, picker, stage sections, editor chrome — is written once and reused. New content type = a small adapter, not a new page.

**Data contract.** Every verifiable question table (`past_paper_questions`, `chapter_questions`, `mock_questions`) carries the SAME verification fields — `verified, verified_by, verified_at, flagged, flag_note` — so one server `stage` rule works everywhere. Provision these columns on each table as it joins the pipeline.

**Build now vs. provision for later.** Build the shell generic (mode registry, stage-rail component, adapter interface, dropdown-ready exam switcher); fully wire only **SEE past papers**. Register chapter practice, mock tests, and future exams as inert "coming soon" entries that light up when their adapter + data land. The 2nd/3rd content type is then cheap — that is the future-proofing.

**Architecture decisions locked:**
- Board is a **peer to exams** (ops, not content).
- Daily is **curation, not a stage pipeline** — never forced into Pending/Verified.
- Flags is a **lens across all pipelines**, not its own content type.
- Publish semantics are **per-adapter** (paper = whole paper · mock = whole test · chapter = per chapter/question).

## AI intake — the pipeline's front door (lives in the verify desk)

"Add a paper" is an **intake action inside a pipeline mode**, not a separate mode. It is the front door that *feeds Pending* (the least-trusted end):

```
+ Add paper (AI wizard)  →  Pending  →  In Review  →  Verified  →  Published
```

**The wizard — four steps, all inside the verify desk:**
1. **Upload** — drop the scan photos; confirm exam · year · province · subject (AI can pre-guess from the page).
2. **Reading** — Claude (vision, a stronger model than the practice-page Haiku) extracts every question; progress shown.
3. **Review & fix** — an editable table of the drafted questions (number, marks, English, Nepali); the worker corrects misreads. Labelled clearly: *"auto-draft — check before saving."*
4. **Save to Pending** — commits as a **draft** paper; it appears in the **Pending** stage, invisible to students.

**Principles:**
- AI intake is an **action/wizard, not a persistent stage** — keeps the four-stage pipeline clean; correction happens in the wizard, nothing half-baked persists.
- The **AI never publishes** — output enters at Pending and must pass human verification.
- **Two human touches by design:** the uploader corrects in the wizard (first eye), an independent editor verifies in the pipeline (second eye).
- **Future-proof:** because it's an adapter action, chapter practice / mock tests can add their own "Add via AI" intake later, reusing the wizard shell.
- **Diagrams stay hand-authored** — the wizard flags any question that looks like it has a figure, so a human draws the SVG per the CLAUDE.md figure standard. AI reads words, not figures.
- **Gated on the company Anthropic account** (Phase 2). The Pending section and pipeline (Phase 1) ship first and work with SQL-entered papers; the wizard slots into the front door when the account is ready.

## Open questions for the owner

- *(resolved)* Four labels **Pending · In Review · Verified · Published** — approved.
- *(resolved)* Drift handling — **flag pulls the paper down, small edit keeps it live** — approved.
- None outstanding. Plan is fully specced and ready to execute on "go."

## Risk & guardrails

- **Shared Supabase (dev + prod, one database).** Phases 0.2 and 1 are code-only and backward-compatible — safe to ship on `dev` and promote normally. Phase 0.1 touches a column *default* (affects only future rows, not existing data) — still low-risk, but do it deliberately.
- **No test suite** (per repo norms) → verify each phase by hand in `vercel dev`: enter a fake paper → confirm it shows Pending everywhere and is invisible to students → verify it → confirm it moves to In Review then Verified → publish → confirm it appears to students and only then.
- **Rollback:** every phase is a small, self-contained change; revert the branch if anything misbehaves. No destructive migrations anywhere in Phases 0–1.

---

## What "done" looks like

A worker scans a paper → it appears as **Pending** in both the verify desk and admin, invisible to students. An editor checks it → it shows **In Review**. All questions verified → **Verified**, and only then can you **Publish** → it goes live. At no point can unverified content reach a student, and both screens always tell the same story.
