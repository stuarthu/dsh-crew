// T-42, DoD item 5c (2 of 6): all four values, or the line says nothing about
// the review it left out (CRD 0011, fail condition 2). The four are code,
// security, qa and doc.

import { check, done, tempRepo, runCheck, cleanUp, editFirstVerdicts, expectRed, expectGreen, failLines } from "../lib/qa.mjs";

const line = (values) => `- **Verdicts**：${values.join(" ｜ ")}`;

/** One crafted Verdicts line on the first task section of a fresh copy. */
const withLine = (values, assert) => {
  const dir = tempRepo();
  try {
    const { id } = editFirstVerdicts(dir, () => line(values));
    assert(runCheck(dir, "tools/verify-tasks.mjs"), id);
  } finally {
    cleanUp(dir);
  }
};

// Green first, so a red below is the missing value and not the crafted shape.
withLine(["code: pass", "security: pass", "qa: pass", "doc: pass"], (run) => {
  expectGreen(run, "four bare `pass` values are green (a pass needs no reason)");
});

// Red: each of the four, left out on its own.
for (const missing of ["code", "security", "qa", "doc"]) {
  const values = ["code: pass", "security: pass", "qa: pass", "doc: pass"].filter((value) => !value.startsWith(`${missing}:`));
  withLine(values, (run, id) => {
    expectRed(run, `Verdicts line has no \`${missing}\` value`, `a Verdicts line without its \`${missing}\` value is red`);
    check(`and the FAIL names the section (${id})`, failLines(run).some((text) => text.includes(`"${id}"`)), run.out);
  });
}

// Red: all four names gone, one shapeless sentence left. Two values are named as
// missing in one message, so the reader is not sent round the loop four times.
withLine(["reviewed, all fine"], (run) => {
  expectRed(run, "Verdicts line has no `code`", "a Verdicts line with no named values at all is red");
  check("and the message lists every missing value at once", failLines(run).some((text) => text.includes("`code`, `security`, `qa`, `doc`")), run.out);
});

// Green: a trailing parenthetical after the four values is not a fifth value.
withLine(["code: pass", "security: pass", "qa: pass", "doc: pass（同一次评审）"], (run) => {
  expectGreen(run, "a trailing parenthetical is not read as a value");
});
done();
