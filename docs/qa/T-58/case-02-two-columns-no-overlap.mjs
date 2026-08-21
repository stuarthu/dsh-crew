// T-58, DoD item 2: a paired task's file list splits into TWO lists, one per half,
// and they may not overlap.
//
// What it proves: the isolation is buildable. Two worktrees only isolate the halves
// if the two file lists are disjoint — one file on both lists means both halves edit
// it, and the merge produces a conflict that is not a disagreement about the
// document but an ordinary collision. `CRD 0013` item 6 made the non-overlap a
// property of the table, so the architect settles it while writing the rows rather
// than the PM discovering it at merge time.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/architect.md"));

check(
  "a pair task's files are two lists, one per half",
  flatText.includes("this is two lists, one per half"),
  "the split is not described",
);

check(
  "the two lists may not overlap",
  flatText.includes("may not overlap"),
  "the non-overlap rule is missing — without it two worktrees isolate nothing",
);

check(
  "it says not one file may sit on both lists",
  flatText.includes("Not one file on both"),
  "the rule is stated loosely enough to be read as a preference",
);

check(
  "the general rule that two tasks never own the same file is still there",
  flatText.includes("two tasks must never own the same file"),
  "the rule the paired split is a special case of has gone",
);

done();
