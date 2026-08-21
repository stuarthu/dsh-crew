// T-53, DoD item 9: the briefing carries the path of the interface ADR, the role
// reads its own half of it, and it may NOT edit that ADR — if it thinks the ADR
// pinned the wrong thing, it reports to the PM.
//
// What it proves: the one document both halves align on cannot be moved by one
// half alone. The two engineers cannot see or talk to each other, so if the
// unit-test half quietly changes the agreed signature, the code half is building
// against a document that no longer exists — and the merged run goes red for a
// name clash, which teaches nobody anything. `CRD 0014` item 4 makes the ADR the
// architect's alone for exactly that reason.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/test-engineer.md"));

check(
  "the file names the interface ADR",
  flatText.includes("interface ADR"),
  "the document both halves align on is not mentioned",
);

check(
  "it says the ADR's path comes in the briefing",
  flatText.includes("briefing"),
  "nothing says where the role gets the path",
);

check(
  "it says the role may not edit that ADR",
  flatText.includes("to edit the interface ADR") || flatText.includes("never edit the interface ADR"),
  "the ban on editing the shared record is missing",
);

check(
  "a wrong pin goes to the PM, not into the role's own edit",
  flatText.includes("PM"),
  "no route is given for a pin the role believes is wrong",
);

check(
  "it points at the decisions folder, as every role that meets a how-decision must",
  flatText.includes("docs/decisions/adr/"),
  "the path verify-mount.mjs also pins is missing",
);

done();
