// T-62, DoD item 9: the last step cleans up BOTH worktrees and BOTH branches,
// and it is the PM's own work.
//
// What it proves: the cost `CRD 0013` accepted does not turn into a pile of git
// litter. Two worktrees and two branches per paired task, left behind, accumulate
// where nobody else will clear them — the PM is the only one who uses git, so
// nobody else can.
//
// PINNING STYLE: the step boundary is LINE-BASED (`flowItem(8)`); the commands
// are LINE-BASED too (a fenced command does not wrap); the sentences are
// FLATTENED.

import { check, done, flat, flowItem } from "./paired.mjs";

const eighth = flowItem(8);
const flatEighth = flat(eighth);

check(
  "the last step of the flow removes the worktrees with `git worktree remove`",
  eighth.includes("git worktree remove"),
  "`git worktree remove` is not in step 8 of the flow",
);

check(
  "BOTH trees are removed, not one",
  (eighth.match(/git worktree remove/g) ?? []).length >= 2,
  `found ${(eighth.match(/git worktree remove/g) ?? []).length} `
    + "`git worktree remove` command(s) in step 8 — a paired task opens two trees",
);

check(
  "both branches are deleted as well",
  eighth.includes("git branch -d"),
  "the two branches are never deleted — half the litter would stay",
);

check(
  "the step says why: git litter nobody else will clear",
  flatEighth.includes("git litter that nobody else will clear"),
  "the reason for the clean-up is missing",
);

check(
  "the same step hands the code reviewer all three pieces of evidence",
  flatEighth.includes("three pieces of evidence")
    && flatEighth.includes("the red run from the unit-test half")
    && flatEighth.includes("the single result of the first meeting")
    && flatEighth.includes("disagreement record"),
  "the evidence hand-over, or one of its three pieces, is missing from step 8",
);

check(
  "it says the middle piece is the PM's to give, because the code half could not run those tests",
  flatEighth.includes("The middle one is yours to give"),
  "the reason the PM owns the first-meeting result is missing",
);

done();
