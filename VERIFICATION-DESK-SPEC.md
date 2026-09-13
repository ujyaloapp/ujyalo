# The Verification Desk — a spec you can hand to another project

**What this document is:** a complete description of the "verification desk" pattern we
built for Ujyalo, written so a different team (or an AI coding agent) can build the same
thing for a different product, without seeing our code. Nothing here is Ujyalo-specific
except the examples.

Copy this whole file into the other project and say: *"Build this."*

---

## 1. The problem it solves

Any product that publishes **content a human must trust** — exam questions, legal answers,
medical facts, product data, translations, AI-drafted anything — has the same risk:

> Wrong content reaches the end user, and nobody notices until the user is harmed by it.

The naive fix is "we'll be careful." That fails the moment more than one person is adding
content, or the moment a machine drafts it.

The verification desk is the fix: **a separate internal screen where every piece of content
must be checked by a named human before it can ever be seen by a user, enforced by the
server, not by a hidden button.**

---

## 2. The one promise (write this at the top of your build)

> **No item reaches a user until a human has verified it and an authorised person has
> published it.**

Every rule below exists to protect that one sentence. If a design decision doesn't serve it,
drop the decision.

---

## 3. The four stages

Every content item ("paper", "article", "record" — whatever your unit is) is always in
exactly **one** of four stages:

| Stage | Plain meaning | Derived from |
|---|---|---|
| **Pending** | Just arrived. Nobody has started. | not published · 0 checked · 0 flagged |
| **In review** | Someone is checking it. | not published · some checked **or** some flagged · not all done |
| **Verified** | Every part checked and clean. Waiting for a publish decision. | not published · all parts checked · 0 flagged |
| **Published** | Live to users. | published flag is on |

**Critical architectural rule:** the stage is **computed, not stored**. It falls out of
counts you already keep (checked count, flagged count, total parts, published yes/no).

- No new "stage" column. A stored stage will drift out of sync with reality and lie to you.
- The stage is computed in **exactly one place on the server** — one endpoint — and every
  screen reads that. If two screens each compute their own stage, they will eventually
  disagree about the same item, and you'll never fully trust either.

Design detail worth copying: **a flagged item is "In review", even if it is currently
published.** A known-wrong item must never sit in the "Published, all good" bucket.

---

## 4. Roles

Three roles, read from **the database**, never from a hardcoded list of emails:

| Role | Can do |
|---|---|
| **Editor / reviewer** | Open items, edit fields, mark a part verified, flag a part with a note |
| **Admin** | Everything an editor can, **plus** publish and unpublish |
| **Everyone else** | Cannot reach the desk at all (403) |

Splitting "verify" from "publish" is deliberate: the person doing the checking is not the
person who decides it goes live. That is the whole point of a review process.

---

## 5. Data model (adapt the names, keep the shape)

Two levels: a **container** and its **parts**. The container is what you publish; the part
is what a human verifies.

**Container** (e.g. `papers`, `articles`, `datasets`)
```
id
...your own descriptive fields (year, subject, title, source...)
status        text     -- 'draft' | 'live'   DEFAULT MUST BE 'draft'
complete      boolean  -- false = still being built (parts can be added/removed)
                       -- true  = locked, structure frozen
```

**Part** (e.g. `questions`, `sections`, `rows`)
```
id
container_id  fk
part_number   int          -- ordering / identity within the container
sub_part      text NULL    -- optional second level: 'a','b','c'
...your content fields (text, translation, answer, marks, tags, image/svg...)

verified      boolean NOT NULL DEFAULT false
verified_by   text NULL         -- the reviewer's email; who to ask about it later
verified_at   timestamptz NULL
flagged       boolean NOT NULL DEFAULT false
flag_note     text NULL         -- "what to fix", in plain words
```

Five columns (`verified`, `verified_by`, `verified_at`, `flagged`, `flag_note`) are the
entire verification system at the data layer. Everything else is UI.

**Two defaults that carry the whole promise. Check them explicitly:**

1. `container.status` defaults to `'draft'`. The public read is `WHERE status = 'live'`, so a
   new item is invisible from birth.
