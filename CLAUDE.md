# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

`dsh-crew` is a **plugin for DeepSeek Harness (dsh)**, not an application. Nothing here runs on its
own. dsh loads the modules in `host/` and the agent preset in `preset/crew/`, and the result is a
"crew": your dsh session becomes a product manager (PM) that starts role agents (architect, engineer,
reviewers, QA, researcher) as its direct children.

There is no build step and no bundler. The package ships plain ES modules (`"type": "module"`).

## Commands

```sh
npm test                            # all four checks; this is what CI runs
node tools/verify-guard.mjs         # git-guard rules, replayed against fake commands
node tools/verify-jobs.mjs          # the unfinished-job notice, using throwaway job folders
node tools/verify-mount.mjs         # package shape, preset shape, role table, real mount
node tools/verify-preset-install.mjs # installing and upgrading the crew preset
```

Every check runs against temporary folders and a throwaway `DSH_HOME`. None of
them may read or write the real `~/.dsh` — keep it that way when adding cases.

Run one check on its own by calling its file directly — that is the "single test" here.

`verify-mount.mjs` has two levels. `@deepseek-ai/dsh-tool-subagent` cannot be installed from the
public npm registry (its peer `@deepseek-ai/dsh-tasks` is not published), so on a plain machine the
check **skips** the role-tool half out loud. To get the full check locally, link dsh's own copy once:

```sh
mkdir -p node_modules/@deepseek-ai
ln -s ~/.dsh/profiles/node_modules/@deepseek-ai/dsh-tool-subagent \
      node_modules/@deepseek-ai/dsh-tool-subagent
```

That link already exists in this working copy. Never add a real dependency on that package — it is a
`peerDependencies` entry on purpose.

Releases: add the new version's section to `CHANGELOG.md` (newest first, plain English, what a
user would notice), bump `version` in `package.json`, commit, push `main`, then push the matching
`v*` tag.
Only the tag triggers `.github/workflows/publish.yml`. The workflow fails loudly if the tag and
`package.json` disagree. Auth is npm trusted publishing (OIDC) — there is no secret to set.

## The two planes (the main thing to understand)

dsh separates the **host plane** (your profile: always loaded, no model-facing tools) from the
**agent plane** (an agent preset: the tools a model can call). dsh-crew is split across both, and the
split is load-bearing:

| Piece | Lives in | Loaded by | Why it must be there |
| --- | --- | --- | --- |
| PM prompt + preset installer + job notice | `host/crew.js` | `cordis.patch.yml` (profile) | Needs no tools, so the PM behaves like a PM on any preset |
| Git guard | `host/git-guard.js` | `cordis.patch.yml` (profile) | Must wrap `tools/execute` for **every** agent, including the PM |
| Role tools (`crew_engineer`, …) | `host/roles-preset.js` | `preset/crew/agent.cordis.yml` | A role's allow/deny names are checked against the **preset's** tool set when a child starts. Named anywhere else, a spawn can fail on a name that deployment does not have |
| Role table + persona loading | `host/roles.js` | both of the above | Single source of truth, shared by the two planes |

`host/crew.js` also copies `preset/crew/` into `$DSH_HOME/.agent-presets/crew` at startup, stamped
with the package version (`.installed-by-dsh-crew`). A `crew` folder without that stamp is somebody
else's and is never touched.

A **version bump deletes and rewrites that folder**, and users are told by the README to configure
`roleAllow` / `roleDeny` / `roleModels` inside it. So the installer reads every file that differs
from the shipped copy before deleting, writes it back as `<name>.bak`, and names it in the boot log.
Never make that folder the only home for a setting a user has to keep.

## Design rules a change must not break

These are not style preferences. Each one is checked by `tools/verify-mount.mjs`, and most exist
because a live test showed the weaker version failing.

1. **The crew is flat.** Only the PM starts agents. dsh delivers a message to *direct children*
   only, a child answers only its *direct parent*, and two children cannot talk at all — so a role
   that started its own role would put that grandchild out of the PM's reach forever. Three
   independent guards keep this: every deny-list role denies all `crew_*` tools; every role tool sets
   `maxDepth: 1` (which names no tool, so no config change can weaken it); and the crew preset
   removes `subagent`, `subagent_fork`, `workflow`, `ralph` and the product subagents.
2. **Reviewers use an allow list, never a deny list.** With `write` and `edit` denied, a reviewer
   still created a file with `echo hello > file` — a shell is a file-writing tool. With the shell
   denied too, its tool list still held `workflow`, `ralph` and desktop-control MCP tools. A deny
   list cannot name what a deployment has not installed yet; an allow list does not have to.
   So: no allow-list role may name `bash`, `pwsh`, or any way to start an agent, and no role whose
   key contains `review` may name `write` or `edit`.
3. **Every name in an allow or deny list must exist in the crew preset.** dsh rejects an unknown
   name when the child starts, so a stale name is a total outage for that role, not a warning.
   `verify-mount.mjs` keeps a `PROVIDERS` map from tool name to the dsh package that registers it —
   extend that map when you allow a new tool.
