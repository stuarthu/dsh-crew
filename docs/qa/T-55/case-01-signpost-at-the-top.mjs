// T-55, DoD item 1: `roles/engineer.md` opens with a signpost — this file is the
// SOLO shape; the paired shape is two other roles, and the PM sends it only in a
// job that has an architect.
//
// What it proves: the solo engineer, which is still the default road, cannot
// mistake itself for one half of a paired task. Before this job there was one
// engineer role and no shape at all; now an agent reading this file has to know
// which of three engineer roles it is, and the answer has to arrive before any of
// the behaviour rules do — hence "in the first 15 lines".
//
// PINNING STYLE: LINE-BASED for the window (a line count is what "at the top"
// means), FLATTENED for the sentences inside it.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/engineer.md");
const head = flat(text.split("\n").slice(0, 15).join("\n"));

check(
  "the first 15 lines say this file is the solo shape",
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
  "it points at principle 21 for the rule",
  head.includes("principle 21"),
  "the signpost does not say where the other road is written down",
);

check(
  "it says plainly that this changes nothing below",
  head.includes("It is not your road, and it changes nothing below"),
  "without this, the signpost reads as a change to the role's own behaviour",
);

done();
