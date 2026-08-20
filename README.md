# dsh-crew

Run work in [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness)
as a small crew of role agents.

Your own dsh session becomes the **product manager (PM)**. The PM is the only one
who talks to you. It writes down what "done" means, asks you to confirm it, then
starts an **architect** to design the work, **engineers** to write the code, and
**reviewers** to judge both. The roles never talk to each other — they share work
through files on disk, and the PM passes messages.

> **Version 0.7.0.** PM, researcher, architect, engineer, QA, code reviewer,
> security reviewer, doc reviewer — plus a language and stack you approve before
> any work starts, a QA suite that stays on disk and runs again, a written change
> request for every scope or contract change, pushing with your permission, CI
> watching, and picking a job up after a crash.

## Two planes

dsh keeps model-facing tools in an **agent preset**, not in your profile. dsh-crew
follows that, and splits itself in two:

| Piece | Where | Why there |
| --- | --- | --- |
| PM rules | host plane (your profile) | They need no tools, so they work in every session, on any preset |
| Role tools | the `crew` agent preset | A role's allow/deny list is checked against the preset when a child starts, so the names must be defined in the same place |

Installing the plugin writes the preset into `$DSH_HOME/.agent-presets/crew`.
Start a session on the **crew** preset to get the roles. In a session on another
preset the PM still behaves like a PM, notices it has no role tools, and offers
to either move to the crew preset or do the job itself.

The crew preset is dsh's own `standard` preset with one change: `subagent`,
`subagent_fork`, `workflow`, `ralph` and the product subagents are gone, and the
crew roles are there instead. So inside it, **a crew role is the only way to
start an agent.**

## Why the crew is flat

dsh has three hard rules about agents, and the design follows them:

| dsh rule | What it means here |
| --- | --- |
| A message can only go to a **direct child** | Every role is a direct child of the PM, so the PM can reach all of them |
| A child answers only its **direct parent** (`report`) | Every answer comes back to the PM |
| Two children **cannot** talk to each other at all | Roles share work through files, not chat |

If the architect started the engineers, the PM could not reach the engineers at
all. So only the PM starts agents. Two independent guards enforce that: every
role is denied the delegation tools, and each role tool has `maxDepth: 1`, so a
crew child cannot start another crew child.

## What a role really is

A role is not a prompt the PM pastes in. It is a real delegation tool built from
`@deepseek-ai/dsh-tool-subagent`:

| Role | Tool | Persona | Tools |
| --- | --- | --- | --- |
| Researcher | `crew_researcher` | `roles/researcher.md` | **only** `read`, `glob`, `grep`, `write`, `web_search` — no shell |
| Architect | `crew_architect` | `roles/architect.md` | everything **except** the crew tools |
| Engineer | `crew_engineer` | `roles/engineer.md` | everything **except** the crew tools |
| QA | `crew_qa` | `roles/qa.md` | everything **except** the crew tools — it must run the software |
| Code reviewer | `crew_code_reviewer` | `roles/code-reviewer.md` | **only** `read`, `glob`, `grep` |
| Security reviewer | `crew_security_reviewer` | `roles/security-reviewer.md` | **only** `read`, `glob`, `grep` |
| Doc reviewer | `crew_doc_reviewer` | `roles/doc-reviewer.md` | **only** `read`, `glob`, `grep` |

So a code reviewer **cannot** change a file, even if it decides it wants to. The
persona is locked in as that child's own system prompt.

The reviewer uses an allow list, and two live tests are the reason:

1. With `write` and `edit` denied, it created a file anyway with
   `echo hello > file`. A shell is a file-writing tool.
2. With the shell denied too, its own tool report still listed `workflow`,
   `ralph` and a set of desktop-control MCP tools — every one of them a way out.

A deny list cannot name what a deployment has not installed yet. An allow list
does not have to. The PM pastes the diff into the review task and runs any
command the reviewer asks for.

Two more guards sit under the filters:

- **`maxDepth: 1`** on every role tool — only the root PM can start a role, and
  it names no tool at all, so no preset change can weaken it.
- The crew preset itself removes every other way to start an agent, so a role
  cannot route around the filter through `workflow`, `ralph` or a bare
  `subagent`.

### Editing the roles

Role personas are plain markdown in `roles/`. Copy one into
`~/.dsh/crew/roles/` under the same name and it replaces the shipped version.
One limit: prompt text may not contain `{{` — dsh would read it as a variable,
and the plugin fails at startup naming the file.