2. If parts can be machine-generated or bulk-imported, their status must default to hidden
   too, and `verified` must default to `false`. New content is untrusted content.

We got burned here: our defaults lived only in the database console, not in any file in the
repo, so nobody could confirm from the code that new items were born safe. **Put the defaults
in a checked-in migration file.**

---

## 6. API contract

One authenticated endpoint that multiplexes actions (`?action=...`). Every single call —
read or write — re-verifies the caller server-side:

1. Take the bearer token from the request.
2. Ask the auth provider who that token belongs to.
3. Look that user's **role** up in the database.
4. Reject with 403 unless the role is editor or admin.

Never trust a role sent by the browser. Never gate on email address.

**Read actions**

| Action | Returns |
|---|---|
| `whoami` | Confirms the caller is a reviewer; used to show their name |
| `overview` | Every container with: total parts, verified count, flagged count, **computed stage**, who verified most of it, last activity — plus a per-reviewer tally |
| `load` | One container in full: all parts grouped by `part_number`, each with its content, verified/flagged state and note; plus a progress summary |
| `flags` | Every flagged part across all containers — the "to fix" inbox |

**Write actions (POST only)**

| Action | Effect |
|---|---|
| `update-field` | Edit **one** field of one part. Server holds an allowlist of editable fields and refuses anything else. |
| `set-status` | Mark a part verified, or flag it with a note. Stamps who + when. |
| `add-part` / `delete-part` / `reorder-parts` | Structure changes — only allowed while `complete = false` |
| `set-complete` | Lock / reopen a container |
| `publish` / `unpublish` | **Admin only.** Publish re-checks the rules server-side and refuses if they fail. |
| `create` | Create a new container; it must land as a draft, in Pending |

A field allowlist matters more than it looks: without it, `update-field` is "let the browser
write any column it names," which is a privilege-escalation hole (`role`, `status`, `id`...).

---

## 7. The safety rules (this is the actual product)

These four rules are what separate a real verification system from a checklist UI.

**7.1 — The publish gate is a server wall, not a hidden button.**
Hiding the Publish button when an item isn't ready is *not* enforcement — a stale page, a
bug, or a direct API call gets around it. The `publish` action must re-check, on the server,
at the moment of publishing:

- caller's role is admin, **and**
- the container is marked complete, **and**
- it has at least one part, **and**
- **no** part is flagged, **and**
- **every** part is verified.

