// T-54, DoD item 8: it talks only to the PM, cannot reach the other engineer, the
// ban is the platform's and not manners, and the same passage names what this half
// writes — product code, not unit tests.
//
// What it proves: the same thing `tools/verify-mount.mjs` cannot. Its generic loop
// checks that each persona is readable, over 500 characters and free of `{{`, and
// nothing more; the DoD cell says so. So this sentence has no other guard.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-engineer.md"));

check(
  "the file carries the crew's standard sentence about who it talks to",
  flatText.includes("is the only one you talk to"),
  "the anchor sentence is missing, and no project check looks for it",
);

check(
  "it says it cannot talk to the other engineer on this task",
  flatText.includes("you cannot talk to the other engineer"),
  "the sibling ban is missing",
);

check(
  "it says the ban is the platform's, not a rule the role merely keeps",
  flatText.includes("not only a rule you keep"),
  "the platform half is missing",
);

check(
  "it names the mechanism: a sibling is not a child, so send_message cannot reach",
  flatText.includes("a sibling is not a child") && flatText.includes("send_message"),
  "the mechanism is not named",
);

check(
  "the same passage says this half writes the product code",
  flatText.includes("while you write the **product code**"),
  "the passage does not name which half this role owns",
);

check(
  "disagreements travel through the PM",
  flatText.includes("travels through the PM"),
  "no route is given for a disagreement",
);

done();
