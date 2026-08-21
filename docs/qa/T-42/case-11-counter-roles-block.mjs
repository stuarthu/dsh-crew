// T-42, DoD item 4 (local counter 3 of 3): the `ok` line about every role being
// denied all delegation tools — the one that says the crew stays flat. Same
// outside-in shape as cases 09 and 10.

import { check, done, tempRepo, runCheck, cleanUp, edit, editJson, expectGreen, expectRed, saidOk } from "../lib/qa.mjs";

const MINE = "every role is denied all delegation tools (the crew stays flat)";
const PRESET = "crew preset loads the roles, keeps subagent-control, and re-opens no other way to start an agent";
const EXPORTS = "every module the patch loads is exported from package.json";

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
  check("the role-table `ok` line still prints after an unrelated failure", saidOk(run, MINE), run.out);
  check("so do the other two counted `ok` lines", saidOk(run, PRESET) && saidOk(run, EXPORTS), run.out);
} finally {
  cleanUp(dir);
}

// A failure INSIDE the role block: one crew tool dropped from every deny list,
// so a role could start its own role and the crew would stop being flat.
const own = tempRepo();
try {
  edit(own, "host/roles.js", "const NO_DELEGATION = [...ROLE_TOOL_NAMES];",
    'const NO_DELEGATION = ROLE_TOOL_NAMES.filter((name) => name !== "crew_qa");');
  const run = runCheck(own, "tools/verify-mount.mjs");
  expectRed(run, 'deny list is missing "crew_qa"', "a breakage inside the role block is red");
  check("and the role-table `ok` line is gone (it is a counter, not an unconditional print)", !saidOk(run, MINE), run.out);
  check("while the other two counted `ok` lines still print", saidOk(run, PRESET) && saidOk(run, EXPORTS), run.out);
} finally {
  cleanUp(own);
}

done();
