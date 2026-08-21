// T-57, DoD item 3: the reviewer is told WHY it may report only so much — a
// correlated misreading. Two agents on the same model can take the same wrong
// meaning from the same weak sentence, agree, go green, and report nothing. The
// measurement is in the file: simultaneous failures at 3.7 times what an
// independence model predicts.
//
// What it proves: the limit is grounded, not a mood. A reviewer told merely "be
// careful with green runs" will drift back to trusting them; a reviewer holding a
// number, a source and a mechanism has something to reason with. The number also
// explains the design choice that looks wrong at first sight — both halves run on
// the SAME model on purpose.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-reviewer.md"));

check(
  "the file carries the measurement: 3.7 times what independence predicts",
  flatText.includes("3.7"),
  "the number is gone — the DoD pins it because a reviewer needs something firmer than a warning",
);

check(
  "it names the source",
  flatText.includes("N-Version Programming with Coding Agents") && flatText.includes("arXiv"),
  "the source of the number is missing, so the number cannot be checked",
);

check(
  "it describes the scale of the study",
  flatText.includes("5 harnesses, 23 models and 48"),
  "the basis of the measurement is missing",
);

check(
  "it names the mechanism: two kinds of ambiguity, and the shape catches one",
  flatText.includes("A document has two kinds of ambiguity"),
  "the mechanism is missing",
);

check(
  "it says the blind kind produces a green run with nothing reported",
  flatText.includes("the halves fit") && flatText.includes("nothing at all is reported"),
  "the failure mode is not described",
);

check(
  "it says the failures cluster where the specification is weakest",
  flatText.includes("cluster where the specification is weakest"),
  "the most useful half of the finding is missing",
);

check(
  "it explains why both halves run on the same model on purpose",
  flatText.includes("Both halves run on the same model on purpose"),
  "the design choice is unexplained, and a reader would call it a bug",
);

check(
  "it says a weaker model on one side would bury the PM in false disagreements",
  flatText.includes("bury the PM in false disagreements"),
  "the reason not to mix models is missing",
);

done();