Any failure → refuse with a plain-English reason ("Every question must be verified before
publishing."). This one function is also your audit choke point: it's the only place content
can become public, so log it.

**7.2 — Drift guard, soft: editing verified content un-verifies it.**
"Verified" must mean *a human checked this exact text*. So when a reviewer edits a content
field of an already-verified part, the server silently sets `verified = false` on **that
part only** and tells the UI, which nudges "please re-verify this." The container stays live
— you don't pull a whole publication offline over a typo.

Only *content* fields trigger this. Metadata (tags, difficulty, ordering) does not.

**7.3 — Drift guard, hard: flagging pulls a live item down.**
Flagging means "this is wrong." If a reviewer flags a part of a **published** container, the
server immediately sets the container back to draft. Users stop seeing it, it moves to In
review, it gets fixed, re-verified and republished. A known-wrong answer must not stay in
front of a user for even an hour.

Two guards, matched to severity: typos don't unpublish; errors do. Both are automatic.

**7.4 — Structure locks.**
While a container is being built (`complete = false`) parts can be added and removed. Once
it's marked complete, structure is frozen — you can still fix text, but you can't
accidentally add a stray part to a finished publication. Reopening a *published* container
unpublishes it, because its contents are about to change.

---

## 8. The screens

**8.1 — Dashboard (the landing view).** The reviewer opens the desk and sees:

- A "% clean" ring: proportion of parts verified and unflagged.
- Headline stats: items live, parts verified, flags to fix, active reviewers.
- Four clickable stage boxes (Pending / In review / Verified / Published) with counts —
  clicking one scrolls to that section.
- Below, the items grouped into those four sections as cards. Each card shows a progress
  bar (verified / total), a flag count, and who has been working on it.
- **Empty stages are hidden entirely**, not shown as empty placeholders. And each section
  shows a limited number of cards with a "show more" — otherwise the dashboard becomes an
  endless scroll as content grows.
- A **team panel**: each reviewer, how many parts they've verified, as a ranked bar chart
  with a combined total. This is the single highest-leverage motivational feature we built —
  volunteer reviewers work visibly harder when their count is on the wall. Only current
  staff appear; removed accounts vanish.

**8.2 — Item view (where the work happens).** One card per part:

- A coloured state chip: Unverified / ✓ Verified / ⚑ Flagged.
- If flagged, the note renders as a **"What to fix"** banner right under the chip — the
  reviewer coming to fix it sees the reason before the content.
- Every editable field is click-to-edit inline (click text → textarea → Save/Cancel), saving
  one field per request. No giant form, no "save everything" button that can half-fail.
- Sub-parts render nested under their parent with add / remove / reorder controls.
- Footer buttons: **✓ Mark verified** and **⚑ Flag for review** (flag asks for a short note).
- Once verified, the footer shows "Verified by [name]" — accountability is visible.
- A running progress bar (X of Y verified) plus, in our case, a marks tally that turns red
  when the parts don't sum to the expected total. **Add your own equivalent consistency
  check** — a cheap arithmetic check catches transcription errors no human will spot.

**8.3 — Flags inbox.** Every flagged part across every item in one list, each with its note
and a link straight to that part. This is the reviewer's daily to-do list. Show the count as
a badge on the tab so it nags.

**8.4 — Tabs for other content types.** Our desk verifies three different content types
(past papers, practice questions, daily picks) behind one shell, each with the same
verify/flag/approve vocabulary. Build the shell once; add content types as tabs.

---

## 9. Build order

Ship in this order. Each phase is independently useful and safe to stop at.

**Phase 0 — Safety foundations.** Confirm new items default to hidden. Add the
`verified/verified_by/verified_at/flagged/flag_note` columns. Build the server-side publish
gate and both drift guards. *Do this before any UI work* — it is the part that actually
protects users.

**Phase 1 — Compute the stage in one endpoint.** `overview` returns a `stage` per item.
Every screen reads it.

**Phase 2 — The desk.** Dashboard with four stage sections → item view with inline editing,
verify and flag → flags inbox.

**Phase 3 — Motivation and scale.** Team tally, "show more" per section, per-content-type
tabs, a locking/complete flag, a create-new-item wizard that lands in Pending.

---

## 10. Lessons — things we'd tell ourselves at the start

1. **Compute the stage, never store it.** A stored stage drifts and lies.
2. **One definition, one endpoint.** Two screens computing the same thing independently will
   eventually disagree, and then no one trusts either.
3. **Enforce on the server.** A hidden button is a suggestion. We shipped a UI-only publish
   gate first and had to redo it properly.
4. **Stamp who and when on every verification.** Without `verified_by`, you can't ask
   follow-up questions, you can't build the team tally, and "verified" is anonymous — which
   means it's unowned.
5. **A flag needs a note.** "Something's wrong" is not actionable. "Answer says 12, should be
   21" is fixed in thirty seconds.
6. **Allowlist the editable fields.** Never let the client name the column.
7. **One field per save.** Small requests fail small; a whole-form save fails ambiguously.
8. **Make the count visible.** The team leaderboard did more for throughput than any UI
   polish we did.
9. **Put the migrations in the repo.** If a critical default only exists in a database
   console, nobody can verify the promise by reading the code.
10. **Write the one-sentence promise down first**, and check every feature against it. Ours
    is at the top of this document. Yours goes at the top of yours.

---

## 11. Adapting it to a different product

Replace three words and the pattern is yours:

- **container** → paper / article / dataset / release / listing / case file
- **part** → question / section / row / field / clause / photo
- **verify** → check / review / approve / sign off / QA

Everything else — four computed stages, per-part verified+flagged with attribution, the
server-side publish gate, the two drift guards, the flags inbox, the team tally — transfers
unchanged.

It applies especially well anywhere a machine drafts content and a human must sign it off:
the AI writes into Pending, the human moves it to Verified, an admin publishes. The desk is
the seam between "generated" and "trusted."
