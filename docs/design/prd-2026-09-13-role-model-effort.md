# PRD: a role pinned to its own model can carry its own reasoning effort

- **Date**: 2026-09-13
- **Version**: 1
- **Job slug**: `role-model-effort`
- **Lane**: team
- **Written by**: an outside contributor, for a pull request. The maintainer's
  PM, QA round and reviews have not run on it; the task row's Verdicts line says
  so value by value.

## Goal (the problem, not the solution)

`roleModels` lets a user run a role on a different provider and model from the
PM. It has no way to say at what reasoning effort. dsh hands the parent's effort
to a child only while the child runs on the parent's own provider and model:
when the route changes and the child's options name no effort, dsh deletes the
inherited one. `host/roles-preset.js` passes on only `provider` and `model`, so
every role pinned to another model runs at that model's default effort. A user
who pins the engineer to a strong model expecting high effort gets that model at
its default, and nothing says so.

## What it must do

- **G1**: a `roleModels.<role>` entry may carry an optional `reasoningEffort`.
  When the entry also names a `model`, the value reaches that role's
  tool-subagent as `agentOptions.reasoningEffort`.
- **G2**: an entry with no `reasoningEffort`, or an empty one, mounts exactly as
  before: no `reasoningEffort` key in `agentOptions`.
- **G3**: `reasoningEffort` with no `model` mounts no `agentOptions`, the same
  as `provider` with no `model` today. That role runs on the PM's model, and dsh
  already gives it the PM's effort.
- **G4**: documented where `roleModels` is documented: the commented example in
  `preset/crew/agent.cordis.yml`, both READMEs, and a `CHANGELOG.md` entry.

## Boundaries

| Decision | Settled |
| --- | --- |
| Where the value goes | `agentOptions.reasoningEffort`, a field dsh's tool-subagent config schema already declares (`z.string().min(1)`) |
| Effort with no model | ignored, not refused: the rule `provider` with no `model` already follows, and a role on the PM's model already inherits the PM's effort |
| Checking the value itself | not done in dsh-crew: tool-subagent's schema and dsh's own route checks own it |
| Backward compatibility | no `reasoningEffort` anywhere means an identical mount, and a QA case checks it |

## Not in scope

Nothing. `principles.md` 22 keeps this list for items whose crossing has a real
cost, and none applies.

## Language and stack

Detected, not chosen: plain ES modules on Node 18 or later, no build step, no
new dependency. Test command: `npm test`.

## Release criteria

| Item | Check |
| --- | --- |
| Behaviour | G1 to G3: `qa/T-136/case-01-role-model-carries-reasoning-effort.mjs`, and the `roleModels:` lines of `node tools/verify-mount.mjs` |
| Real schema | with dsh's tool-subagent linked as `CLAUDE.md` describes, `node tools/verify-mount.mjs` prints the `roleModels: tool-subagent's schema accepts agentOptions with a reasoningEffort` line |
| Docs | G4, read |
| Acceptance | `npm test` green |

## Milestones and tasks

One milestone, one task: `docs/tasks/T-136.md`.
