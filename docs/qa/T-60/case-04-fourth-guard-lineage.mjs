// T-60, DoD item 3, second half — the substance of the fourth guard, and the
// second half of the hole this round was asked to close first.
//
// What it proves: the fourth guard is described accurately enough to be checked
// against dsh's own behaviour. `send_message` passes its CALLER as `parent` into
// `ctx.subagents.followup(parent, …)`; dsh checks the family line in
// `authorizeLineage`; two refusals come out of it and both throw `UNAUTHORIZED`.
// A sibling is not a child, so a sibling cannot be reached. This is what makes
// "the two halves of a paired task never talk" a platform fact rather than a
// promise in a prompt — and nothing in `npm test` reads a word of it.
//
// PINNING STYLE: FLATTENED, sliced to design rule 1. Both error strings are quoted
// from dsh, so they are pinned literally.

import { check, designRule, done, flat } from "./claude.mjs";

const rule = flat(designRule(1));

check(
  "the fourth guard is introduced by name",
  rule.includes("The fourth guard: the lineage check on `send_message`"),
  "the fourth guard has no heading sentence",
);

check(
  "it says a child really can hold send_message, and still cannot reach a sibling",
  rule.includes("a child can hold `send_message`")
    && rule.includes("it still cannot reach a sibling"),
  "the guard's premise is missing — without it the guard reads as 'the tool is absent', which is not true",
);

check(
  "it names the mechanism: the caller is passed as parent into ctx.subagents.followup",
  rule.includes("ctx.subagents.followup(parent"),
  "the call that carries the lineage is not named",
);

check(
  "it names the function that checks the family line: authorizeLineage",
  rule.includes("authorizeLineage"),
  "`authorizeLineage` is missing",
);

check(
  "it says both refusals throw UNAUTHORIZED",
  rule.includes("UNAUTHORIZED"),
  "the error class is missing",
);

check(
  "the first error string is quoted exactly",
  rule.includes("delivery requires the exact live parent agent"),
  "dsh's first refusal string is missing",
);

check(
  "the second error string is quoted exactly",
  rule.includes("belongs to another parent session"),
  "dsh's second refusal string is missing",
);

check(
  "it states the conclusion: a sibling is not a child, so dsh itself refuses",
  rule.includes("A sibling is not a child"),
  "the conclusion is missing",
);

done();