Role tool filters and per-role models are configured where the roles live: the
`dsh-crew-roles` row in `~/.dsh/.agent-presets/crew/agent.cordis.yml`.

That file sits inside the installed preset, and a new version of dsh-crew
replaces the whole folder. Your edited files are kept beside the new ones as
`agent.cordis.yml.bak`, and the boot log names them — but the settings do **not**
come back by themselves. After an upgrade, copy your changes into the new file.

## How a job runs

1. The PM sorts your ask into a lane: `ask` (answer only), `quick` (do it), or
   `team` (the full flow). If the size is unclear, it asks you.
2. It asks which language to use. It never guesses.
3. It grills you — one question per turn, each with a recommended answer. It
   waits for your answer before it asks the next one, and never sends you a list
   of questions. It looks up every fact it can in the repository first. For anything bigger than a
   quick look it starts a `crew_researcher`, which writes findings with a source
   for every answer, so you are only asked what the files cannot answer.
4. **It settles the language and stack, and you approve it.** If the repository
   already has one, that is the stack — the PM reads the manifest, the lock file,
   the test folder and the CI workflow, states what it found, and you confirm it in
   one line. When the choice is real (an empty repository, a new service), it
   starts a `crew_researcher` first: what this kind of project is normally built
   with today, with a source per claim, what the machine already has, and what each
   option costs. The researcher lists the options and is not allowed to recommend
   one. The PM then recommends one, names the runner-up and why not, and writes a
   **Language and stack** section into the document: language and version, package
   manager, framework, database, and the **test framework with the exact test
   command** — engineers write their tests with it and QA writes its cases with it,
   so it has to be one choice, not five. You confirm it together with the document,
   and after that it moves only through a CRD. An engineer may pick freely among
   the libraries the project already has; adding a brand-new dependency goes back
   to the PM.
5. It picks the document and writes it: a **DoD** (`docs/crew/dod.md`) for small
   work, a **PRD** (`docs/crew/prd.md`) for a real product. It says which it
   picked, and one word switches it. **You confirm before any work starts.**
   A PRD is cut into **milestones** — three to six stops, each one something you
   can look at and judge, written in your words rather than in code words. `M1`
   is the proof of concept: the thinnest real path through the riskiest part,
   running for real. You confirm the milestone list on its own, because it decides
   when you get a say.
6. For PRD work it starts `crew_architect`, which writes the high level design,
   the decision records and the task breakdown. It also splits the system into
   modules — reusing what the repository already has before it invents anything
   new — and when two or more modules talk to each other it writes one contract
   file per boundary in `docs/crew/api/`: how the two sides talk (in-process
   call, HTTP, gRPC, events, and so on), the data format, every call with its
   inputs, output and errors, and how the shape stops a caller getting it wrong.
   It picks the style, not the library. Those contracts are what let two
   engineers build the two sides at the same time, because crew roles cannot talk
   to each other, so each contract also names one **test per side** — the callee
   proves it answers what the file says, the caller tests against a stub built
   from the file. And when there is a boundary, the first task is a **walking
   skeleton**: one engineer builds the thinnest real path across the riskiest
   boundary, alone, before anything runs in parallel. A contract that does not fit
   is cheapest to fix there. It also puts every task under one of your
   milestones — it cannot add, rename or reorder them. Then `crew_doc_reviewer`
   must pass all of it before a single line of code is written.
7. It creates a `crew/<job>` branch and runs one `crew_engineer` per task, one
   milestone at a time. Two engineers run together only when their file lists do
   not overlap, and never across a milestone line. Every
   engineer works **test first**: it writes one unit test, runs it, checks that it
   fails for the right reason, then writes the smallest code that makes it pass.
   Its report has to show you the failing run and then the passing run. Every one
   of those tests is a real file in your project's test suite, named in the task
   row and committed with the code — never a command someone ran once in a shell.
   An engineer that believes a test cannot come first must ask the PM before it
   writes any code.
8. Each finished task is checked in order: **code review** (correctness, then the
   tests that drove the change, then reuse, simpler code, readability and this
   repository's own style — the reviewer may hold up a task on those, but only if
   it shows the exact replacement it wants; otherwise the finding is optional) → **security review**, only when the change touches
   the network, login, secrets, files outside the project, the shell, user input,
   customer data or a new dependency → **QA**, which writes its test plan from
   the document *before* reading the code, then turns every case into a real test
   file under `docs/crew/qa/<task-id>/`, in your project's own test framework,
   with a `run.sh` beside it. `docs/crew/qa/run-all.sh` runs every task's cases,
   and QA runs it on every task it checks — so a case written in an earlier task
   guards the new one. An old case that starts failing is a blocking regression,
   and nobody is allowed to edit it green. Your QA suite grows with the project
   and outlives the job. Round two of any review
   only re-checks the blocking findings; after the round limit the PM brings the
   disagreement to you.
