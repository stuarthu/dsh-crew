// T-51, DoD item 8: the shell check REPORTS itself — one `ok` line that prints
// the three role keys it just judged.
//
// What it proves: a reader of one run can tell "it passed" from "it never got
// there". Before this job the block only ever failed (it had no `ok()` at all),
// so a silent output was the same whether the check ran or was skipped. The line
// has to carry the names, because that is what makes a FOURTH role that needs a
// shell visible as missing — the price ADR 0010 accepted out loud.

import { check, done, tempRepo, runCheck, cleanUp, okLines, expectGreen } from "../lib/qa.mjs";

const dir = tempRepo();
try {
  const run = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(run, "the copy is green");

  const line = okLines(run).find((each) => each.includes("keep the shell they work with"));
  check("the run prints one ok line for the shell check", line !== undefined, run.out);

  if (line !== undefined) {
    for (const key of ["engineer", "test_engineer", "code_engineer"]) {
      check(`that ok line names ${key}`, line.includes(key), line);
    }
    // `crew_qa` is deliberately NOT judged by this check (the job that widened it
    // was not allowed to touch anything about QA), so the line must not claim it.
    // The hole this leaves is recorded in docs/qa/gaps.md — see case-12.
    check("and it does not claim to cover qa", !/\bqa\b/.test(line), line);
  }
} finally {
  cleanUp(dir);
}

done();
