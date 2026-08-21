// T-51, DoD item 4: every deny list really blocks the two new crew tool names,
// and the check that says so goes red when one of them slips out.
//
// What it proves: the flat rule (CLAUDE.md design rule 1) covers the two new
// names, and the pin that guards it names the missing name out loud. The
// mutation is an `.filter()` exception on NO_DELEGATION rather than a deleted
// line, because that is what the real accident looks like: somebody wants one
// role to be able to call one new role and edits the shared list to make room.
// (docs/qa/T-42/case-11 mutates the same line for `crew_qa`; the input is
// dictated by this DoD row's own verification column — see `docs/qa/gaps.md`
// item 3 on overlapping inputs.)

import { check, done, tempRepo, runCheck, cleanUp, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const FLAT = "every role is denied all delegation tools (the crew stays flat)";
const LINE = "const NO_DELEGATION = [...ROLE_TOOL_NAMES];";

const base = tempRepo();
try {
  const run = runCheck(base, "tools/verify-mount.mjs");
  expectGreen(run, "the untouched copy is green (so every red below is the mutation)");
  check(`the copy says: ok ${FLAT}`, saidOk(run, FLAT), run.out);
} finally {
  cleanUp(base);
}

for (const name of ["crew_test_engineer", "crew_code_engineer"]) {
  const dir = tempRepo();
  try {
    edit(dir, "host/roles.js", LINE, `const NO_DELEGATION = ROLE_TOOL_NAMES.filter((each) => each !== ${JSON.stringify(name)});`);
    const run = runCheck(dir, "tools/verify-mount.mjs");
    expectRed(run, `deny list is missing "${name}"`, `dropping ${name} from every deny list is red, and the message names it`);
    check(`and the flat-crew ok line is gone when ${name} is missing`, !saidOk(run, FLAT), run.out);
  } finally {
    cleanUp(dir);
  }
}

done();
