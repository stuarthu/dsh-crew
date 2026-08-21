// T-62, DoD item 5: a green first meeting is reported as "the two readings
// matched", and never as "the document is clear".
//
// What it proves: the sentence that stops this shape from over-claiming. CRD
// 0012 item 15 asks for exactly these words, and the reason is in the passage:
// two readers can take the same wrong meaning out of one weak sentence, the two
// halves then fit, everything is green, and nothing is reported.
//
// DELIBERATELY FRAGILE (`ADR 0004`, `ADR 0007`): this pins the prose, so a
// legitimate rewording has to change this case in the same commit. That is the
// trade the two ADRs chose, not an accident.
//
// PINNING STYLE: FLATTENED, sliced to the paired flow.

import { check, done, flat, pairedFlow } from "./paired.mjs";

const flow = flat(pairedFlow());

check(
  "the flow reports a green first meeting as `the two readings matched`",
  flow.includes("the two readings matched"),
  "the exact phrase is not in the paired flow",
);

check(
  "it says to report it in those words",
  flow.includes("Report it in those words"),
  "the instruction to use those words is missing",
);

check(
  "it says green does NOT prove the document was clear",
  flow.includes("It does **not** prove the document was clear"),
  "the half that forbids the stronger claim is missing",
);

check(
  "it forbids ever reporting the stronger claim",
  flow.includes("you may never report that it does"),
  "the ban on claiming the document was clear is missing",
);

check(
  "green is called the result the shape is built for, not a suspicious one",
  flow.includes("not a suspicious"),
  "the passage does not stop a green run from being read as suspicious",
);

check(
  "it names QA as the crew's net for a shared wrong reading",
  flow.includes("QA") && flow.includes("blindfolded"),
  "the passage does not point at QA as the net for a correlated misreading",
);

done();
