// T-42, DoD item 5c (1 of 6): one Verdicts line per task section (CRD 0011,
// fail condition 1). None, and nothing records whether the four reviews ran;
// two, and no reader can tell which one counts.
//
// Why the gate exists at all: this crew called about twenty tasks done with no
// code review, the record said nothing, and it came out only because the user
// asked.

import { check, done, tempRepo, runCheck, cleanUp, editFirstVerdicts, expectRed, expectGreen, saidOk, failLines } from "../lib/qa.mjs";

const ALL_GOOD = "every task section carries one Verdicts line, all four values";

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-tasks.mjs");
  expectGreen(base, "the untouched copy is green (so a red below is the mutation)");
  check(`the copy says: ok ${ALL_GOOD}`, saidOk(base, ALL_GOOD), base.out);
} finally {
  cleanUp(dir);
}

// Red: the line deleted.
const dropped = tempRepo();
try {
  const { id } = editFirstVerdicts(dropped, () => null);
  const run = runCheck(dropped, "tools/verify-tasks.mjs");
  expectRed(run, "has no `- **Verdicts**：` line", "a task section with no Verdicts line is red");
  check(`and the FAIL names the section (${id})`, failLines(run).some((line) => line.includes(`"${id}"`)), run.out);
  check("and the FAIL names the line number", failLines(run).some((line) => /\(line \d+\)/.test(line)), run.out);
  check(`and no \`ok\` line claims every section carries one`, !saidOk(run, ALL_GOOD), run.out);
} finally {
  cleanUp(dropped);
}

// Red: two lines in one section. Both are well-formed, so only the count is
// wrong — and a reader cannot tell which one is the record.
const doubled = tempRepo();
try {
  const { id } = editFirstVerdicts(doubled, (line) => `${line}\n${line}`);
  const run = runCheck(doubled, "tools/verify-tasks.mjs");
  expectRed(run, "Verdicts lines, so no reader can tell which one counts", "two Verdicts lines in one section is red");
  check(`and the FAIL names the section (${id})`, failLines(run).some((line) => line.includes(`"${id}"`)), run.out);
} finally {
  cleanUp(doubled);
}
done();
