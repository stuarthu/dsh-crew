// T-55, DoD item 1: `roles/engineer.md` opens with a signpost — this file is the
// SOLO shape; the paired shape is two other roles, and the PM sends it only in a
// job that has an architect.
//
// What it proves: the solo engineer, which is still the default road, cannot
// mistake itself for one half of a paired task. Before this job there was one
// engineer role and no shape at all; now an agent reading this file has to know
// which of three engineer roles it is, and the answer has to arrive before any of
// the behaviour rules do — hence "in the opening, above the first section".
//
// CHANGED BY T-71 (apply-req job), and each change is a decision, not drift.
// T-71 applied the PRD's B9: a role prompt may not point at a path that exists
// only in this repository, because this prompt ships inside the npm package and
// `principles.md` is not even in `package.json`'s `files` list. So the signpost's
// last pointer — "principle 21 in the crew's principles.md" — is gone and the
// whole paired rule is now written out in the signpost itself. Two assertions
// here were reading the old shape:
//
//   1. "it points at principle 21 for the rule" was a PROXY. What this case is
//      really about is that an engineer learns the paired rule from its own
//      prompt; "there is a pointer to where the rule is written down" was only
//      ever the cheapest way to ask that, and B9 deleted the pointer on purpose
//      while keeping every word of the rule. So the proxy is replaced by the
//      thing itself, in three checks — isolation, interface, outcome — so a
//      later edit that drops one third of the rule says which third.
//   2. The window was "the first 15 lines". That WAS a fair reading of "at the
//      top" and the part of the old reasoning that stays true is that the
//      signpost has always sat above every behaviour rule — before T-71 and
//      after it. What went stale is only the inference that 15 lines is enough
//      to hold it: writing the rule out in place made the opening 21 lines long.
//      A line count will go stale again on any rewrite, so the window is now the
//      file's own STRUCTURE: everything above the first `## ` section heading.
//      That still asks the real question ("the signpost arrives before any of the
//      behaviour rules"), and it cannot rot on a reflow. It is deliberately not
//      widened to the whole file: "somewhere in the prompt" is not this case.
//
// PINNING STYLE: STRUCTURAL for the window (the opening is what comes before the
// first section heading), FLATTENED for the sentences inside it.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/engineer.md");

// The opening: everything before the first `## ` heading. Throw rather than fall
// back to the whole file — a window that silently grew to the whole prompt would
// leave every check below green while testing nothing about "at the top".
const firstSection = text.indexOf("\n## ");
if (firstSection === -1) {
  throw new Error("roles/engineer.md has no `## ` section heading, so it has no opening for this case to read");
}
const head = flat(text.slice(0, firstSection));

check(
  "the opening says this file is the solo shape",
  head.includes("This file is the solo shape"),
  "the signpost is missing from the opening",
);

check(
  "the opening names crew_test_engineer",
  head.includes("crew_test_engineer"),
  "the first half of the other road is not named",
);

check(
  "the opening names crew_code_engineer",
  head.includes("crew_code_engineer"),
  "the second half of the other road is not named",
);

check(
  "it says which half each of those two writes",
  head.includes("writes only the unit tests") && head.includes("writes only the product code"),
  "the two roles are named but not distinguished",
);

check(
  "it says the solo shape is the default",
  head.includes("That is the default"),
  "nothing tells this role it is still the normal road",
);

check(
  "it says the PM sends the paired shape only in a job that has an architect",
  head.includes("only in a job that has an architect"),
  "the boundary of the other road is missing",
);

check(
  "the rule itself is written out here: each half in its own git worktree, and the unit test file absent from the code engineer's tree",
  head.includes("each half works in its own git worktree")
    && head.includes("the unit test file does not exist in the code engineer's tree"),
  "the isolation half of the paired rule is not in the opening — the reader would have to go looking for it, which is what B9 forbids",
);

check(
  "and the interface half: the two never talk, and the architect pins it in an ADR neither half may change",
  head.includes("the two never talk to each other")
    && head.includes("the architect pins the interface between them in an ADR that neither half may change"),
  "the interface half of the paired rule is not in the opening",
);

check(
  "and the outcome half: the PM merges and runs once, the disagreement is the product, and no assertion may be weakened away",
  head.includes("the PM merges the two halves, runs the project's test command once")
    && head.includes("the disagreement is the product")
    && head.includes("may never weaken an assertion to make a disagreement go away"),
  "the outcome half of the paired rule is not in the opening",
);

check(
  "it says plainly that this changes nothing below",
  head.includes("It is not your road, and it changes nothing below"),
  "without this, the signpost reads as a change to the role's own behaviour",
);

done();
