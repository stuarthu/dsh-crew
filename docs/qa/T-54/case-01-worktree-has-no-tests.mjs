// T-54, DoD item 2: the code half works in its own git worktree, and that tree
// DOES NOT HOLD the unit test files. The wording has to be "cannot read them",
// not "should not read them".
//
// What it proves: the isolation is a fact about the filesystem, not a promise from
// a model. `CRD 0013` item 3 chose two worktrees over an instruction precisely
// because an instruction is only as good as the agent's compliance, and a missing
// file needs no compliance at all. A persona that softened this into "do not read
// the tests" would turn a guarantee back into good faith — and nothing would
// notice, because a run where the code half peeked looks exactly like a run where
// it did not.
//
// PINNING STYLE: FLATTENED for the sentences; the softened wordings are checked as
// absences, because that is what the DoD forbids.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/code-engineer.md");
const flatText = flat(text);

check(
  "the file tells the role it has a git worktree of its own",
  flatText.includes("worktree"),
  "`worktree` is not in the file — no role prompt used the word before this job",
);

check(
  "there is a section about the one thing that tree does not hold",
  flatText.includes("Your worktree, and the one thing it does not hold"),
  "the section naming the missing half is gone",
);

check(
  "the wording is CANNOT read, not SHOULD NOT read",
  flatText.includes("Your tree does not hold them, so you cannot read them"),
  "the cannot-read sentence is missing; an instruction not to look is a weaker thing entirely",
);

check(
  "the file does not soften the isolation into a probability",
  !flatText.includes("you probably will not look")
    || flatText.includes('This may not be softened anywhere into "you probably will not look at them"'),
  "the file contains the softened wording other than as the thing it forbids",
);

check(
  "it says the mismatch at the merge is the most useful thing the shape produces",
  flatText.includes("the most useful thing this shape produces"),
  "the reason for the isolation is missing, so it reads as bureaucracy",
);

check(
  "the briefing is where the tree's path comes from",
  flatText.includes("named its path in your briefing"),
  "the role is not told where its tree is",
);

done();
