// T-42, DoD item 4 (local counter 2 of 3): the `ok` line about package.json
// "exports". Same shape as case-09, and for the same reason: checked from the
// outside, by running the real script over a copy, never by pinning the source
// text of the counter.

import { check, done, tempRepo, runCheck, cleanUp, editJson, expectGreen, expectRed, saidOk } from "../lib/qa.mjs";

const MINE = "every module the patch loads is exported from package.json";
const PRESET = "crew preset loads the roles, keeps subagent-control, and re-opens no other way to start an agent";
const ROLES = "every role is denied all delegation tools (the crew stays flat)";

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green");
  check(`the copy says: ok ${MINE}`, saidOk(base, MINE), base.out);

  editJson(dir, "package.json", (manifest) => {
    manifest.files = manifest.files.filter((entry) => entry !== "host");
  });
  const run = runCheck(dir, "tools/verify-mount.mjs");
  expectRed(run, 'package.json "files" is missing "host"', "the unrelated breakage really is red");
  check("the exports `ok` line still prints after an unrelated failure", saidOk(run, MINE), run.out);
  check("so do the other two counted `ok` lines", saidOk(run, PRESET) && saidOk(run, ROLES), run.out);
} finally {
  cleanUp(dir);
}

// A failure INSIDE the exports block: cordis.patch.yml loads host/git-guard.js,
// so dropping its "exports" entry means dsh could not resolve the module.
const own = tempRepo();
try {
  editJson(own, "package.json", (manifest) => { delete manifest.exports["./host/git-guard.js"]; });
  const run = runCheck(own, "tools/verify-mount.mjs");
  expectRed(run, 'package.json "exports" does not expose it', "a breakage inside the exports block is red");
  check("and the exports `ok` line is gone (it is a counter, not an unconditional print)", !saidOk(run, MINE), run.out);
  check("while the other two counted `ok` lines still print", saidOk(run, PRESET) && saidOk(run, ROLES), run.out);
} finally {
  cleanUp(own);
}

done();
