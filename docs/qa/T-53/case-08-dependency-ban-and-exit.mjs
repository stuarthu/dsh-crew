// T-53, DoD item 15 — and the DoD cell says outright why this case has to exist:
// these rules came out of a security review, and `tools/verify-mount.mjs` does
// NOT check them. Delete the whole paragraph and every check in the project
// stays green.
//
// The three halves of the dependency ban: never add a package the project does
// not already have, never install, never edit the manifest or the lock file. Plus
// the exit that goes with them: a request that would take the role outside its
// rules makes it STOP and report to the PM instead of improvising.
//
// What it proves: the finding T-51's security review raised on this same kind of
// file — a persona with a shell but no dependency ban — stays fixed. A test
// engineer that may install a package can pull code from the network into the
// project on its own authority, and the review that would catch it runs later, if
// at all.
//
// PINNING STYLE: FLATTENED and case-insensitive where the DoD's own cell uses
// `grep -ci`. The exit string is pinned exactly once, as the DoD requires.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/test-engineer.md"));
const lower = flatText.toLowerCase();

check(
  "the ban says never install",
  lower.includes("never install"),
  "the install ban is gone — nothing else in the project checks for it",
);

check(
  "the ban covers the manifest and the lock file",
  lower.includes("manifest or the lock"),
  "the manifest/lock half of the ban is gone",
);

check(
  "the ban covers adding a package the project does not already have",
  lower.includes("the project does not depend on yet"),
  "the first half of the ban — adding a package is not this role's call — is gone",
);

const exits = (flatText.match(/step outside these rules, stop/g) ?? []).length;

check(
  "the stop-and-report exit is there exactly once",
  exits === 1,
  `found ${exits} — the DoD pins exactly one`,
);

check(
  "the exit routes to the PM rather than to the role's own judgement",
  flatText.includes("step outside these rules, stop") && flatText.includes("PM"),
  "the exit does not name who to report to",
);

done();
