// T-42, DoD item 5 (part 1): step 10's finish gate in roles/pm.md — "A task is
// finished when code review passes, security review passes or was skipped for a
// stated reason, and QA says pass".
//
// This is the rule the crew actually broke: about twenty tasks of this job were
// called done with no code review at all, and nothing in the system noticed —
// the user had to ask. The sentence carries no path and no command, so the pin
// is prose and brittle on purpose (ADR 0004, ADR 0007): a legitimate reword
// edits the prompt and the pinned string in the same commit.

import { check, done, tempRepo, runCheck, cleanUp, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const GATE = "A task is finished when code review passes";
const FAIL = "PM section is missing `A task is finished when code review passes`";
const REGISTERED = "PM prompt section registered";

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green (so the red below is the mutation)");
  check(`the copy says: ok ${REGISTERED}`, saidOk(base, REGISTERED), base.out);
} finally {
  cleanUp(dir);
}

// Red: the sentence reworded. Nothing else about step 10 changes, so this is the
// smallest edit that loses the gate.
const reworded = tempRepo();
try {
  edit(reworded, "roles/pm.md", GATE, "A task is done when code review passes");
  const run = runCheck(reworded, "tools/verify-mount.mjs");
  expectRed(run, FAIL, "the finish gate reworded is red");
  check("and the PM prompt section is not reported as registered", !saidOk(run, REGISTERED), run.out);
} finally {
  cleanUp(reworded);
}

// Red: the whole sentence deleted.
const deleted = tempRepo();
try {
  edit(deleted, "roles/pm.md", GATE, "");
  expectRed(runCheck(deleted, "tools/verify-mount.mjs"), FAIL, "the finish gate deleted is red");
} finally {
  cleanUp(deleted);
}

done();
