// T-62, DoD item 3: the first meeting is run EXACTLY ONCE. The PM reports what
// came out, and may not change something and run it again, nor run it until it
// is green.
//
// What it proves: the one rule that keeps the whole shape from collapsing. The
// DoD cell writes out the failure: repeat the run and every mismatch gets read as
// "the code is wrong" and edited away, not one disagreement is ever reported, and
// the PM never learns that a document everybody had agreed on allowed two
// readings. That is ordinary test-first at its worst, wearing this shape's name.
//
// PINNING STYLE: FLATTENED sentences, sliced to step 9. `exactly once` was 0
// times in this file before T-62, so the phrase is this task's own.

import { check, done, flat, flowItem, pairedFlow } from "./paired.mjs";

const flow = flat(pairedFlow());

check(
  "the flow says the first meeting is run exactly once",
  flow.includes("exactly once"),
  "the phrase `exactly once` is not in the paired flow",
);

const fourth = flat(flowItem(4));

check(
  "`exactly once` is on the step that runs the unit tests, not somewhere else",
  fourth.includes("exactly once"),
  "step 4 of the flow does not carry `exactly once` — the phrase may have drifted to another sentence",
);

check(
  "the step forbids changing something and running it again",
  fourth.includes("You never change something and run it again"),
  "the ban on a second run after an edit is missing",
);

check(
  "the step forbids running it until it is green",
  fourth.includes("you never run it until it is green"),
  "the ban on repeating until green is missing",
);

check(
  "the step says what a red result does instead: it goes into the later steps",
  fourth.includes("never round the same command a second time"),
  "the step does not send a red down the disagreement road",
);

check(
  "the step says the result is reported exactly as it came out, before any change",
  fourth.includes("exactly as it came out") && fourth.includes("before anything is changed"),
  "the report-it-raw rule is missing",
);

done();
