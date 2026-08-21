// T-53, DoD item 7: it talks only to the PM, it cannot reach the other engineer,
// and the file says that this is the PLATFORM and not a rule of manners — plus,
// in the same passage, that what it writes is unit tests and not product code.
//
// What it proves: something `tools/verify-mount.mjs` explicitly cannot prove. The
// mount check's generic loop only asks whether each persona is readable, over 500
// characters and free of `{{`. The DoD cell says so in as many words. So this
// sentence has no other guard anywhere.
//
// Why the platform half matters: a role told only "do not talk to your sibling"
// may try anyway and treat the refusal as an error to work around. A role told
// `send_message` cannot reach a sibling — a sibling is not a child — knows the
// channel does not exist and routes through the PM, which is where the
// disagreement becomes useful.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/test-engineer.md"));

check(
  "the file carries the crew's standard sentence about who it talks to",
  flatText.includes("is the only one you talk to"),
  "the anchor sentence is missing, and verify-mount.mjs does not check for it",
);

check(
  "it says it cannot talk to the other engineer on the task",
  flatText.includes("you cannot talk to the other engineer"),
  "the sibling ban is missing",
);

check(
  "it says this is the platform, not etiquette",
  flatText.includes("That is not etiquette, it is the platform"),
  "the reason is missing — a role that thinks this is manners may try to work around it",
);

check(
  "it names the mechanism: send_message cannot reach a sibling",
  flatText.includes("send_message") && flatText.includes("a sibling agent is not your child"),
  "the mechanism is not named",
);

check(
  "it says the refusal happens even when the role holds the tool",
  flatText.includes("refused even if you hold the tool"),
  "without this, a role holding send_message may believe the ban does not apply to it",
);

check(
  "the same passage says what it writes: unit tests, not product code",
  flatText.includes("while you write the unit tests"),
  "the passage does not repeat which half this role owns",
);

done();
