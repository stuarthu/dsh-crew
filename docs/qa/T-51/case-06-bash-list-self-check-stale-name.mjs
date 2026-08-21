// T-51, DoD item 7: the shell list checks ITSELF — every key it names must be a
// key in `ROLES`, and a name that is not there turns the run red and says the
// LIST is what went stale.
//
// What it proves: the one real weakness of an explicit list (ADR 0010) is
// covered. Without this self-check, renaming a role would leave the list naming
// nobody: the loop would find no role, judge nothing, and still print its green
// line — "a green with nothing found is the worst outcome". The mutation is a
// typo in the list, which is exactly what a rename leaves behind.

import { check, done, tempRepo, runCheck, cleanUp, copyFile, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const SHELL_OK = "these roles keep the shell they work with";
const LIST = 'const NEEDS_SHELL = ["engineer", "test_engineer", "code_engineer"];';

const base = tempRepo();
try {
  const run = runCheck(base, "tools/verify-mount.mjs");
  expectGreen(run, "the untouched copy is green (so the red below is the mutation)");
  // The list's exact text is the mutation anchor below. Asserted here as well, so
  // a list that moved is reported as this failing check rather than as a thrown
  // "anchor not found" further down.
  check(
    "the shell list is still one explicit list of three role keys",
    copyFile(base, "tools/verify-mount.mjs").includes(LIST),
    `tools/verify-mount.mjs no longer holds: ${LIST}`,
  );
} finally {
  cleanUp(base);
}

// A name in the list that no role carries. The message must blame the list, not
// the role table: the reader's next move is completely different for the two.
const stale = tempRepo();
try {
  edit(stale, "tools/verify-mount.mjs", LIST, 'const NEEDS_SHELL = ["engineer", "test_engineer", "cod_engineer"];');
  const run = runCheck(stale, "tools/verify-mount.mjs");
  expectRed(run, '"cod_engineer", which is not in ROLES', "a name in the list that no role carries is red");
  expectRed(run, "The LIST is stale, not the role table", "and the message says which of the two to go and fix");
  check("and the shell ok line is gone (the check does not report a pass on a role it never found)", !saidOk(run, SHELL_OK), run.out);
} finally {
  cleanUp(stale);
}

// The other half of the same story: a role RENAMED in the role table, with the
// list left alone. Same red, and it still points at the list — which is right,
// because the list is the thing the reader has to bring back in step with the
// table.
const renamed = tempRepo();
try {
  edit(renamed, "host/roles.js", 'key: "code_engineer"', 'key: "coder"');
  const run = runCheck(renamed, "tools/verify-mount.mjs");
  expectRed(run, '"code_engineer", which is not in ROLES', "renaming the role and leaving the list alone is red too");
  check("and the shell ok line is gone", !saidOk(run, SHELL_OK), run.out);
  // The message hands the reader the keys that DO exist, so the fix does not
  // need a second run to find the new name.
  check("the message lists the keys ROLES holds today", run.out.includes("Keys in ROLES today:") && run.out.includes("coder"), run.out);
} finally {
  cleanUp(renamed);
}

done();
