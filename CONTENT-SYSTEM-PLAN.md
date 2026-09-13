# CONTENT-SYSTEM-PLAN.md

**The blueprint for a content system a *team* can run — not just the two founders.**
Companion to `CONTENT-PIPELINE-PLAN.md` (which covers verify → publish). This one covers the
*structure* underneath it: exams, subjects, chapters, and how every content type is added,
edited, and deleted through the UI — with no SQL, no database poking, and no AI required.

Status: **blueprint agreed 2026-08-01.** Building happens phase by phase; nothing here ships
until it's built, tested on the dev preview, and the owner says go live.

---

## 0. Why we're doing this now

Today the site runs on **two people who know the conventions.** That won't survive growth.
When we hand work to a team, they must be able to do *everything* — add an exam, a subject, a
chapter, a question; edit and delete safely — from clean screens, without touching code or the
database. If we don't fix the foundation now, every new person multiplies the mess.

**Design goal:** a new teammate is fully productive on day one using only two screens (Admin +
Verify desk), and can't accidentally break or expose anything.

---

## 1. The core idea — three layers, kept separate

Content really has three layers. Today they're tangled (some in code, some in the database,
some improvised as free text). Untangling them is the whole project.

| Layer | What it is | Stored **today** | The fix |
|-------|-----------|------------------|---------|
| **Catalog** (skeleton) | Exam → Subject → Chapter | Exam = hardcoded in `verify.html`; Subject = split between `exam_subjects` table *and* a hardcoded `SUBJ_CFG` in code; Chapter = free text (`chapter_name`) typed on each question | Make all three **real tables with UI to manage them** — one source of truth |
| **Content** (flesh) | Questions, papers, mocks, daily | Separate tables, added by hand in the DB | Add/edit/**soft-delete** through the UI for every type |
| **Workflow** (rules) | Verify → Publish, who's allowed | Built well: generic verify desk, server-enforced publish | Keep; extend with roles + audit |

The mess we fear comes from **Layer 1**. Fix the skeleton first and everything else gets easy.

---

## 2. Target architecture — one spine, two views, one source of truth

**The spine** — everything hangs off a managed catalog:

```
Exam (SEE, +future)  →  Subject (Maths…)  →  Chapter (Algebra…)  →  Question / Paper / Mock / Daily
```

A question **points at** a chapter by ID — it never stores a typed-in chapter name. So "Algebra"
can't fork into "algebra"/"Algbra", and renaming a chapter fixes it everywhere at once.

**Two views over the same data** (this is how admin + verify stop being a mess and start working
together):

- **Admin = the control room.** Manage the catalog (exams/subjects/chapters), manage people &
  roles, **publish**, see history. The "structure & oversight" job.
- **Verify desk = the workshop.** Add/edit questions, verify, flag. The "content" job.
- Both read the **same server data** and use the **same words** (Pending → In review → Verified →
  Published). Computed once on the server so the two screens can never disagree.

**Everything through the UI. No SQL. No AI required** for the team's daily work.

**Leverage what's already right:** the verify desk is already built as a *generic console*
(`Exam → Mode → Stage → Item`) where a new content type or exam plugs in as a small adapter, not a
new page. We extend that; we don't rebuild it.

---

## 3. The Catalog data model (proposed)

New/changed tables. Exact column names finalize when we build Phase 1.

**`exams`** *(new — replaces the hardcoded `EXAMS` array)*
- `id`, `key` (unique, e.g. `see`), `name` (`SEE`), `full_name`, `grade`, `sort_order`, `active`, `created_at`

**`subjects`** *(extend the existing `exam_subjects` — kills the split-brain with `SUBJ_CFG`)*
- keep `id`, `code`, `name`; **add** `exam_id` (FK → exams), `name_np` (Nepali), `color`, `icon`,
  `sort_order`, `active`
- migrate the hardcoded `SUBJ_CFG` (Nepali name, icon, order) into these columns; the frontend then
  reads subjects from an API instead of a code constant

**`chapters`** *(new — turns free-text `chapter_name` into a real entity)*
- `id`, `subject_id` (FK → subjects), `name`, `name_np`, `slug`, `sort_order`, `active`, `created_at`
- `chapter_questions` gains `chapter_id` (FK). Migration: derive the distinct `chapter_name` values
  per subject → create chapter rows → map each question → **human dedupes near-duplicates** →
  reads switch to `chapter_id`. Keep `chapter_name` until the switch is proven, then retire it.

**Content tables — one shared shape.** Every question table (`past_paper_questions`,
`chapter_questions`, `mock_questions`) carries the *same* fields so one set of rules works
everywhere: `verified, verified_by, verified_at, flagged, flag_note, status`, plus the right
catalog FKs. (Chapter questions already got the verification fields; mocks still need them.)

---

## 4. Roles & permissions (start with two, designed to grow)

| Capability | editor | admin |
|-----------|:------:|:-----:|
| Verify / flag / edit questions | ✅ | ✅ |
| Add questions & papers (all types) | ✅ | ✅ |
| Soft-delete content | ✅ | ✅ |
| **Publish / unpublish** | ❌ | ✅ |
| **Manage catalog** (exam/subject/chapter) | ❌ | ✅ |
| Manage people & roles | ❌ | ✅ |
| View audit log | ❌ | ✅ |

Roles come from the `users` table (already the case) — never hardcoded by email. Extra roles
(e.g. a `content-lead` who can manage chapters but not people) slot in later without a redesign.

---

## 5. Cross-cutting rules (non-negotiable for a team)

1. **Soft delete only.** Content and catalog items are never truly erased — they're archived
   (`active=false` / `status=archived`) and recoverable from a "recycle bin". Protects against a
   mis-click wiping a paper.
2. **Audit log.** One `activity_log` table (`actor_email, action, entity_type, entity_id, detail,
   created_at`), written server-side on every change. With >2 people you must know who did what.
3. **12-function Vercel cap.** New API work is an `?action=` branch inside existing files (like
   `create-paper`), **or** we upgrade to Vercel Pro. **Decision needed early** — this shapes how
   much we can build cleanly.
4. **Shared dev/live database.** Structural changes touch both. Always roll out **code first, data
   second**, and test on the dev preview before any migration runs against live.
5. **One vocabulary, one server truth.** Admin and verify never compute state independently.

---

## 6. Phased roadmap (realistic for two people, extensible for a team)

Each phase is shippable on its own and leaves the site working.

### Phase 0 — Blueprint & decisions *(this doc)* ✅ in progress
- Agree architecture, catalog model, roles, constraints. Decide the Vercel-cap question.

### Phase 1 — Catalog foundation *(the keystone — start here)*
- Create `exams`, `chapters`; extend `subjects`. Migrate hardcoded `EXAMS`/`SUBJ_CFG` and
  free-text chapters into the tables (human dedupe pass on chapters).
- Admin **"Catalog"** screen: add / edit / archive exams, subjects, chapters.
- Frontend reads subjects & chapters from an API — delete the hardcoded lists.
- **Done when:** a new subject or chapter can be added in the UI and immediately appears in the
  verify desk and practice, with zero code change.

### Phase 2 — Content CRUD everywhere, via UI
- Extend the "Add a paper" pattern to **add / edit / delete** for every type (papers, chapter
  practice, mocks), all with soft-delete.
- **Done when:** the team can author and correct any content type without SQL or the DB dashboard.

### Phase 3 — Team safety rails
- Enforce the role matrix in the UI *and* on the server. Add the audit log + a recycle bin to
  recover soft-deleted items.
- **Done when:** every change is attributable, and nothing can be permanently lost by accident.

### Phase 4 — Onboarding & guardrails
- Short "how to" per role in `docs/team/`. Sensible defaults, confirmations on destructive actions.
- **Later, gated on the company Anthropic account:** AI intake ("Add via scan"), which already has
  its UI designed — it just feeds the same Pending pipeline. See `ai-paper-ingestion` note.

---

## 7. Deferred / explicitly out of scope for now
- AI content generation for the team (gated on company account; humans-first regardless).
- Multiple exams beyond SEE — the model supports it, but we wire only SEE until a second exam is real.
- Fine-grained roles beyond editor/admin — provisioned for, not built yet.

---

## 8. Immediate next step
Phase 1, starting with **making "Chapter" a real thing** — it's the layer getting messier every
day and the biggest "only the founder can do it" bottleneck. Before touching the shared database
we (a) draft the catalog SQL for review, and (b) build a clickable **Catalog admin prototype** so
the owner can feel it first — same prototype-then-build rhythm that worked for "Add a paper".