4. **The engineer and QA keep `bash`.** They have to run the code and the tests.
5. **Role markdown may not contain `{{`.** dsh interpolates `{{name}}` in prompt text and an unknown
   variable fails the whole prompt assembly. `readRoleText` throws at startup with the file name
   instead.
6. **Role files are read at mount time**, not when a role is first used, so a broken or empty file
   breaks startup loudly rather than halfway through someone's job.

## Adding or changing a role

1. Add the tool name to `ROLE_TOOL_NAMES` in `host/roles.js` (every deny list is built from it).
2. Add the entry to `ROLES` with exactly **one** of `allow` or `deny` — never both, never neither.
3. Write `roles/<name>.md`. It must be real instructions (the check rejects anything under 500
   characters) and must say the role talks only to the PM.
4. If the role's allow list names a tool not yet in `PROVIDERS` in `tools/verify-mount.mjs`, add it,
   and make sure `preset/crew/agent.cordis.yml` really loads that provider package.
5. Mention the role in `roles/pm.md` — the PM only uses what its own rules describe.
6. Run `npm test`.

`host/crew.js` builds the PM's "your crew tools and limits" section **from the `ROLES` table**, so
the PM can never promise a role that does not exist. Keep it that way: derive, do not retype.

## Users override, the package does not change

A user's own `~/.dsh/crew/roles/<file>.md` replaces a shipped persona by file name (`rolesDir`).
Tool filters and per-role models are overridden in the `dsh-crew-roles` row of
`~/.dsh/.agent-presets/crew/agent.cordis.yml` (`roleAllow`, `roleDeny`, `roleModels`). The PM's
limits, jobs folder and the git guard are configured in the profile's `cordis.patch.yml`. When you
add a setting, add it as a commented example in the config file it belongs to — that is how these
options are documented.

## The git guard

`host/git-guard.js` is middleware on `tools/execute`. It reads the command text of `bash` and `pwsh`
calls. The **root agent** — your own session, the PM — is trusted and passes straight through (any
push, tag, force, delete, publish, release). Every **child** (a crew role, which carries a parent
execution token) is refused: pushes of protected branches, bare pushes with no branch, tag pushes,
force pushes, remote deletes, package publishing, releases, any push into a repo whose CI publishes
on a branch push, and any command that touches the approval file. A child's other push needs the
one-shot approval file that the **user** creates; the guard deletes it before the push runs, so a
crash cannot leave a second push approved. `trustRootAgent: false` guards the PM exactly like a
child.

It reads command text, so it is a seat belt, not a locked door — a push hidden in a script file gets
through. Say so plainly in docs; do not describe it as airtight.

Note that this repository's own `.github/workflows/publish.yml` is tag-triggered, which is why
`branchPushTriggers()` exists: a tag-only publisher must not block ordinary branch pushes.

## State and documents

Job state lives **outside** the repository, in `~/.dsh/crew/jobs/<job>/state.json`, so a user's
`git status` stays clean. Crew documents live **inside** it, in `docs/crew/`: DoD, PRD, design,
ADRs, one module boundary contract per pair of modules that talk
(`docs/crew/api/<caller>-<callee>.md`), one change request per scope-or-contract change
(`docs/crew/crd/NNNN-<short-name>.md`), and QA's plan plus its **runnable** cases
(`docs/crew/qa/<task-id>-plan.md`, `docs/crew/qa/<task-id>/case-*`, a `run.sh` per task and one
`docs/crew/qa/run-all.sh` that finds them all).

Two rules there are load-bearing, and `docs/principles.md` 13 and 14 carry the reasons:

- **QA writes only under `docs/crew/qa/`**, in the project's own test framework, never into the
  product's test folder and never into project config. If a runner cannot see that folder, QA asks
  the PM and the PM edits the config — that keeps "one task owns its files" true.
- **A CRD is written by the PM for scope or contract changes only**, whoever asked. Scope needs the
  user's yes; a contract fix the user cannot see is the PM's call, reported at the milestone review.
  Questions, review findings and internal design changes are deliberately *not* CRDs — widening
  that scope turns the PM into a clerk.

`host/jobs.js` turns unfinished jobs into a dynamic prompt context that is re-read every turn — it
must return `""` when there is nothing to say, and must never throw, because a prompt that fails to
assemble breaks the session.

## Documentation

`docs/principles.md` holds the **reasons** behind the crew's rules: one entry per
principle, each with the rule, why it exists, the files that carry it, and the
outside source it came from — plus a table of ideas that were looked at and
rejected. Role prompts are written short and bossy on purpose, so the reasoning
has to live somewhere else. When you change a rule in `roles/*.md`, update the
principle that carries it; when you reject an idea, add it to the table so the
next person does not re-run the same search. The file is for contributors and is
not published to npm (`docs/` is not in the `files` list).

`README.md` (English) and `README-zh.md` (Chinese) say the same thing and must be updated together
whenever user-visible behaviour changes; write the English first, then match the Chinese. Keep the
plain, short-sentence style already in both files, and keep the version line near the top of the
README in step with `package.json`.
