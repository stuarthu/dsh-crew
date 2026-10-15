# CRD 0031 — the `preset-crew` row stops carrying its own guard

- **Date**: 2026-10-15
- **Proposed by**: the **user** (the defect report)
- **Written by**: PM
- **Status**: **accepted** (the fix is the user's; the shape is the PM's, see ADR 0031)
- **Job**: `crew-preset-row`, M1

## What was reported

On dsh 0.2.x the **Crew preset was missing from the preset picker**, with no error
anywhere. The row that is the only home of the preset on that generation was switching
itself off.

## Why this is a contract change

The `preset-crew` row of `cordis.patch.yml` is a contract: it says what carries the
declaration, and it says which generation mounts it. Both halves moved. Nothing the
user sees moved — the preset's `id`, `order`, name, description and `plugins:` list are
byte for byte the same — which is exactly what makes this a contract fix rather than a
scope change: the PM's call, reported at the milestone review, no user yes needed for
the shape.

## The defect, and why the guard could not work where it was

dsh's own composition reference says:

> `disabled` accepts a boolean, null, or a `!!js` expression evaluated against the **Loader**
> context at every mount decision. … Inside `config` they are evaluated after the row's
> declared injections activate, against that plugin's context (`ctx.<service>`).

So `ctx.get('agentPresets')` in a row-level `disabled:` is evaluated against the **loader**
context, which cannot see the registry service. The expression

```yaml
disabled: !!js ctx.get('agentPresets') === undefined || ctx.get('agentPresets').resolvedRoots !== undefined
```

came out **true on every dsh**, so the row was disabled on every dsh. The same document
supplies the evidence that this is "off", not "broken":

> A declaration whose activation fails **stays on the roster with its diagnostic**.

No failure, no message a user would act on — a preset missing from a picker. And it was
the right symptom to chase: dsh 0.2.x never reads `$DSH_HOME/.agent-presets`, so the row
is the only home of the Crew preset there, and 0.1.1-rc.2 does not even ship
`@deepseek-ai/dsh-agent-preset`, so the row had to be a no-op on 0.1.x. The hand-written
fallback declaration in the user's profile had already been deleted, so the guarded row
was the only copy — and it switched itself off.

**The one sentence the fix has to satisfy:** today "cannot read the service" equals
"switch the preset off"; after the fix, reading nothing equals doing nothing.

## What it changed

- `cordis.patch.yml`: the row's `name` went from `'@deepseek-ai/dsh-agent-preset'` to
  `'dsh-crew/host/crew-preset.js'`, and the `disabled:` line was **deleted**. `config`
  (`id: crew`, `name: Crew`, `description:`, `order: 5`, the whole `plugins:` list) is
  unchanged byte for byte. The file's header line and the block's own comment were
  rewritten to say where the guard lives and why a row-level `disabled:` cannot work.
- **New `host/crew-preset.js`**: carries the declaration, declares `inject = ["agentPresets"]`
  so `ctx.get()` resolves against the row's own injections, and skips the registration when
  there is no registry, when it has no `register`, or when the registry is the old
  folder-scanning one. A registration that throws is reported in one line, not swallowed:
  a leftover hand-written row already declaring `crew` makes the registry throw
  `Duplicate agent preset: crew`, and a dead profile is worse than a clear line.
  The plugin is a group carrier (`Symbol.for("cordis.group")`), exactly as
  `@deepseek-ai/dsh-agent-preset` is, so nested rows' `!!js` expressions belong to their
  own fibers and not to this row's context.
- `package.json`: `exports` gains `./host/crew-preset.js`, which the "every module the
  patch loads is exported" pin already required.
- `tools/verify-mount.mjs`: the pins are the **mirror image** of the old ones. The row must
  be carried by that plugin; the row must **not** carry its own `disabled:` — scoped to six
  spaces, because a nested plugin row's `disabled:` (`tool-bash`, `tool-pwsh`,
  `tool-plugin-manager`) is legitimate at twelve. And the guard is now pinned where it
  lives: a missing `ctx.get("agentPresets")`, a missing `resolvedRoots` skip or a missing
  `registry.register` call each turn the check red.
- `CLAUDE.md`: the two-planes table gains the new piece, and the paragraph that said
  "behind the `!!js` guard" now says the plugin picks the generation.
- `qa/gaps.md` item 63: the gap **shrank and did not close** — the wrong-context half is
  closed and pinned, the private-field half (`resolvedRoots` is not dsh's public contract)
  is still open and still unguardable.
- `CHANGELOG.md`: a `Fixed` entry under `0.12.0 — unreleased`.
- **Left alone**: `docs/decisions/crd/0029*`, the 0.11.0 CHANGELOG section and the PRDs that
  describe the old shape. A snapshot rots honestly; rewriting it would be a change log
  pretending to be a rule.

## Cost

- **Nothing changes on dsh 0.1.x**, and that is the load-bearing half: the plugin returns
  before touching anything when there is no registry service, and the folder install in
  `host/crew.js` is the whole story there.
- **The behaviour still cannot be proved here.** No check runs a real dsh (see `qa/gaps.md`
  item 63 and principle 5). What is pinned is the shape and the guard's presence, not the
  mount.
- **The private field is still a private field.** `resolvedRoots` is not part of dsh's
  public contract; a rename still picks the wrong branch silently.

## DoD (written by the PM)

| # | What "done" means | How somebody else checks it |
| --- | --- | --- |
| 1 | The row is carried by `'dsh-crew/host/crew-preset.js'` | `tools/verify-mount.mjs` — the preset-crew block prints one `ok` line |
| 2 | The row carries no `disabled:` line of its own, and a re-added one turns the check red | `tools/verify-mount.mjs` (the six-space scope; nested `disabled:` lines stay allowed) |
| 3 | `host/crew-preset.js` reads `agentPresets`, skips the old registry, and calls `registry.register` | `tools/verify-mount.mjs` — three pins, each red on its own |
| 4 | `config` is unchanged: `id: crew`, `order: 5`, `name: Crew`, the same `plugins:` list | `git diff cordis.patch.yml` shows only the `name` line, the deleted `disabled:` line and comments |
| 5 | `package.json` exports the new module | `tools/verify-mount.mjs` — the "every module the patch loads is exported" check |
| 6 | `npm test` is green, and no case under `qa/run-all.sh` is red | `npm test` |

## Applied

- T-137 (the task row), this commit.
