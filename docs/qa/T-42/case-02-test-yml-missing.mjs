// T-42, DoD item 2 (breakage 1 of 4): `.github/workflows/test.yml` deleted, and
// the CRD 0009 pin must go red — otherwise the repository has no CI on a push
// and every check stays green about it.

import { check, done, tempRepo, runCheck, cleanUp, drop, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const OK = ".github/workflows/test.yml runs npm test on a push, with full history";
const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green (so the red below is the mutation)");
  check(`the copy says: ok ${OK}`, saidOk(base, OK), base.out);

  drop(dir, ".github/workflows/test.yml");
  const run = runCheck(dir, "tools/verify-mount.mjs");
  expectRed(run, ".github/workflows/test.yml is missing", "test.yml deleted is red");
  check("and the `ok` line about the push CI is not printed", !saidOk(run, OK), run.out);
  // The release pin reads the same folder. It must go on working with one file
  // fewer, and must not be dragged down by test.yml's absence: publish.yml is
  // still there and still correct.
  check(
    "the release pin still reports on the folder it can still read",
    saidOk(run, "workflow files under .github/workflows/ carry a live `npm publish`"),
    run.out,
  );
} finally {
  cleanUp(dir);
}
done();
