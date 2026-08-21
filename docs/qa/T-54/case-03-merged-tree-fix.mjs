// T-54, DoD item 6: when the first meeting is red, the code half is called back
// into the MERGED TREE to fix it — and the file says plainly that the
// independence ends at that moment, on purpose.
//
// What it proves: the honest end of the isolation. This is the moment the design
// gives something up, and `CRD 0013` item 5 required it be written down rather
// than hidden: the code half's independent reading is already on disk and already
// in the evidence, so blindfolding it during the fix would buy no new signal and
// only make the fix harder. A persona that left this vague would produce an
// engineer that either refuses to read the tests it now needs, or reads them
// while believing it is cheating.
//
// PINNING STYLE: FLATTENED. `merged tree` appeared 0 times in any role prompt
// before this job, so it is this task's own noun.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-engineer.md"));

check(
  "the file names the merged tree",
  flatText.includes("merged tree"),
  "`merged tree` is not in the file — no role prompt used it before this job",
);

check(
  "the PM is the one who calls the role back into it",
  flatText.includes("The PM calls you back into the **merged tree**"),
  "who calls the role back is not named",
);

check(
  "in that tree the role can read the unit tests",
  flatText.includes("there you can read the unit tests"),
  "the file does not say the tests are readable after the merge",
);

check(
  "it says the independence ends at that moment, as a deliberate choice",
  flatText.includes("The independence ends at that moment")
    && flatText.includes("deliberate choice"),
  "the end of the isolation is not stated as a decision",
);

check(
  "it says the choice is written down rather than hidden",
  flatText.includes("written down here rather than hidden"),
  "the honesty clause is missing",
);

check(
  "it gives the reason: the independent reading is already in the evidence",
  flatText.includes("already recorded as evidence before the merge"),
  "the reason blindfolding would buy nothing is missing",
);

done();
