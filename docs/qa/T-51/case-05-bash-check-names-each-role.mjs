// T-51, DoD item 6 (and PRD M1 DoD item 2): the shell check judges the three
// engineer roles ONE BY ONE, and its failure says which one lost `bash`.
//
// What it proves: taking `bash` from any of `engineer`, `test_engineer` or
// `code_engineer` turns the run red — three separate mutations, because a check
// written as one combined condition would go red for the first role and cover
// the other two by accident. The message must name the role: a red that says
// "somebody needs bash" sends the reader through the whole role table.
//
// The mutation adds `"bash"` to the deny list of one entry, found by its key in
// the source, so this case does not depend on the wording of any comment.

import { check, done, tempRepo, runCheck, cleanUp, copyFile, put, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const SHELL_OK = "these roles keep the shell they work with";
const DENY = "deny: [...NO_DELEGATION],";

/**
 * Add `"bash"` to the deny list of one ROLES entry inside a copy.
 * Structural, not prose: find the entry by `key: "<key>"`, then the first deny
 * line after it. Throws when either anchor moved, so a case can never report a
 * pass on a copy it failed to break.
 */
function denyBash(dir, key) {
  const text = copyFile(dir, "host/roles.js");
  const at = text.indexOf(`key: "${key}"`);
  if (at === -1) throw new Error(`host/roles.js has no entry with key "${key}" — the role table's shape moved`);
  const denyAt = text.indexOf(DENY, at);
  if (denyAt === -1) throw new Error(`the "${key}" entry has no ${DENY} line to break`);
  put(dir, "host/roles.js", `${text.slice(0, denyAt)}deny: [...NO_DELEGATION, "bash"],${text.slice(denyAt + DENY.length)}`);
}

const base = tempRepo();
try {
  const run = runCheck(base, "tools/verify-mount.mjs");
  expectGreen(run, "the untouched copy is green (so every red below is the mutation)");
  check(`the copy says: ok ${SHELL_OK}`, saidOk(run, SHELL_OK), run.out);
} finally {
  cleanUp(base);
}

for (const [key, toolName] of [["engineer", "crew_engineer"], ["test_engineer", "crew_test_engineer"], ["code_engineer", "crew_code_engineer"]]) {
  const dir = tempRepo();
  try {
    denyBash(dir, key);
    const run = runCheck(dir, "tools/verify-mount.mjs");
    expectRed(run, `${toolName} must keep bash`, `denying bash to ${key} is red, and the message names that role`);
    // Exactly one role is named, so the message points at the role that lost the
    // shell and not at all three.
    const named = run.out.split("\n").filter((line) => line.startsWith("FAIL") && line.includes("must keep bash"));
    check(`only ${toolName} is named (${named.length} such FAIL line)`, named.length === 1, named.join("\n      "));
    check(`and the shell ok line is gone while ${key} has no shell`, !saidOk(run, SHELL_OK), run.out);
  } finally {
    cleanUp(dir);
  }
}

done();
