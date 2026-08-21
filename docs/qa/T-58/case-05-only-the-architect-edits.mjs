// T-58, DoD item 5: only the architect changes that ADR. An engineer who thinks a
// pin is wrong reports it to the PM; the PM starts a fresh architect to change it;
// and the half that already started against the old version is RUN AGAIN.
//
// What it proves: all three parts. The third is the one most easily dropped and the
// most expensive to leave out — if the ADR changes while one half has already
// written against the old pin, that half's work is now an independent reading of a
// document that no longer exists, and merging it produces a red run that means
// nothing. `CRD 0014` item 4 required all three.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/architect.md"));

check(
  "part one: only the architect changes that ADR",
  flatText.includes("Only you change that ADR"),
  "the exclusive ownership is missing",
);

check(
  "the rule is copied into the ADR file itself",
  flatText.includes("Copy that rule into the file"),
  "the rule stays only in this prompt, where the engineer reading the ADR cannot see it",
);

check(
  "part two: an engineer reports a wrong pin to the PM and never edits it",
  flatText.includes("reports it to the PM and never edits it"),
  "the engineer's route is missing",
);

check(
  "the PM starts a fresh architect to make the change",
  flatText.includes("the PM starts a fresh architect to change it"),
  "who performs the change is not named",
);

check(
  "part three: the half already started against the old version is run again",
  flatText.includes("the half that already started against the old version is run again"),
  "the re-run is missing — the most expensive part to leave out",
);

check(
  "it says this is the boundary-contract rule reused, not a new invention",
  flatText.includes("reused as it stands rather than reinvented here"),
  "the connection to the existing rule is gone, which is how two divergent rules appear",
);

done();
