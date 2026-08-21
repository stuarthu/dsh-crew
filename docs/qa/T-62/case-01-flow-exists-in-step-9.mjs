// T-62, the hole itself (its Verdicts line names it: `tools/verify-mount.mjs` has
// NO pin on the ~157 lines this task wrote — delete the whole passage and
// `npm test` stays green, and the file that would hold such a pin belongs to
// T-51, which is closed).
//
// What it proves: the paired-shape execution flow is present in step 9 of
// `roles/pm.md` at all. This is the one case in the folder whose only job is
// "the passage exists", so that deleting it can never again be silent.
//
// PINNING STYLE: FLATTENED for the sentence (it wraps in the real file), and the
// slice is step 9 only — never the whole file, because T-56 already put a
// paired-shape passage in step 4 and a whole-file count would be true anyway.
//
// One-way: once the PM's prompt tells it how to run a paired task, that
// instruction may be reworded but may never disappear — a PM that cannot find it
// starts one `crew_engineer` on a `pair` row and the shape silently does not
// happen.

import { OPENING, check, done, flat, pairedFlow, stepNine } from "./paired.mjs";

const nine = flat(stepNine());

check(
  "step 9 of roles/pm.md carries the sentence that opens the paired flow",
  nine.includes(OPENING),
  `not found in step 9: ${JSON.stringify(OPENING)}`,
);

const flow = flat(pairedFlow());

check(
  "the flow says a `pair` row is NOT started with one crew_engineer",
  flow.includes("is not started with one `crew_engineer`"),
  "the sentence ruling out the solo tool on a paired row is missing",
);

check(
  "the flow names both halves and what each one writes",
  flow.includes("`crew_test_engineer`, which writes only the unit test files")
    && flow.includes("`crew_code_engineer`, which writes only the product code"),
  "one of the two halves is not named with what it writes",
);

check(
  "the flow says neither half can see the other's while it is written",
  flow.includes("neither of them can see the other's half while it is being written"),
  "the isolation sentence is missing",
);

check(
  "the passage is a real passage, not a stub",
  pairedFlow().length > 4000,
  `the paired flow is only ${pairedFlow().length} characters long`,
);

done();