9. The PM commits — engineers never touch git. It stages only the files that task
   owns, never `git add -A`.
10. **Milestone review — the PM stops and asks you.** When every task in the
   milestone has passed those checks and is committed, the PM reports what works
   now, the exact commands to try it yourself, what is deliberately not there
   yet, the test results, and where shipping stands. Then you say: ship this
   milestone, go on without shipping, change something, or stop — one question,
   four doors. A change that touches the PRD sends the plan back through the
   architect and the doc reviewer before code starts again. No milestone begins
   until you have answered the one before it. Small DoD work has no milestones —
   it is one piece of work with one report at the end.
11. **A milestone you ship gets a release plan and an upgrade plan, and their
   shape is looked up, not guessed.** These plans are not alike: an npm package
   cannot un-publish a version, a mobile app waits for a store review, a web
   service rolls back by redeploying, a database schema needs a migration that is
   safe to run twice. So the PM starts a `crew_researcher` for what those two plans
   contain **for your project type**, with a source and a date per claim, and reads
   what your repository already does first — the workflows, the changelog, the
   tags, any release script. Then it writes
   `docs/crew/release/<milestone>-release.md` (version and the rule behind it, the
   release notes, the exact steps and who approves each, what must be true before
   you start, how you check it worked, how to undo it — or the plain words that it
   cannot be undone) and `docs/crew/release/<milestone>-upgrade.md` (who is
   upgrading from what, every breaking change and what the user must do, migration
   steps and whether they are safe to run twice, skipping a version, going back and
   what data is lost, how long it takes, what goes offline). A milestone you are
   **not** shipping gets no plan — it gets one honest paragraph naming what is
   still missing before it could ship, and that list shortens as milestones pass.
   Approving a plan is not approving a push: every push and publish still needs its
   own yes, every time.
12. The PM updates the repository README to match what was built. `README.md` is
   always English. If you chose another language for the job, it keeps a second
   file beside it — `README-zh.md`, `README-ja.md` — saying the same thing. If
   nothing a reader would notice changed, it leaves the README alone and tells
   you so.
13. A last `crew_doc_reviewer` pass over every document the job produced, the
    README included. It checks that the documents can be worked from, that they
    stay consistent (one name per idea, one shape, and the language files saying
    the same thing), and that they read easily for someone about 14 years old
    whose first language is not English — by counting things like sentence
    length, idioms and unexplained terms, not by taste. It may hold up the job on
    wording, but only if it writes the replacement sentence itself.
14. **Push and CI, if you allow it.** The PM checks there is a remote, a
    workflow and a working `gh` first. Then it asks you — before **every** push,
    including a re-push after a fix. It pushes only what you said yes to — a
    `crew/*` branch, `main`, or a release tag — watches the run, and sends a red
    CI's real error text back to the engineer that owns those files.

## Nothing important lives in a chat message

The crew is flat: the PM talks to each role, and two roles can never talk to each
other. So a message reaches one role and dies there. That is why the crew talks
**through documents** — a role's report points at the file it wrote, and the PM's
answer points at the document it changed and that document's new version. Two
engineers building two sides of the same boundary read the same file, and a role
started tomorrow reads what a role started an hour ago read.

On top of that, every **change request** gets its own file. If anyone — you, a
role, or the PM itself — asks for something that changes what you get (the scope,
an acceptance check, the milestone list) or how two modules talk (a boundary
contract), the PM writes `docs/crew/crd/NNNN-<short-name>.md` first: who asked,
what they want, why, which documents and tasks it touches, what it costs, and the
decision with its reason. Nothing is built from an undecided one, and a rejected
one is kept as the record of a road not taken.

Who decides which:

- **A contract fix that changes nothing you see** is the PM's call. It writes the
  CRD, sends the architect to change the contract file, and tells you at the next
  milestone review.
- **Anything that changes scope, an acceptance check or the milestone list needs
  your yes.** The PM writes the CRD, then stops and asks. No version is raised and
  no task starts until you answer.

