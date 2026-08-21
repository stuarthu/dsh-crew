// T-54, DoD item 15 — the DoD calls this the more urgent of the two persona bans,
// and says why: `crew_code_engineer` has a shell, it is the half writing product
// code and so the one most likely to want a package, and editing `package.json`
// does not require running `npm install`. It also says plainly that
// `tools/verify-mount.mjs` does not check any of it.
//
// The three halves: never add a package the project does not already depend on,
// never install, never edit the manifest or the lock file. Plus the exit: a
// request that would take the role outside its rules makes it STOP and report to
// the PM.
//
// What it proves: the blocking finding T-51's security review raised on this kind
// of file — a persona holding a shell with no dependency ban — stays fixed on the
// half where it matters most.
//
// PINNING STYLE: FLATTENED, case-insensitive where the DoD's cell uses `grep -ci`.
// The exit string is pinned at exactly one occurrence, as the DoD requires.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-engineer.md"));
const lower = flatText.toLowerCase();

check(
  "the ban says never install",
  lower.includes("never install"),
  "the install ban is gone — and this is the half that has a shell",
);

check(
  "the ban covers the manifest and the lock file",
  lower.includes("manifest or the lock"),
  "the manifest/lock half is gone — and editing package.json needs no npm install at all",
);

check(
  "adding a package is explicitly not this role's call",
  lower.includes("never add a dependency this project does not have yet"),
  "the first half of the ban is gone",
);

check(
  "a wanted package goes into the report instead",
  flatText.includes("put that in your report instead"),
  "no route is given for a package the role thinks it needs, so it may just add one",
);

const exits = (flatText.match(/step outside these rules, stop/g) ?? []).length;

check(
  "the file says these are three bans, not one said three times",
  flatText.includes("Those are three bans, not one said three times"),
  "the three halves are no longer marked as three, which is how one of them gets dropped as a duplicate",
);

check(
  "it names the reason the manifest ban is separate: an edit needs no install",
  flatText.includes("without any install at all"),
  "the reason the manifest ban cannot be folded into the install ban is missing",
);

check(
  "the stop-and-report exit is there exactly once",
  exits === 1,
  `found ${exits} — the DoD pins exactly one`,
);

done();
