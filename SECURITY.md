# Security

dsh-crew is a plugin for DeepSeek Harness (dsh). It turns a dsh session into a
"crew": the session becomes a product manager (PM) that starts role agents
(engineers, reviewers, QA, and the rest) as its direct children.

This file describes the guard the plugin adds, what it blocks, and — just as
honestly — what it does not block. It is not airtight, and this file says so
plainly. If you find a hole, see
[Reporting a security issue](#reporting-a-security-issue).

## What the guard is

The guard is middleware on dsh's `tools/execute`, mounted by the plugin's host
bundle (`cordis.patch.yml`). It exists because a rule written in prose is
advice, while a `tools/execute` wrapper is the place a call is actually stopped.
It reads the text of a tool call and matches it against patterns. Its own source
describes it as "a strong seat belt, not a locked door", and it leaves the real
gate where it always is: dsh's own approval prompts, which you see in the GUI
and answer yourself.

The guard is configurable from the profile's `cordis.patch.yml` and can be
disabled entirely (`enabled: false`). It protects by default; it is not a
property of the machine.

## The git guard (`host/git-guard.js`)

The git guard blocks the shell commands that can push work off the machine or
publish a package.

### Who is guarded

- Every crew role — any child agent whose session names a parent session
  (`session.header.parentSession`) — is fully
  guarded.
- The root agent — your own session, the PM — is trusted by default
  (`trustRootAgent: true`) and passes straight through. Setting
  `trustRootAgent: false` guards the PM exactly like a child.
- What the guard allows for the PM is not what the PM does: the PM's own rules
  (`roles/pm.md`) require your yes for every push and never force push `main`
  at all. The playbook is a tighter limit than the guard.

### What it always refuses

From a crew role:

- `git push` of `main`, `master`, `trunk`, `develop` or `HEAD`, or a push with
  no branch named (a bare `git push` can push whatever branch is checked out)
- any tag push, delete push, `--mirror`, `--all`, or force push
- `npm publish`, `pnpm publish`, `yarn publish`, `bun publish`, `npm dist-tag`,
  or `gh release create`
- a push into a repository whose GitHub Actions CI runs on a branch push and
  looks like it publishes (`.github/workflows` only — see the limits below)

From every agent, your own session included:

- any shell command that names the one-shot approval file

### What it allows, once per approval

A child may push any *other* branch, but only while the one-shot approval file
(`~/.dsh/crew/push-ok`) exists. Only you create that file, in your own
terminal; the guard deletes it as soon as one push uses it, so one approval
means one push. A refused agent is deliberately never told how to create the
file — an agent that can write files could follow the recipe on its own, and
the guard would never see that call.

### Honest limits

Each of these is a real hole, not a caveat:

- **It reads command text.** A push hidden inside a script file, or made after
  changing the remote first, is not seen. It is a strong seat belt, not a
  locked door. Your dsh approval prompts remain the real gate.
- **It wraps `bash` and `pwsh` and nothing else.** A role that has `write` or
  `edit` — the engineer does — can create the approval file as a plain file
  write, and this middleware never sees that call. The gate there is dsh's own
  approval prompt for writing a file.
- **The publishing scan reads `.github/workflows` and nothing else**, and it
  understands GitHub's `on: push:` shape. GitLab, CircleCI, Jenkins and Azure
  Pipelines are outside it on purpose: stretching GitHub trigger logic half-way
  onto another CI system would produce false alarms, and a false alarm is worse
  than no alarm, because it teaches you to say yes without reading. So the
  guard is a GitHub-only backstop for child agents. The wider check is the
  PM's own judgement, in step 17 of `roles/pm.md`, which reads those other CI
  files too.
- **On the approval-file rule, two sharp edges.** A command that only *mentions*
  the file name is refused, the PM included — a commit message or a `git log
  --grep` that contains the name is blocked as a false positive. And a name the
  shell assembles from pieces still gets through:
  `echo push-ok-flow | sed s/-flow// | xargs touch` is not stopped.

## The bottom line: not airtight

- The guard reads command text and intercepts a narrow lane (`bash` and
  `pwsh`). A determined agent with the shell can do things it does not see:
  hide a push in a script file, or change the remote first. It was never
  designed to fence a hostile agent.
- It does not replace your own attention. dsh's approval prompts are the real
  gate, and the crew's own rules (`roles/pm.md`) require your yes for every
  push, tag, publish, merge and branch delete. The guard is one layer of that
  system, not the whole of it.
- It constrains only agents inside a dsh session that has dsh-crew mounted. It
  says nothing about anything outside that session — other software on the
  machine, or a human running git themselves.

## Reporting a security issue

If you find a hole in the guard, or a way a role can exceed what its rules
allow, report it:

- **Where**: open an issue at <https://github.com/stuarthu/dsh-crew/issues>
  (the repository is public). If you prefer not to post publicly and the
  repository's private vulnerability reporting is enabled (Security tab →
  Report a vulnerability), use that instead.
- **What to include**: the dsh-crew version (from `package.json`), the exact
  command or call, what you expected and what happened, and whether it affects
  one session or any deployment.
- **What happens next**: the report is read by the repository maintainer, and
  a confirmed problem is fixed like any other change in this repository —
  through the repository's normal change flow, with its review rounds.
