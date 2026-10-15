# Contributing to dsh-crew

This guide says how a change moves through this repository: from a task row in
`docs/tasks/` with its DoD section, through an engineer's test-first
code or a document, to QA, the reviews, the Verdicts line and `npm test`.

The source of these facts is `CLAUDE.md`. Read `CLAUDE.md` first — it is the
authoritative map of how this repository works today. This file is a shorter
map for contributors; if the two ever disagree, `CLAUDE.md` wins, and correct
this file in place.

## What this repository is

`dsh-crew` is a **plugin for DeepSeek Harness (dsh)**, not an application.
Nothing here runs on its own. dsh loads the modules in `host/` and the agent
preset — `preset/crew/` on dsh 0.1.x, the `preset-crew` row of
`cordis.patch.yml` on dsh 0.2.x — and the result is a "crew": your dsh session
becomes a product manager (PM) that starts role agents as its direct children.

Be honest about what the main asset is: the **Markdown role prompts** in
`roles/` — ten files that define how each role behaves — plus the `host/` code
that mounts them into dsh and the preset that defines their tools. Most product
changes here are changes to a Markdown prompt, and `tools/verify-mount.mjs`
pins their shape.

There is no build step and no bundler. The package ships plain ES modules.

The plugin is split across two planes: the **host plane** (your profile, always
loaded) and the **agent plane** (the `crew` agent preset, where the
model-facing tools live). A role's tool names must exist in that preset, or the
role fails to start when it is used.

## The task row and the DoD

Every change, whatever its size, is a `team` job. There is no lane where a file
is changed alone. A milestone is one full cycle plus one commit: at least one
task, one round of QA, and one round of each review.

Each job opens with a PRD of its own: `docs/design/prd-<date>-<job-slug>.md`.
The one task table of the whole repository is `docs/tasks/`. Every
task section holds:

- an id (`T-01`);
- one sentence of work;
- the exact files the task owns, and the test file it must write;
- a **DoD** section (definition of done).

A DoD section says two things: what "done" means, and **how somebody else
checks it** — the QA case and the exact command. **DoD is a section, never a
file.** There is no `dod.md` anywhere: a file of its own is a file that gets
dropped. A check is "item 2 of T-05's DoD", never a numbered list.

A bug becomes a task row whose DoD section the PM writes before the fix starts —
never the engineer doing the fix. The files a task owns live in its row, and
two tasks never own the same file.

## How code changes move

1. The PM starts one engineer per task. The default shape is `solo`: one
   engineer writes the failing unit test, then the code that makes it pass.
2. The engineer works **test first**, one behaviour per test: write the test,
   run it, see it fail for the right reason, then write the smallest code that
   passes. The report shows the failing run and then the passing run.
3. Every test is a real file in the project's own test suite, named in the task
   row and committed with the code — never a command run once in a shell.
4. The engineer touches only the files its task owns. Engineers never use git
   for writing; the PM commits, staging exactly the files the task owns.
5. A task is finished when its own unit tests pass. QA and the reviews have not
   run yet, so neither calls a task done. The task row still records all four
   verdicts, with `not run` plus its reason where a check has not run.
6. A task in a job that has an architect may use the **paired shape**:
   `crew_test_engineer` writes only the unit tests, `crew_code_engineer` writes
   only the product code, each in its own git worktree. The PM merges the two
   halves and runs the project's test command once. Small work has no
   architect, so every row of a small job is `solo`.

A code change must not break the design rules that `tools/verify-mount.mjs`
checks (`CLAUDE.md`, "Design rules a change must not break"). The ones a
contributor is most likely to hit:

- the crew stays flat — only the PM starts agents;
- reviewers use an allow list, never a deny list;
- every name in an allow or deny list must exist in the crew preset;
- role markdown may not contain `{{` — dsh reads it as a variable, and the
  plugin fails at startup naming the file;
- role files are read at mount time, so a broken file breaks startup loudly.

