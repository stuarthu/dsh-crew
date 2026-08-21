// T-42, DoD item 4 (local counter 1 of 3): the preset block's `ok` line.
//
// Verified FROM THE OUTSIDE, which is the whole point. The counter cannot be
// checked by pinning the source text of tools/verify-mount.mjs — that proves a
// string, not a behaviour. So this case breaks an UNRELATED check, runs the real
// script, and asserts the `ok` line is still printed. With the old global
// counter (`if (failures === 0)`) one unrelated failure earlier in the run made
// this line print neither `ok` nor `FAIL`: it vanished, and a reader could not
// tell a check that passed from a check that never ran.
//
// The second half proves it is still a COUNTER and not an unconditional print:
// break something inside the preset block and this one line must disappear
// while the other two counted `ok` lines stay.

import { check, done, tempRepo, runCheck, cleanUp, edit, editJson, expectGreen, expectRed, saidOk } from "../lib/qa.mjs";

const MINE = "crew preset loads the roles, keeps subagent-control, and re-opens no other way to start an agent";
const EXPORTS = "every module the patch loads is exported from package.json";
const ROLES = "every role is denied all delegation tools (the crew stays flat)";

// An unrelated failure, raised before all three blocks: one entry taken out of
// package.json "files". It has nothing to do with the preset, the exports or the
// role table.
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
  check("the preset `ok` line still prints after an unrelated failure", saidOk(run, MINE), run.out);
  check("so do the other two counted `ok` lines", saidOk(run, EXPORTS) && saidOk(run, ROLES), run.out);
} finally {
  cleanUp(dir);
}

// A failure INSIDE the preset block: the preset stops loading the role module,
// so the crew preset would have no role tools at all.
const own = tempRepo();
try {
  edit(own, "preset/crew/agent.cordis.yml", "'dsh-crew/host/roles-preset.js'", "'dsh-crew/host/nothing-of-the-sort.js'");
  const run = runCheck(own, "tools/verify-mount.mjs");
  expectRed(run, "the crew preset does not load dsh-crew/host/roles-preset.js", "a breakage inside the preset block is red");
  check("and the preset `ok` line is gone (it is a counter, not an unconditional print)", !saidOk(run, MINE), run.out);
  check("while the other two counted `ok` lines still print", saidOk(run, EXPORTS) && saidOk(run, ROLES), run.out);
} finally {
  cleanUp(own);
}

done();
