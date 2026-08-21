// T-62, DoD item 6: the unit-test half may never WEAKEN an assertion to make a
// disagreement go away; only the PM may approve such a change, and the change has
// to trace back to the words of the task row's DoD section.
//
// What it proves: the quiet failure named in the passage — both halves give way a
// little, they meet on an answer nobody checked against the document, every check
// is green, and what the document asked for was never built. A green run bought
// by lowering the bar is the one outcome this whole shape cannot detect by
// itself.
//
// PINNING STYLE: FLATTENED, sliced to the paired flow. The word `weaken` is
// reused on purpose from `roles/engineer.md`, which already had it — no new
// vocabulary was invented for this rule.

import { check, done, flat, pairedFlow } from "./paired.mjs";

const flow = flat(pairedFlow());

check(
  "the flow uses the word `weaken` for lowering an assertion",
  flow.includes("weaken"),
  "`weaken` is not in the paired flow",
);

check(
  "it says the unit-test half may never do it",
  flow.includes("may never **weaken** an assertion"),
  "the ban on the test half weakening an assertion is missing",
);

check(
  "it says the code half may not edit an assertion at all",
  flow.includes("may never edit one at all"),
  "the code half is not stopped from editing an assertion",
);

check(
  "only the PM may approve such a change",
  flow.includes("Only you may approve a change to what a unit test demands"),
  "the approver is not named, or is not the PM",
);

check(
  "the change has to trace back to the words of the DoD section",
  flow.includes("trace back to the words of the task row's **DoD section**"),
  "the traceability requirement is missing",
);

check(
  "the passage names the quiet failure this stops",
  flow.includes("both halves give way a little"),
  "the reason — a green run nobody checked against the document — is missing",
);

done();
