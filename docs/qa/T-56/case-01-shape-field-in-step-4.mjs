// T-56, DoD item 1: step 4 of the PM prompt grows a `**Shape**` field for every
// task row, with two values — `solo` and `pair` — and a `pair` row also names its
// interface ADR.
//
// SCOPE. The slice is step 4 only. The DoD warns that lowercase `shape` appears
// about eleven times in this file as ordinary prose, which is why the pin is on the
// BOLDED FIELD NAME and not on the word. A check for the word `shape` in this file
// could never fail.
//
// What it proves: the field the whole paired shape hangs on exists in the place the
// PM actually reads when it writes a task table. Without it, no row can ever say
// `pair`, and the two new roles are unreachable.
//
// PINNING STYLE: slice LINE-BASED (`step()`), field name and sentences FLATTENED.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const four = step(pm(), 4);
const flatFour = flat(four);

check(
  "step 4 carries the bolded field name `**Shape**`",
  flatFour.includes("**Shape**"),
  "the field name is not in step 4 — a check for lowercase `shape` would pass on prose and prove nothing",
);

check(
  "it says where the field goes: one bullet in that task's own section of tasks.md",
  flatFour.includes("One bullet in that task's own section of `docs/design/tasks.md`"),
  "the field's home is not named",
);

check(
  "the value `solo` is defined",
  flatFour.includes("`- **Shape**: solo`"),
  "the solo value is not shown",
);

check(
  "the value `pair` is defined, and names the interface ADR on the same line",
  flatFour.includes("`- **Shape**: pair — interface ADR:"),
  "the pair value does not carry the ADR path",
);

check(
  "it says the two values stay solo and pair whatever the job's language",
  flatFour.includes("the two values stay `solo` and `pair` whatever the language"),
  "without this, a Chinese task table would invent its own values and nothing would match",
);

check(
  "a pair row splits the files it owns into two lists that may not overlap",
  flatFour.includes("into two lists") && flatFour.includes("may not overlap"),
  "the two-list rule is missing from step 4",
);

check(
  "it says why a pair row names its ADR: it is the only thing the halves align on first",
  flatFour.includes("the only thing the two halves align on before either of them starts"),
  "the reason is missing",
);

done();
