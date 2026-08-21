// T-42, DoD item 2 (breakage 2 of 4): test.yml no longer triggered by a push, so
// an ordinary push runs no CI. The pin accepts all three legal spellings of
// `on:`, so the greens below matter as much as the reds: a pin that reds
// `on: [push, workflow_dispatch]` would be edited away the first time somebody
// added a second trigger.

import { check, done, tempRepo, runCheck, cleanUp, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const OK = ".github/workflows/test.yml runs npm test on a push, with full history";
const FAIL = ".github/workflows/test.yml is not triggered by a push";
const TEST_YML = ".github/workflows/test.yml";

/** A fresh copy each time: the mutations below are alternatives, not a sequence. */
const withTrigger = (line, assert) => {
  const dir = tempRepo();
  try {
    edit(dir, TEST_YML, "\non: push\n", `\n${line}\n`);
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

// Red: a trigger that is not a push at all.
withTrigger("on: workflow_dispatch", (run) => {
  expectRed(run, FAIL, "`on: workflow_dispatch` instead of a push is red");
  check("and the `ok` line about the push CI is not printed", !saidOk(run, OK), run.out);
});
// Red: the trigger is gone and only a comment quotes it. `#` is not whitespace,
// which is the whole reason this pin is line-anchored.
withTrigger("# on: push", (run) => expectRed(run, FAIL, "a commented-out `on: push` is red"));
// Red: a push filter under `pull_request:` is not a push trigger.
withTrigger("on:\n  pull_request:\n    branches: [main]", (run) => expectRed(run, FAIL, "`pull_request` only is red"));

// Green: the two other legal spellings, and a second trigger beside the push.
withTrigger("on: [push, workflow_dispatch]", (run) => {
  expectGreen(run, "the inline list form `on: [push, workflow_dispatch]` stays green");
  check("list form: still ok about the push CI", saidOk(run, OK), run.out);
});
withTrigger("on:\n  push:\n  workflow_dispatch:", (run) => {
  expectGreen(run, "the block form `on:` / `  push:` stays green");
  check("block form: still ok about the push CI", saidOk(run, OK), run.out);
});

done();
