// T-42, DoD item 2 (breakage 3 of 4): test.yml stops running `npm test`, so the
// push CI proves nothing. `npm test` has to BE the command — the reds below are
// the three ways it can look present and not be, and the greens are the three
// legal spellings a correct file may use.

import { check, done, tempRepo, runCheck, cleanUp, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const OK = ".github/workflows/test.yml runs npm test on a push, with full history";
const FAIL = ".github/workflows/test.yml never runs `npm test`";
const TEST_YML = ".github/workflows/test.yml";
const STEP = "      - name: Run checks\n        run: npm test\n";

const withStep = (replacement, assert) => {
  const dir = tempRepo();
  try {
    edit(dir, TEST_YML, STEP, replacement);
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

// Red: the step is gone and a comment quotes it — the hole T-37 found.
withStep("      # run: npm test\n", (run) => {
  expectRed(run, FAIL, "only a commented `# run: npm test` is red");
  check("and the `ok` line about the push CI is not printed", !saidOk(run, OK), run.out);
});
// Red: `npm test` as a word inside somebody's echo is not running the tests.
withStep('      - name: Run checks\n        run: echo "npm test"\n', (run) => expectRed(run, FAIL, "`echo \"npm test\"` is red"));
// Red: a bare list item under some action's `with:` is not a command either.
withStep("      - npm test\n", (run) => expectRed(run, FAIL, "a bare `- npm test` list item is red"));

// Green: the three spellings that really do run it.
withStep("      - run: npm test\n", (run) => {
  expectGreen(run, "the one-liner list form `- run: npm test` stays green");
  check("one-liner: still ok about the push CI", saidOk(run, OK), run.out);
});
withStep("      - name: Run checks\n        run: |\n          npm test\n", (run) => {
  expectGreen(run, "a `run: |` block body line stays green");
  check("run block: still ok about the push CI", saidOk(run, OK), run.out);
});
withStep("      - name: Run checks\n        run: npm test --silent\n", (run) => {
  expectGreen(run, "`npm test --silent` stays green (flags are not a different command)");
});

done();
