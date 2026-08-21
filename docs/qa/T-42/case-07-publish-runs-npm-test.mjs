// T-42, DoD item 3 (T-41's pins, part 2 of 3): a publishing workflow must really
// run `npm test`. CRD 0009 pinned the push CI and left the release workflow with
// no pin at all, so deleting `run: npm test` there was a change nothing noticed
// — and the next tag would have published untested code.

import { check, done, tempRepo, runCheck, cleanUp, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const OK = "workflow files under .github/workflows/ carry a live `npm publish`";
const NO_TEST = "publishes and never runs `npm test`";
const PUBLISH_YML = ".github/workflows/publish.yml";
const STEP = "      - name: Run checks\n        run: npm test\n";

const withStep = (replacement, assert) => {
  const dir = tempRepo();
  try {
    edit(dir, PUBLISH_YML, STEP, replacement);
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

// Red: the step deleted outright.
withStep("", (run) => {
  expectRed(run, NO_TEST, "the `npm test` step deleted from the publisher is red");
  check("and no `ok` line claims the folder gates on npm test", !saidOk(run, OK), run.out);
});
// Red: the step gone, a comment quoting it left behind.
withStep("      # run: npm test\n", (run) => expectRed(run, NO_TEST, "only a commented `# run: npm test` is red"));
// Red: `npm test` as a word inside an echo.
withStep('      - name: Run checks\n        run: echo "npm test"\n', (run) => expectRed(run, NO_TEST, "`echo \"npm test\"` in the publisher is red"));
// Red: a bare list item, with no `run:` key.
withStep("      - npm test\n", (run) => expectRed(run, NO_TEST, "a bare `- npm test` list item is red"));

// Green: the spellings that really run it.
withStep("      - name: Run checks\n        run: |\n          npm test\n", (run) => {
  expectGreen(run, "a `run: |` block body line stays green");
  check(`run block: still ok ${OK}`, saidOk(run, OK), run.out);
});
withStep("      - run: npm test\n", (run) => expectGreen(run, "the one-liner list form `- run: npm test` stays green"));
withStep("      - name: Run checks\n        run: npm test --silent\n", (run) => expectGreen(run, "`npm test --silent` stays green"));

done();
