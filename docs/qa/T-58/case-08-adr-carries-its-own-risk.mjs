// T-58, DoD item 8: the interface ADR's own risk is written into the file, in one
// line — the ADR is a third document both halves read, so both halves can still
// misread it the same way, and the net gain is still positive.
//
// What it proves: the design does not claim to have removed the risk it was built
// against. This is the honest sentence: a signature can be read two ways far less
// easily than a paragraph of prose, so what the ADR adds to the shared-misreading
// risk is much smaller than the name-clash noise it removes. And the file still says
// what actually catches a shared misreading — QA, afterwards.
//
// Why this matters beyond honesty: an architect that believed the ADR removed the
// risk would stop caring how the ADR is worded, which is precisely where the
// remaining risk lives.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/architect.md"));

check(
  "the file says to write the ADR's own risk into it, in one line",
  flatText.includes("Write its own risk into the file, in one line"),
  "the instruction is missing",
);

check(
  "the risk is named: both halves can misread the same document the same way",
  flatText.includes("both halves can still misread it the same way"),
  "the risk is not described",
);

check(
  "and its consequence: the merged run is green and nothing is reported",
  flatText.includes("the merged run is all green and nothing is reported"),
  "the consequence of the shared misreading is missing",
);

check(
  "it says plainly the gain is not that the risk goes away",
  flatText.includes("The gain is not that the risk goes away"),
  "the overclaim is not ruled out",
);

check(
  "it gives the reason the trade is still positive: a signature is harder to misread than prose",
  flatText.includes("a signature can be read two ways far less easily than a paragraph of prose"),
  "the reason is missing, so the trade is asserted rather than argued",
);

check(
  "it says what still catches a shared misreading: QA, afterwards",
  flatText.includes("the only thing that catches a shared misreading is still QA, afterwards"),
  "the remaining net is not named",
);

done();
