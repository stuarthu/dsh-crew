# dsh-crew

> **Version 0.9.0.**

dsh-crew is a plugin for DeepSeek Harness (dsh). It turns your dsh session into a
product manager (PM) that runs a crew of role agents: architect, engineer, test
engineer, code engineer, QA, code reviewer, security reviewer, doc reviewer, and
researcher.

## What it is

You talk to the PM. The PM starts role agents for the work, and every decision is
written down in documents that stay in the repository.

Two lanes:

- `ask` — you want an answer. The PM answers. Nothing changes.
- `team` — you want a change. The PM runs the crew: one task per change, one round
  of QA, one round of each review, then a commit. Pushing and publishing still need
  your own yes, every time.

## Install

```sh
dsh plugin --profile tui add dsh-crew     # or --profile web
```

Restart dsh. Pick the **Crew** preset for a session.

## Quick start

1. Install the plugin (above).
2. Restart dsh.
3. Start a session on the **Crew** preset. Your session becomes the PM.
4. Ask a question, or ask for a change.

## Configuration

Everything is optional. Settings live in two places:

- The `dsh-crew-core` and `dsh-crew-git-guard` rows in your profile's
  `cordis.patch.yml`: roles folder, live-agent limit, review rounds, job folder,
  and the git guard.
- The `dsh-crew-roles` row in `~/.dsh/.agent-presets/crew/agent.cordis.yml`:
  per-role tools, models and reasoning effort.

## License

MIT
