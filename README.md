# dsh-crew

Run work in [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness)
as a small crew of role agents.

Your own dsh session becomes the **product manager (PM)**. The PM is the only one
who talks to you. It writes down what "done" means, asks you to confirm it, then
starts an **architect** to design the work, **engineers** to write the code, and
**reviewers** to judge both. The roles never talk to each other — they share work
through files on disk, and the PM passes messages.

> **Version 0.4.3.** PM, researcher, architect, engineer, QA, code reviewer,
> security reviewer, doc reviewer — plus pushing with your permission, CI
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
4. It picks the document and writes it: a **DoD** (`docs/crew/dod.md`) for small
   work, a **PRD** (`docs/crew/prd.md`) for a real product. It says which it
   picked, and one word switches it. **You confirm before any work starts.**
5. For PRD work it starts `crew_architect`, which writes the high level design,
   the decision records and the task breakdown — then `crew_doc_reviewer` must
   pass those before a single line of code is written.
6. It creates a `crew/<job>` branch and runs one `crew_engineer` per task. Two
   engineers run together only when their file lists do not overlap. Every
   engineer works **test first**: it writes one unit test, runs it, checks that it
   fails for the right reason, then writes the smallest code that makes it pass.
   Its report has to show you the failing run and then the passing run. An
   engineer that believes a test cannot come first must ask the PM before it
   writes any code.
7. Each finished task is checked in order: **code review** (correctness, then the
   tests that drove the change, then reuse, simpler code, readability and this
   repository's own style — the reviewer may hold up a task on those, but only if
   it shows the exact replacement it wants; otherwise the finding is optional) → **security review**, only when the change touches
   the network, login, secrets, files outside the project, the shell, user input,
   customer data or a new dependency → **QA**, which writes its test plan from
   the document *before* reading the code, then runs it. Round two of any review
   only re-checks the blocking findings; after the round limit the PM brings the
   disagreement to you.
8. The PM commits — engineers never touch git. It stages only the files that task
   owns, never `git add -A`.
9. The PM updates the repository README to match what was built. `README.md` is
   always English. If you chose another language for the job, it keeps a second
   file beside it — `README-zh.md`, `README-ja.md` — saying the same thing. If
   nothing a reader would notice changed, it leaves the README alone and tells
   you so.
10. A last `crew_doc_reviewer` pass over every document the job produced, the
    README included. It checks that the documents can be worked from, that they
    stay consistent (one name per idea, one shape, and the language files saying
    the same thing), and that they read easily for someone about 14 years old
    whose first language is not English — by counting things like sentence
    length, idioms and unexplained terms, not by taste. It may hold up the job on
    wording, but only if it writes the replacement sentence itself.
11. **Push and CI, if you allow it.** The PM checks there is a remote, a
    workflow and a working `gh` first. Then it asks you — before **every** push,
    including a re-push after a fix. It pushes only the `crew/*` branch, watches
    the run, and sends a red CI's real error text back to the engineer that owns
    those files. `main`, tags and force pushes stay blocked whatever anyone says.

Documents live in the repository (`docs/crew/`). The job state lives outside it,
in `~/.dsh/crew/jobs/<job>/state.json`, so your `git status` stays clean.

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

`host/git-guard.js` inspects every shell command, from every agent including the
PM, and refuses:

- `git push` of `main`, `master`, `trunk`, `develop`, `HEAD`, or with no branch
  named;
- any tag push, remote delete, `--mirror`, `--all`, or force push;
- `npm`/`pnpm`/`yarn`/`bun publish`, `npm dist-tag`, `gh release create`;
- a push into a repository whose CI runs on push and looks like it publishes;
- any command that touches the approval file, so an agent cannot approve itself.

Any other branch push needs a one-shot approval that **you** create:

```sh
mkdir -p ~/.dsh/crew && touch ~/.dsh/crew/push-ok
```

The guard deletes that file as soon as one push uses it. One approval, one push.

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
