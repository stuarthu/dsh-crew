# ADR 0030 — the job folder sits inside the repository, and `info/exclude` keeps it out of git

- **Decided by**: PM ｜ **Date**: 2026-10-15 ｜ **Job**: `job-folder-in-repo`, M1
- **Status**: accepted (carried out in the same commit as [`CRD 0030`](https://github.com/stuarthu/dsh-crew/blob/main/docs/decisions/crd/0030-job-folder-moves-inside-the-repo.md))

## What is being decided

[`CRD 0030`](https://github.com/stuarthu/dsh-crew/blob/main/docs/decisions/crd/0030-job-folder-moves-inside-the-repo.md)
says the job folder moves inside the repository. It does not say **where** inside it,
or what makes a user's `git status` stay clean once the folder is there. This ADR
decides that, because the choice is the crew's own, not something the user was asked
about: the user chose the move and the shape (`a`), and everything below is how the
crew landed it.

## The options, with their cost

- **Option A — `.dsh-crew/jobs/<job-slug>/` at the repository root, ignored through
  `.git/info/exclude`.** `git status` stays clean, the whole folder is still dropped
  when the job ends, and every role prompt that says `<job folder>/...` keeps working
  unchanged. Cost: the PM must run one command in step 6, and a fresh clone of a
  repository does not carry the ignore line until a PM has run it.
- **Option B — commit it as a durable record.** No ignore line anywhere, and the move
  buys something real. Cost: `state.json` is rewritten after every step, so it lands in
  every diff, in front of every reviewer at step 10a/10b/10d and step 15, and in the
  history of every job. A reader a year later cannot tell a progress file from an agreed
  document. This contradicts `principles.md` 20: "The job folder is not a record. It is
  progress, and it is dropped when the job ends."
- **Option C — `docs/crew/jobs/`.** Cost: a `docs/` folder name says **what the thing
  is**, never who made it, and `state.json` is not a document. It would also put a
  droppable folder inside the durable tree, which is the mistake `principles.md` 19
  exists to prevent.
- **Option D — the project's `.gitignore` instead of `info/exclude`.** Cost: the line
  says where **this crew** puts progress, not what the project builds, so committing it
  adds a line to a file the user owns and edits. It is also per-directory, so a paired
  task's two worktrees would each need their own.

## The decision (option A, with `info/exclude` rather than `.gitignore`)

1. The default is **relative**: `DEFAULT_JOBS_DIR = ".dsh-crew/jobs"`, resolved against
   the folder the session runs in. One default serves every repository, and two
   repositories can never share a jobs folder. A user who wants it elsewhere names an
   absolute path (or a `~/` one) in `jobsDir`, exactly as before.
2. The PM writes the ignore line **once**, in step 6, before it writes anything into the
   folder:

   ```sh
   gitdir=$(git rev-parse --git-common-dir)
   mkdir -p "$gitdir/info"
   grep -qx '^\.dsh-crew/$' "$gitdir/info/exclude" 2>/dev/null || printf '%s\n' '.dsh-crew/' >> "$gitdir/info/exclude"
   ```

   It is idempotent, so re-running it costs nothing. `--git-common-dir` rather than a
   literal `.git` because a linked worktree's `.git` is a **file**, and the ignore file
   git actually reads is the one in the shared base folder — checked by hand: a rule
   written into the base's `info/exclude` keeps `git status` clean inside a linked
   worktree, and `git rev-parse --git-common-dir` run from inside that worktree prints
   the base's `.git`.
3. The folder is **never staged and never committed**, and step 11 says so next to the
   rule that already forbids `git add -A` and `git commit -a`. If a job-folder file ever
   appears in `git status`, the ignore line is missing, and step 6's command is re-run
   before anything is staged.
4. The path handed to every child stays **absolute**, in the main checkout. A fresh
   worktree does not carry the folder, and does not need one.
5. This repository carries `.dsh-crew/` in its own `.gitignore` as well, so a fresh clone
   of dsh-crew is safe before any PM has run step 6. That line belongs to this
   repository, not to the package.

## Why

The reason the folder was outside was never the path — it was that a user's `git status`
stayed clean. `info/exclude` carries that reason into the new location: it is not
committed, so it never touches a file the user owns, and it lives in the repository's
own `.git`, so it is shared by every worktree and a paired task's two trees see one rule.

Relative rather than absolute is the part that keeps the notice honest. `jobsNotice`
walks the jobs folder and tells the PM which unfinished job belongs to this session; a
`~` constant makes that folder shared by every repository, so the notice can name a job
from another project. A relative default makes the folder per-repository, and the notice
no longer has to say "ignore jobs that belong to another folder" — there are none.

The placeholder `<job folder>` in the role prompts is what makes most of this cheap.
Roughly 40 references name the placeholder and not the path, and `tools/verify-mount.mjs`
pins the placeholder rather than the path, so the QA-plan pin and the QA cases under
`qa/` stayed green through the move. Ten sites name the concrete path, and those are the
ten that changed.

## Result

`host/jobs.js` resolves the new default against the session's folder; `tools/verify-jobs.mjs`
grew a case that proves it; `roles/pm.md` step 6 and step 11 carry the ignore rule and the
"never staged, never committed" rule; `principles.md` 19 and 20 state the new home and
record option B as rejected. `npm test` is green — see the numbers in the commit message.