Small questions do not become CRDs — a role's question that the files can answer
is just a note in the job folder, and a review finding about code is a review
finding. Only scope and contracts, the two things that cost real work to redo.

Documents live in the repository, under `docs/crew/`: the release and upgrade
plans for each milestone you ship (in `release/`), the PRD or DoD, the design
and its decision records, one contract file per module boundary in `api/`, the
change requests in `crd/`, and QA's plans and runnable cases in `qa/`. The job
state lives outside it, in `~/.dsh/crew/jobs/<job>/state.json`, so your
`git status` stays clean.

## After a crash

The state file alone is not enough — the next session has to *know* about it. So
dsh-crew reads the job folder on every turn and, when something is unfinished,
puts a short note in front of the PM:

```
Unfinished crew work: 1 job left in /home/you/.dsh/crew/jobs.

- "add-sso-login" in /home/you/project (branch crew/add-sso-login):
  5 of 9 tasks done, 2 blocked. Last change 2026-08-18 09:12.
```

The PM must tell you before it does anything else, and ask one question: carry on
or start clean. It never does either without your answer. A job belonging to a
different folder is ignored, and a state file it cannot read is reported rather
than counted as finished. Turn the whole thing off with `resumeNotice: false`.

## The git guard

`host/git-guard.js` inspects every shell command. Your own session is the root
agent, and it is trusted: its git and publishing commands pass straight through.
Every crew role is a child agent, and the guard refuses, from a child:

- `git push` of `main`, `master`, `trunk`, `develop`, `HEAD`, or with no branch
  named;
- any tag push, remote delete, `--mirror`, `--all`, or force push;
- `npm`/`pnpm`/`yarn`/`bun publish`, `npm dist-tag`, `gh release create`;
- a push into a repository whose CI runs on push and looks like it publishes;
- any command that touches the approval file — not even the trusted root may
  write it, so an agent cannot approve itself.

A child's other branch push needs a one-shot approval that **you** create:

```sh
mkdir -p ~/.dsh/crew && touch ~/.dsh/crew/push-ok
```

The guard deletes that file as soon as one push uses it. One approval, one push.

Set `trustRootAgent: false` to guard your own session exactly like every child.

This reads command text, so it is a strong seat belt, not a locked door: a
command hidden inside a script file could still slip past. Your dsh approval
prompts stay the real gate.

## Install

```sh
dsh plugin --profile tui add dsh-crew     # or --profile web
```

Then restart dsh. Starting it writes the `crew` preset into
`$DSH_HOME/.agent-presets/crew` (a `crew` folder somebody else wrote is left
alone). Pick the **Crew** preset for a session to get the roles.

To check the plugin without dsh:

```sh
npm test        # replays the guard rules and the mount, no dsh needed
```

## Configuration

Everything is optional. Settings live in the plane they belong to.

**PM and guard** — the `dsh-crew-core` and `dsh-crew-git-guard` rows in your
profile's `cordis.patch.yml`:

| Setting | Default | What it does |
| --- | --- | --- |
| `rolesDir` | `~/.dsh/crew/roles` | Your own role markdown files replace the shipped ones, by file name |
| `limits.liveAgents` | `4` | Crew agents awake at the same time |
| `limits.agentsPerJob` | `20` | Crew agents one job may use |
| `limits.reviewRounds` | `3` | Review rounds before the PM asks you to decide |
| `installPreset` | `true` | Write the `crew` preset into `$DSH_HOME/.agent-presets` |
| `jobsDir` | `~/.dsh/crew/jobs` | Where job state lives, and what the crash notice reads |
| `resumeNotice` | `true` | Put unfinished jobs in front of the PM at session start |
| `enabled` (guard) | `true` | Turn the git guard off — not recommended |
| `trustRootAgent` (guard) | `true` | Trust your own session (the PM) with any git or publish command |
| `approvalFile` | `~/.dsh/crew/push-ok` | One-shot push approval file |

**Roles** — the `dsh-crew-roles` row in
`~/.dsh/.agent-presets/crew/agent.cordis.yml`:

| Setting | Default | What it does |
| --- | --- | --- |
| `rolesDir` | `~/.dsh/crew/roles` | Same override folder, for the role personas |
| `roleAllow` | reviewers: `read, glob, grep` | Only these tools for that role; everything else is closed |
| `roleDeny` | makers: the crew tools | Everything except these for that role |
| `roleModels` | session model | Per-role provider and model |

## License

MIT
