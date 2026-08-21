// T-56, DoD item 6: the cost is written as an ESTIMATE and passed on as one —
// roughly 35% to 75% more effort, plus two worktrees to open, one merge and two
// clean-ups.
//
// What it proves: a number nobody measured is not dressed up as a measurement.
// This matters more here than it looks: the PM's first cost figure for this whole
// design came from pair programming's literature, and `CRD 0012` records that the
// analogy was wrong. A number with a stated basis can be argued with; a number
// presented as fact gets quoted.
//
// PINNING STYLE: FLATTENED, sliced to step 4.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const flatFour = flat(step(pm(), 4));

check(
  "the cost paragraph says it is an estimate, and is passed on as one",
  flatFour.includes("The cost is an estimate, and you pass it on as one"),
  "the framing is missing",
);

check(
  "the range is there: roughly 35% to 75% more effort",
  flatFour.includes("roughly 35% to 75% more effort"),
  "the range is missing",
);

check(
  "the reason for the range is given: writing splits, reading doubles",
  flatFour.includes("the writing is split in two, but the reading of the document is done twice"),
  "the basis of the estimate is missing, which is what makes it arguable",
);

check(
  "the other costs are named: worktrees, a merge, and clean-ups",
  flatFour.includes("two worktrees to open") && flatFour.includes("one merge")
    && flatFour.includes("two clean-ups"),
  "one of the concrete costs is missing",
);

check(
  "it says none of the numbers is a measurement",
  flatFour.includes("None of those numbers is a measurement"),
  "the sentence that stops the estimate from being quoted as fact is missing",
);

check(
  "it says passing them on as firmer would claim more than the crew can back",
  flatFour.includes("would claim more than this crew can back"),
  "the reason is missing",
);

check(
  "wall time is described as possibly shorter, which is a different quantity",
  flatFour.includes("Wall time can come out shorter"),
  "the distinction between effort and elapsed time is missing",
);

done();
