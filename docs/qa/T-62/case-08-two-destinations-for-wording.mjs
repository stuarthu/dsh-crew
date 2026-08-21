// T-62, DoD item 7: when a disagreement improves the wording of a DoD section,
// there are TWO landing places and each names its approver.
//
//   * the meaning did not move, the sentence only got clearer -> the PM edits the
//     task row itself and reports it at the next milestone review;
//   * what "done" means moved -> that is scope: stop, get the user's yes there
//     and then, and write it up as a CRD of its own.
//
// What it proves: a real improvement is not silently lost, and a scope change is
// not silently taken. Both halves have to be there — with only the first, the PM
// may quietly redefine "done"; with only the second, every clarification costs a
// CRD and so nobody bothers.
//
// PINNING STYLE: FLATTENED, sliced to the paired flow.

import { check, done, flat, pairedFlow } from "./paired.mjs";

const flow = flat(pairedFlow());

check(
  "the flow says a better wording lands in the task row in docs/design/tasks.md",
  flow.includes("lands in that task row in `docs/design/tasks.md`"),
  "the destination of an improved DoD wording is missing",
);

check(
  "it says who approves depends on what moved",
  flow.includes("who approves it depends on what moved"),
  "the passage does not split the two cases by approver",
);

check(
  "case one: meaning unchanged -> the PM edits it and reports at the milestone review",
  flow.includes("The meaning did not move")
    && flow.includes("You edit the task row yourself")
    && flow.includes("next milestone review"),
  "the first landing place, or its approver, is missing",
);

check(
  "case two: the meaning of done moved -> it is scope, the user's yes, and its own CRD",
  flow.includes('What "done" means moved')
    && flow.includes("get the user's yes")
    && flow.includes("CRD of its own"),
  "the second landing place, or its approver, is missing",
);

check(
  "the two cases are marked as not the same size",
  flow.includes("they are not the same size"),
  "the passage does not say the two cases differ in weight",
);

done();
