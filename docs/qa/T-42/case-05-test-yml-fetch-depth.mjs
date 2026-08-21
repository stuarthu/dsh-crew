// T-42, DoD item 2 (breakage 4 of 4): test.yml stops asking for full history.
// T-22's reason: some cases under docs/qa/ read this repository's own commits,
// and on a shallow clone they would pass over an empty set — a false green,
// which is worse than a red.

import { check, done, tempRepo, runCheck, cleanUp, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const OK = ".github/workflows/test.yml runs npm test on a push, with full history";
const FAIL = ".github/workflows/test.yml does not set fetch-depth: 0";
const TEST_YML = ".github/workflows/test.yml";

const withDepth = (replacement, assert) => {
  const dir = tempRepo();
  try {
    edit(dir, TEST_YML, "          fetch-depth: 0\n", replacement);
    assert(runCheck(dir, "tools/verify-mount.mjs"));
  } finally {
    cleanUp(dir);
  }
};

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green (so a red below is the mutation)");
  check(`the copy says: ok ${OK}`, saidOk(base, OK), base.out);
} finally {
  cleanUp(dir);
}

// Red: the shallow default, spelled out.
withDepth("          fetch-depth: 1\n", (run) => {
  expectRed(run, FAIL, "`fetch-depth: 1` is red");
  check("and the `ok` line about the push CI is not printed", !saidOk(run, OK), run.out);
});
// Red: the setting deleted. This file's own comments discuss `fetch-depth: 1` at
// length, so a whole-file `includes` pin would have been green here.
withDepth("", (run) => expectRed(run, FAIL, "the fetch-depth line deleted is red"));
// Red: commented out. `#` is not whitespace — that is why the pin is anchored.
withDepth("          # fetch-depth: 0\n", (run) => expectRed(run, FAIL, "a commented-out `fetch-depth: 0` is red"));

// Green: the same setting with trailing whitespace, which YAML ignores.
withDepth("          fetch-depth: 0  \n", (run) => {
  expectGreen(run, "`fetch-depth: 0` with trailing spaces stays green");
  check("trailing spaces: still ok about the push CI", saidOk(run, OK), run.out);
});

done();
