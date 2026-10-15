# ADR 0031 — the generation check lives in the row's own plugin, not in a `disabled:` line

- **Decided by**: PM ｜ **Date**: 2026-10-15 ｜ **Job**: `crew-preset-row`, M1
- **Status**: accepted (carried out in the same commit as [`CRD 0031`](https://github.com/stuarthu/dsh-crew/blob/main/docs/decisions/crd/0031-preset-crew-row-stops-carrying-its-guard.md))

## What is being decided

[`CRD 0031`](https://github.com/stuarthu/dsh-crew/blob/main/docs/decisions/crd/0031-preset-crew-row-stops-carrying-its-guard.md)
records that the `preset-crew` row was switching itself off: a row-level `disabled: !!js`
is evaluated against the loader context, which cannot see the registry service, so the
expression was true on every dsh and the row was disabled on every dsh. The CRD says what
moved; it does not say **where the check goes**. Four shapes were considered.

## The options, with their cost

- **Option A — the row is carried by a plugin of this package (`host/crew-preset.js`),
  which does the check in its own context and calls `registry.register(config)`.**
  Cost: one more file in `host/`, one more entry in `package.json`'s `exports`, and the
  plugin has to be a group carrier so nested rows' `!!js` expressions keep belonging to
  their own fibers. Nothing else moves: `config` stays the declaration, byte for byte.
- **Option B — keep the third-party row and move the guard into its `config`.**
  Rejected: `config` **is** the declaration — `id`, `order`, `name`, `description`,
  `plugins:` — and there is no slot in it for "should this row mount". A boolean smuggled
  into the declaration would be a field the registry does not know, and the registry's
  own shape is not ours to widen.
- **Option C — `host/crew.js` detects the running dsh at startup and writes the declaration
  into the profile.** Rejected for this fix, kept as the road for the open half of
  `qa/gaps.md` item 63: it is the only shape that could stop the check reading a private
  field. Cost here: it moves the declaration out of the bundle patch and into generated
  profile content, which is a different home for something a user already overrides by
  row id — and it is a new feature, not a compatibility fix.
- **Option D — delete the guard and let the row fail on dsh 0.1.x.** Rejected: 0.1.1-rc.2
  does not ship `@deepseek-ai/dsh-agent-preset`, so an unguarded row asks that generation
  to mount a package it does not have. That is a profile that cannot compose, which is
  worse than a missing preset — the direction the old comment already argued for, and
  the direction this fix keeps.

## The decision (option A)

1. The row keeps its `id: preset-crew` and its whole `config`; only its `name` changes,
   to `'dsh-crew/host/crew-preset.js'`, and the `disabled:` line is deleted.
2. The plugin declares `inject = ["agentPresets"]`, which is what makes `ctx.get()`
   resolve: a row's declared injections activate before the row's `config` expressions
   are evaluated against that plugin's context.
3. The check is three early returns, in this order: no registry service → return;
   no `register` function → return; `registry.resolvedRoots !== undefined` (the old,
   folder-scanning registry) → return. **Reading nothing means doing nothing**, which is
   the sentence the fix had to satisfy.
4. A registration that throws is reported, not swallowed: a leftover hand-written row
   already declaring `crew` makes the registry throw `Duplicate agent preset: crew`, and
   one clear line beats a dead profile.
5. The plugin is a group carrier — `plugin[Symbol.for("cordis.group")] = true` — exactly
   as `@deepseek-ai/dsh-agent-preset` is, so the nested rows keep their own fibers.
6. `tools/verify-mount.mjs` pins the mirror image: the row must be carried by that plugin,
   and must **not** carry its own `disabled:`. The absence check is scoped to six spaces,
   because a nested plugin row's `disabled:` (`tool-bash`, `tool-pwsh`,
   `tool-plugin-manager`) is legitimate at twelve.

## Why

The context is the whole reason, and it is documented rather than inferred: `disabled` is
evaluated against the **loader** context, and only a `!!js` inside a row's `config` is
evaluated against that plugin's own context. A plugin row is the smallest thing that has
a context of its own, so it is the smallest thing the check can live in.

The direction of the failure is the second reason, and it did not change: on a dsh neither
branch recognises, the Crew preset is **missing** rather than the profile failing to
compose. A preset that cannot be mounted must not make a profile un-composable — and on
0.1.x the folder install is the whole story, so doing nothing there is not a fallback, it
is the correct behaviour.

Why the pins are a mirror image rather than an addition: a check that only ever demands
a guard would still be green after someone re-adds the row-level `disabled:` line, which
is the defect. Refusing that line outright is what keeps the fix from being undone by the
next person, and `qa/gaps.md` item 63 says so.

## What this did not buy

- **No check runs a real dsh**, so "the row mounts" is still unpinned (`qa/gaps.md` item 63,
  and principle 5's rule that nothing here installs dsh).
- **`resolvedRoots` is still a private field.** The check moved to a place where the
  service resolves; it did not stop reading a field that is not part of dsh's public
  contract. That half of the gap stays open, and option C above is the road for it.
