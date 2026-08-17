# dsh-crew

Run work in [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/deepseek-harness)
as a small crew of role agents.

Your own dsh session becomes the **product manager (PM)**. The PM is the only one
who talks to you. It writes down what "done" means, asks you to confirm it, then
starts an **engineer** to write the code and a **code reviewer** to judge it. The
roles never talk to each other — they share work through files on disk, and the
PM passes messages.

> **Version 0.1.** PM, engineer and code reviewer only. No architect, QA, doc
> reviewer, researcher or security reviewer yet. No PRD, no push, no CI watching.

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

| Role | Tool | Persona | Cannot call |
| --- | --- | --- | --- |
| Engineer | `crew_engineer` | `roles/engineer.md` | any delegation tool |
| Code reviewer | `crew_code_reviewer` | `roles/code-reviewer.md` | any delegation tool, `write`, `edit`, `str_replace_editor` |

So a code reviewer **cannot** edit files, even if it decides it wants to. The
persona is locked in as that child's own system prompt.

## How a job runs

1. The PM sorts your ask into a lane: `ask` (answer only), `quick` (do it), or
   `team` (the full flow). If the size is unclear, it asks you.
2. It asks which language to use. It never guesses.
3. It grills you — one question at a time, each with a recommended answer, after
   looking up every fact it can in the repository.
4. It writes `docs/crew/dod.md`: goal, not in scope, acceptance checks, and a
   task list where each task owns exact files. **You confirm it before any work.**
5. It creates a `crew/<job>` branch and runs one `crew_engineer` per task. Two
   engineers run together only when their file lists do not overlap.
6. Each finished task goes to `crew_code_reviewer`: correctness first, then
   reuse, then simpler code. Round two only re-checks the blocking findings.
   After the round limit the PM brings the disagreement to you.
7. The PM commits — engineers never touch git. It stages only the files that task
   owns, never `git add -A`.
8. Nothing is ever pushed.

Documents live in the repository (`docs/crew/`). The job state lives outside it,
in `~/.dsh/crew/jobs/<job>/state.json`, so your `git status` stays clean and a
crash can be picked up later.

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

Then restart dsh. To check the plugin without dsh:

```sh
npm test        # replays the guard rules and the mount, no dsh needed
```

## Configuration

Everything is optional — see the comments in `cordis.patch.yml`:

| Setting | Default | What it does |
| --- | --- | --- |
| `rolesDir` | `~/.dsh/crew/roles` | Your own role markdown files replace the shipped ones, by file name |
| `limits.liveAgents` | `4` | Crew agents awake at the same time |
| `limits.agentsPerJob` | `20` | Crew agents one job may use |
| `limits.reviewRounds` | `3` | Review rounds before the PM asks you to decide |
| `roleModels` | session model | Per-role provider and model |
| `roleDeny` | see table above | Tools a role may not call (replaces the shipped list) |
| `approvalFile` | `~/.dsh/crew/push-ok` | One-shot push approval file |

Role files are plain markdown. Copy one out of `roles/`, edit it, and drop it in
`~/.dsh/crew/roles/` under the same name. One limit: prompt text may not contain
`{{` — dsh would try to read it as a variable, and the plugin fails at startup
with the file name so you know which one to fix.

## License

MIT
