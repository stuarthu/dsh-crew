// T-57, DoD item 1: the code reviewer is told what evidence a paired task brings —
// three pieces, all three required: the unit-test half's red run, the single result
// of the first meeting, and the disagreement record.
//
// What it proves: the reviewer knows what to ask for and what a gap means. In the
// solo shape the reviewer looks for one red-then-green pair from one agent; here
// the red belongs to one half, the merged run belongs to the PM, and the third
// piece may legitimately be empty. A reviewer without this passage would read a
// perfectly correct paired report as missing its proof.
//
// PINNING STYLE: FLATTENED. `disagreement` appeared 0 times in this file before
// this task, so it is T-57's own noun.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-reviewer.md"));

check(
  "the file uses the noun `disagreement`",
  flatText.includes("disagreement"),
  "the noun is missing — it was 0 times in this file before this task",
);

check(
  "piece one: the red run from the unit-test half, in its own worktree, before the code existed",
  flatText.includes("in its own worktree, while the product code did not exist"),
  "the first piece of evidence is missing",
);

check(
  "piece one carries the failing output word for word",
  flatText.includes("carries that failing output word for word"),
  "the reviewer is not told to expect the raw output",
);

check(
  "piece two: the result of the first meeting, run once by the PM",
  flatText.includes("The result of the first meeting")
    && flatText.includes("**exactly once**"),
  "the second piece is missing",
);

check(
  "piece two says why it belongs to the PM: the code half cannot run those tests",
  flatText.includes("the code half cannot run those unit tests"),
  "the reason the PM owns that run is missing",
);

check(
  "piece two says a run repeated until it passed is blocking",
  flatText.includes("that run repeated until it passed, that is blocking"),
  "the reviewer is not told to catch the repeated run — the failure that empties the whole shape",
);

check(
  "piece three: the disagreement record, and it may be empty when the meeting was green",
  flatText.includes("The disagreement record, when the first meeting was red"),
  "the third piece is missing",
);

check(
  "piece three says a weakened assertion is blocking unless the PM approved it",
  flatText.includes("An assertion weakened to make a disagreement go away is blocking"),
  "the reviewer is not told to catch a lowered bar",
);

check(
  "piece three says a fix in the merged tree is not leakage and not a finding",
  flatText.includes("not leakage and not a finding"),
  "without this the reviewer would report the legitimate end of the isolation as a defect",
);

done();