Adding or changing a role is a checklist of its own in `CLAUDE.md` ("Adding or
changing a role"): the tool name goes into `ROLE_TOOL_NAMES` and `ROLES` in
`host/roles.js`, the persona file must be real instructions and must say the
role talks only to the PM, the persona copies the shared wording from
`principles.md` word for word, and the run ends with `npm test`.

## How documentation changes move

A documentation change is a change like any other: it gets a task row, a DoD
section, a milestone, the reviews, and a commit.

Where a document lives depends on how long it lives:

- **Durable** documents live in the repository under `docs/`, and each folder
  name says what the thing is: `design/` (the PRD, the design, one contract
  file per module boundary in `design/api/`), `tasks/` (the task table, one
  `T-<n>.md` file per row), `decisions/` (`adr/` for how it was done, `crd/`
  for change requests), `release/`. `qa/` is separate: a first-class
  directory at the repository root, sibling to `docs/`, holding QA's runnable
  cases.
- **Single-use** documents live in `<repo>/.dsh-crew/jobs/<job-slug>/` — job
  state, QA's plans, the `Q-` question
  files. That folder sits **inside** the repository, but the PM keeps it out of
  git's sight with one line in the repository's own `.git/info/exclude`, so it is
  never staged, never committed, never shows in `git status`, and the folder is
  dropped when the job ends. DoD sections and file
  ownership are never single-use; they live in `docs/tasks/`.

A decision about **how** something is done goes into an ADR under
`docs/decisions/adr/`, whatever the size of the job. A change to scope or to a
contract goes into a CRD under `docs/decisions/crd/`.

The reader-facing files follow their own rules:

- `README.md` (English) and `README-zh.md` (Chinese) say the same thing and
  must be updated together whenever user-visible behaviour changes.
- Add a `CHANGELOG.md` entry when a user would notice the change.
- Edit `CLAUDE.md` when the repository's own rules or layout move.

`CLAUDE.md` says how the repository works today. It is not a change log: write
the rule, the layout and the reason a rule exists — never the story of how
something got that way. When a fact in it stops being true, correct it in
place. `principles.md` holds the reasons behind the rules.

Never create a `dod.md`. "Done" is a section of a document that stays.

## How QA changes move

Everything QA puts in the repository goes under `qa/` — its cases
(`<task-id>/case-*`), a `run.sh` per task, and its entries in `gaps.md` — in
the project's own test framework, never in the product's test folder and never
in project config. `bash qa/run-all.sh` runs every task's cases, past and
present.

One round of QA runs per milestone, after the coding and before the reviews, in
two steps:

1. One `crew_qa` writes the case list from the DoD sections — it does **not**
   read the code, because the side being measured must not set the questions.
2. One agent per case writes that single case as a real test file under
   `qa/<task-id>/`, with a `run.sh` beside it.

QA's plan is single-use, in the job folder; the cases replace it. "What I could
not test here, and why" goes into `qa/gaps.md`, a standing list that later
jobs shorten. A case that starts failing is a blocking regression; nobody edits
it green.

## The test command

`npm test` is the default test command, and CI runs it on every push. It runs,
in order: the project's own checks (the `tools/verify-*.mjs` scripts), then
`bash qa/run-all.sh` (every crew job's QA cases), then
`node tools/verify-tasks.mjs` (the Verdicts gate). Run one check on its own by
calling its file directly.

Every check runs against temporary folders and a throwaway `DSH_HOME`. None of
them may read or write the real `~/.dsh` — keep it that way when adding cases.

A release tag runs `npm test` again before it publishes, so a release never
trusts an earlier push's green. Expect `npm test` to get slower as jobs add
cases; when that starts to hurt, split it into a fast check and a full one
rather than dropping the cases.

## The review rounds

QA and the three reviews run **once per milestone, at the end of it**, after
the coding has stopped — a blocking finding changes the code and throws an
earlier check away. QA runs first; then the three reviews, in parallel, one
round each, on the changed part only.

- **Code review** — correctness first, then the tests that drove the change,
  then reuse, simpler code, readability and this repository's own style.
- **Security review** — only when the change touches any of a closed list: the
  network, a login or permission check, secrets or keys, files outside the
  project, shell commands, input that comes from a user, customer data, or a
  new dependency.
- **Doc review** — one agent per document the milestone changed.

Reviewers use an allow list (`read`, `glob`, `grep`) and cannot write files.
The PM pastes the diff into the review task and runs any command the reviewer
asks for.

Only a change made because of a review's own finding brings that review back: a
code change re-runs the code review, a documentation change the doc review, a
security change the security review. The three never re-run together. After the
milestone, a last doc review pass reads only what landed after the milestone
round — the reader-facing files.

## The Verdicts line

Every task section in `docs/tasks/` starts with a **Verdicts** line,
written by the PM, with four values in this order: `code`, `security`, `qa`,
`doc`.

`node tools/verify-tasks.mjs` — the last thing `npm test` runs — reads
`docs/tasks/` and turns red when:

- a task section has no `- **Verdicts**：` line, or more than one;
- any of the four values is missing;
- a `not run` or `skipped` value carries no reason of its own after the dash;
- a `changes needed` value names no `T-<number>` to carry the fix.

Passing is not the same as clean: the check proves the line was written and
every skip carries a reason, and it **cannot** prove a review happened. It
exists because the PM of this repository's own job skipped code review on about
20 tasks and doc review on most of the job, nothing went red, and nobody knew
until the user asked (`docs/decisions/crd/0011-verdicts-gate-in-npm-test.md`).
So an open task keeps honest values: `not run` with its reason, never a silent
`pass`.
