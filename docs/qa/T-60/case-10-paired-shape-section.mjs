// T-60, DoD item 8: `CLAUDE.md` carries a paired-shape passage, and it says all
// four things — architect-only jobs, two worktrees each with the symlink, the
// first meeting run by the PM after the merge, and green meaning only that the two
// readings matched.
//
// What it proves: the second half of the hole this round was asked to close first.
// The whole `## The paired shape` section is prose that no check in `npm test`
// reads: delete it and everything stays green. It is the only place in this
// repository's own instructions where somebody changing the code learns how the
// shape works, so a silent deletion would take the shape's rationale with it.
//
// PINNING STYLE: LINE-BASED for the section heading and its bullet markers,
// FLATTENED for every sentence.

import { check, claude, claudeSection, done, flat } from "./claude.mjs";

check(
  "CLAUDE.md has a `## The paired shape` section",
  claude().includes("\n## The paired shape\n"),
  "the section heading is gone",
);

const paired = claudeSection("The paired shape");
const flatPaired = flat(paired);

check(
  "it says what the two halves write, and that they never meet",
  flatPaired.includes("`crew_test_engineer` writes only the unit test files")
    && flatPaired.includes("`crew_code_engineer` writes only the product code")
    && flatPaired.includes("the two never meet"),
  "the definition of the shape is missing",
);

check(
  "it says the solo shape is unchanged and stays the default",
  flatPaired.includes("is unchanged and stays the default"),
  "without this, the section reads as a replacement rather than a second road",
);

check(
  "the section is built as four parts",
  flatPaired.includes("Four parts of it shape how this repository is worked in"),
  "the four-part structure the DoD asks for is gone",
);

check(
  "the bullets really are four",
  paired.split("\n").filter((line) => line.startsWith("- **")).length === 4,
  `found ${paired.split("\n").filter((line) => line.startsWith("- **")).length} top-level bullet(s)`,
);

check(
  "part one: it exists only in a job that has an architect",
  flatPaired.includes("It exists only in a job that has an architect")
    && flatPaired.includes("has no paired shape at all"),
  "the architect-only boundary, or the small-work half of it, is missing",
);

check(
  "part one names the five things the interface ADR pins",
  flatPaired.includes("import path")
    && flatPaired.includes("exported name")
    && flatPaired.includes("signature")
    && flatPaired.includes("shape of the return value")
    && flatPaired.includes("behaviour on an error"),
  "one of the five pinned interface decisions is missing",
);

check(
  "part two: two worktrees, and the symlink in each one",
  flatPaired.includes("The PM makes two git worktrees, and adds the symlink in each one"),
  "the worktree half is missing",
);

check(
  "part two says isolation, not good faith: the unit test does not exist in the code half's tree",
  flatPaired.includes("**does not exist**") && flatPaired.includes("that is isolation, not good faith"),
  "the sentence that makes the isolation real is missing",
);

check(
  "part two says the missing link fails nothing and the tree looks green",
  flatPaired.includes("the missing link fails nothing")
    && flatPaired.includes("still looks green"),
  "the quiet-weakening warning is missing from the worktree part",
);

check(
  "part three: the first meeting is run by the PM, in the merged tree, exactly once",
  flatPaired.includes("The first meeting is run by the PM, in the merged tree, exactly once"),
  "the first-meeting rule is missing",
);

check(
  "part three says why neither engineer runs it, and what repeating it would collapse",
  flatPaired.includes("Neither engineer runs it")
    && flatPaired.includes("collapse the whole thing back into the solo shape at its worst"),
  "the reason the PM owns that run is missing",
);

check(
  "part four: all green means exactly one thing, the two readings matched",
  flatPaired.includes("All green means exactly one thing: the two readings matched"),
  "the claim-limiting sentence is missing",
);

check(
  "part four says it is NOT evidence the document was clear",
  flatPaired.includes("It is **not** evidence that the document was clear"),
  "the ban on the stronger claim is missing",
);

check(
  "part four names who catches a shared wrong reading: crew_qa and the reviewers",
  flatPaired.includes("`crew_qa`") && flatPaired.includes("reviewers"),
  "the net for a correlated misreading is not named",
);

done();
