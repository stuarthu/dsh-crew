# CRD 0030 — the job folder moves inside the repository

- **Date**: 2026-10-15
- **Proposed by**: the **user**
- **Written by**: PM
- **Status**: **accepted** (the user's decision, carried out by the PM)
- **Job**: `job-folder-in-repo`, M1

## What the user asked for

> currently, the state.json is in jobs folder outside of repo. I need to move it inside repo, check other files too

The folder holding `state.json` moves **inside** the repository. "check other files
too" was the PM's to answer, and it was answered before anything moved: the job
folder holds **four** single-use things, three of them move with the folder, and the
fourth — **the output of a test run** — does not, because it is not a file at all.
`principles.md` 19 says it "was never on disk and now may not be"; making it a file
inside the repository would put a check in a droppable folder, and a check in a
droppable folder takes every check inside it along when the folder goes. That is
what [`CRD 0010`](https://github.com/stuarthu/dsh-crew/blob/main/docs/decisions/crd/0010-dod-is-a-section.md)
measured: 75 acceptance checks lost in one hour.

## Why this is a change of scope

`principles.md` 19 splits documents **by lifetime**, and `state.json` sat on the
single-use side for a reason written out in full: "it lives outside the repository
so the user's `git status` stays clean". Moving it inside crosses that confirmed
line, so it gets a CRD and needs the user's yes. Nothing in the crew may do it on
its own.

## What the user chose (verbatim)

> a

That is **option A**: `<repo>/.dsh-crew/jobs/<job-slug>/`, kept out of git's sight
by the repository's own `.git/info/exclude`.

- **Option B — commit it as a durable record** — rejected, and the reason is recorded
  in `principles.md` 19's rejected-ideas table. `state.json` is rewritten after every
  step; committing it puts a file that changes on every step in front of every
  reviewer and every reader, and `principles.md` 20 says the job folder is **not** a
  record. What the user asked for was the **location**, not the history.
- **Option C — `docs/crew/jobs/`** — rejected by the PM in this CRD: a `docs/` folder
  name says **what the thing is**, and `state.json` is not a document.

## What it changed

**What did not change: the folder is still single-use, and it is still dropped whole
when the job ends.** Moving it bought the per-job path and the restart notice, not a
record.

- `host/jobs.js`: `DEFAULT_JOBS_DIR` went from `~/.dsh/crew/jobs` to `.dsh-crew/jobs`
  — **relative**, resolved against the folder the session runs in via
  `resolve(expandHome(...))`. One default now serves every repository, and two
  repositories can never share a jobs folder. The notice names the resolved absolute
  path, and its last line was reworded: "Ignore jobs that belong to another folder"
  is no longer true, because every job in the list belongs to the repository this
  session works in.
- `tools/verify-jobs.mjs`: a new case 9 proves the relative default resolves inside
  the session's own folder, and that the notice prints the absolute path.
- `cordis.patch.yml`: the commented `jobsDir` example and the comment above it now say
  the default is relative, that the folder is ignored, and that it is never committed.
- `roles/pm.md`: step 6 **Job folder** names the new path, adds the one `info/exclude`
  command the PM runs **once** before writing anything, and gives the reason it is
  `info/exclude` and not the project's `.gitignore` — the line says where **this crew**
  puts progress, not what the project builds, so it must not be added to a file the
  user owns; and it is shared by every worktree, so a paired task's two trees see the
  same rule. The same step says the job folder is **never staged and never committed**.
  Step 11 **Commit** gains the matching bullet: never stage the job folder, never
  un-ignore it, and if a job-folder file ever shows in `git status`, step 6's command
  is missing — re-run it before staging anything. The "What you may write" bullet, the
  `Q-` file paragraph ("outside the repository" → "not part of the repository's
  history") and the `## The state file` heading were reworded.
- `roles/qa.md`: the plan's home went from "outside the repository" to "not part of the
  repository's history", and "**not** in the repository" to "**never committed**". The
  `<job folder>` placeholder is unchanged, so `tools/verify-mount.mjs`'s plan pin stays
  green.
- `roles/architect.md`, `roles/doc-reviewer.md`: the same "outside the repository" →
  "not part of the repository's history" in the two places that warn an ADR must quote
  a `Q-` file rather than point at it.
- `principles.md`: 19's single-use bullet and its "Why the record outlives the
  negotiation" paragraph were rewritten; 20's table row for step 6 **Job folder** names
  the new home; the slug paragraph names the new path; the rejected-ideas table gains
  the "commit `state.json`" row.
- `CLAUDE.md`, `CONTRIBUTING.md`: the single-use table and paragraph.
- `.gitignore`: gains `.dsh-crew/` — **for this repository only**, so a fresh clone of
  dsh-crew is safe before any PM has run step 6. A user's own repository gets that line
  from step 6, not from a file this package ships.
- `CHANGELOG.md`: a new `0.12.0 — unreleased` section.
- **Left alone on purpose**: `qa/gaps.md`'s quotation of the old rule wording, and the
  old PRDs, CRDs and CHANGELOG rows that name the old path. A snapshot rots honestly;
  rewriting it would be a change log pretending to be a rule.

## Cost

Nothing already done had to be redone: this is a move, not a rebuild. The three hazards
the survey named were each closed in this change:

1. `git status` stays clean through `info/exclude`, not through the folder's location.
2. The paired shape's two worktrees: the job folder is one **absolute** path in the
   **main** checkout, and `roles/pm.md` already hands that path to every child in step
   9's brief. A fresh worktree does not carry the folder, and does not need one.
3. The restart notice: the default is no longer a `~` constant, it is relative.

## DoD (written by the PM)

| # | What "done" means | How somebody else checks it |
| --- | --- | --- |
| 1 | No live file names the old path: `grep -rn "\.dsh/crew/jobs" host/ cordis.patch.yml roles/ CLAUDE.md CONTRIBUTING.md principles.md` finds nothing | grep |
| 2 | `host/jobs.js` holds `DEFAULT_JOBS_DIR = ".dsh-crew/jobs"`, and `jobsNotice` resolves it against the session's own folder | `node tools/verify-jobs.mjs` — case 9 green |
| 3 | `roles/pm.md` step 6 names the `info/exclude` command, and step 11 says the job folder is never staged | read the file |
| 4 | No role prompt says the job folder is "outside the repository" | `grep -rn "outside the repository" roles/` finds nothing (qa.md's `mktemp -d` line is about a throwaway folder, not the job folder) |
| 5 | `tools/verify-mount.mjs`'s QA-plan pin still passes, because the `<job folder>` placeholder did not change | `npm test` |
| 6 | `npm test` is green, and no case under `qa/run-all.sh` is red | `npm test` |

## Applied

- T-136 (the task row), this commit.
