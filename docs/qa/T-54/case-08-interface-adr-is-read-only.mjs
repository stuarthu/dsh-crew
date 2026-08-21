// T-54, DoD item 10: the briefing carries the interface ADR's path, this half
// reads its own side of it, and it may not edit that ADR — a wrong pin goes to the
// PM.
//
// What it proves: neither half can move the one document they both align on. If
// the code half quietly changes the agreed export name, the unit-test half is
// asserting against something that no longer exists, and the merged run goes red
// for a name clash — which looks exactly like a disagreement but teaches nothing.
// `CRD 0014` item 4 gives the ADR to the architect alone for that reason.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-engineer.md"));

check(
  "the file names the interface ADR",
  flatText.includes("interface ADR"),
  "the document both halves align on is not mentioned",
);

check(
  "it says the role may not edit it",
  flatText.includes("edit the interface ADR") || flatText.includes("never edit"),
  "the ban on editing the shared record is missing",
);

check(
  "a wrong pin is reported to the PM",
  flatText.includes("PM"),
  "no route is given for a pin the role believes is wrong",
);

check(
  "it points at the decisions folder, as every role meeting a how-decision must",
  flatText.includes("docs/decisions/adr/"),
  "the path verify-mount.mjs also pins is missing",
);

done();
