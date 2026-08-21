// T-42, DoD item 5c (5 of 6): `changes needed` that names no task id. T-40's own
// DoD added this one — the CRD's list stops at three — because a finding with no
// owner is only half a record: somebody has to carry the fix, and the task table
// is where that is written down.

import { check, done, tempRepo, runCheck, cleanUp, editFirstVerdicts, expectRed, expectGreen, failLines } from "../lib/qa.mjs";

const NO_OWNER = "names no task id, so the fix has no owner";
const line = (values) => `- **Verdicts**：${values.join(" ｜ ")}`;

const withLine = (values, assert) => {
  const dir = tempRepo();
  try {
    const { id } = editFirstVerdicts(dir, () => line(values));
    assert(runCheck(dir, "tools/verify-tasks.mjs"), id);
  } finally {
    cleanUp(dir);
  }
};

// Red: `changes needed` with no task id, on each of the four keys.
for (const key of ["code", "security", "qa", "doc"]) {
  const values = ["code", "security", "qa", "doc"].map((name) => `${name}: ${name === key ? "changes needed" : "pass"}`);
  withLine(values, (run, id) => {
    expectRed(run, NO_OWNER, `\`${key}: changes needed\` with no task id is red`);
    check(`and the FAIL names the key and the section (${id})`,
      failLines(run).some((text) => text.includes(`\`${key}: changes needed\``) && text.includes(`"${id}"`)), run.out);
  });
}
// Red: a sentence of findings with no task number anywhere in it.
withLine(["code: changes needed — 两处阻塞", "security: pass", "qa: pass", "doc: pass"], (run) => {
  expectRed(run, NO_OWNER, "`changes needed` with a reason but no task id is red");
});

// Green: the task id present, in the shapes a PM really writes.
withLine(["code: changes needed — T-99 接手", "security: pass", "qa: pass", "doc: pass"], (run) => {
  expectGreen(run, "`changes needed — T-99 接手` is green");
});
withLine(["code: changes needed（T-99）", "security: pass", "qa: pass", "doc: pass"], (run) => {
  expectGreen(run, "`changes needed（T-99）` is green: the id may come without a dash");
});
// Green: `pass` needs no task id, and neither does a reasoned skip.
withLine(["code: pass", "security: not run — 无代码改动", "qa: pass", "doc: pass"], (run) => {
  expectGreen(run, "only `changes needed` needs a task id, not every value");
});
done();
