// T-42, DoD item 5, read the other way round. "收尾那道门" can mean step 10's
// finish gate (case-12) or step 18's CLOSING migration step — move what is
// durable out of a single-use document before it is dropped. The two readings
// cost one case each, so both are covered rather than guessed at; QA's report
// says so.
//
// That step had no pin of its own, and the presence check above it cannot be
// one: delete the whole paragraph and all three of its paths are still somewhere
// else in the prompt, so every check stayed green while "not needed any more"
// quietly became "lost". The pin is a COUNT of `docs/qa/gaps.md`, because
// `includes` stops at the first copy.
//
// It is a floor, not an exact number — roles/pm.md may grow another copy, and
// today it holds more than the three the message names — so this case counts
// what is really there and leaves a fixed number behind. Copies are rewritten to
// another path rather than deleted, so only the count moves and the paragraphs
// around it stay the length they were.

import { check, done, tempRepo, runCheck, cleanUp, copyFile, keepCopies, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const PATH = "docs/qa/gaps.md";
const FAIL = "and it needs 3";
const REGISTERED = "PM prompt section registered";

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green (so the red below is the mutation)");
  check(`the copy says: ok ${REGISTERED}`, saidOk(base, REGISTERED), base.out);
  const copies = copyFile(dir, "roles/pm.md").split(PATH).length - 1;
  check(`roles/pm.md holds at least the 3 copies of \`${PATH}\` the pin needs (it holds ${copies})`, copies >= 3, "the floor is not met");
} finally {
  cleanUp(dir);
}

// Red: two copies left, so the count is below its floor.
const two = tempRepo();
try {
  const held = keepCopies(two, "roles/pm.md", PATH, 2, "docs/qa/somewhere-else.md");
  const run = runCheck(two, "tools/verify-mount.mjs");
  expectRed(run, FAIL, `roles/pm.md cut from ${held} copies of \`${PATH}\` to 2 is red`);
  check("and the PM prompt section is not reported as registered", !saidOk(run, REGISTERED), run.out);
} finally {
  cleanUp(two);
}

// Red with one copy left too. The pin above it in the chain only asks whether
// the path is present at all, and one copy satisfies that, so the COUNT is still
// what speaks — asserted, so the two pins cannot be silently swapped for each
// other.
const one = tempRepo();
try {
  keepCopies(one, "roles/pm.md", PATH, 1, "docs/qa/somewhere-else.md");
  const run = runCheck(one, "tools/verify-mount.mjs");
  expectRed(run, FAIL, "roles/pm.md cut to 1 copy is red, and it is still the count pin that says so");
} finally {
  cleanUp(one);
}

// Green: exactly three copies. The floor is met, and a file that has since grown
// a fourth is not reddened for it.
const three = tempRepo();
try {
  keepCopies(three, "roles/pm.md", PATH, 3, "docs/qa/somewhere-else.md");
  expectGreen(runCheck(three, "tools/verify-mount.mjs"), "exactly 3 copies stays green (the pin is a floor, not an exact count)");
} finally {
  cleanUp(three);
}

done();
