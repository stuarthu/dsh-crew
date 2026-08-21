// T-42, DoD item 5c (3 of 6): `not run` and `skipped` need a reason of their own
// (CRD 0011, fail condition 3). A skip is allowed; a SILENT skip is not — that
// is the whole rule the user chose. It guards honesty and visibility, never "the
// review must happen".

import { check, done, tempRepo, runCheck, cleanUp, editFirstVerdicts, expectRed, expectGreen, failLines } from "../lib/qa.mjs";

const NO_REASON = "carries no reason of its own";
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

// Red: a bare skip word, for each of the two words and on each of the four keys.
for (const word of ["not run", "skipped"]) {
  for (const key of ["code", "security", "qa", "doc"]) {
    const values = ["code", "security", "qa", "doc"].map((name) => `${name}: ${name === key ? word : "pass"}`);
    withLine(values, (run, id) => {
      expectRed(run, NO_REASON, `a bare \`${key}: ${word}\` is red`);
      check(`and the FAIL names the key and the section (${id})`, failLines(run).some((text) => text.includes(`\`${key}: ${word}\``) && text.includes(`"${id}"`)), run.out);
    });
  }
}

// Red: a reason that is only a parenthetical at the END of the line. That was the
// real shape of this job's record — a note about code review and doc review, on a
// line whose `security: not run` and `qa: not run` it never mentioned — and it
// cannot say which value it covers.
withLine(["code: not run", "security: not run", "qa: pass", "doc: pass（评审都跳过了，时间紧）"], (run) => {
  expectRed(run, NO_REASON, "a trailing parenthetical is not a reason for a `not run`");
});

// Green: a reason after the dash, in each of the three dashes people really type.
for (const [dash, name] of [["—", "em dash"], ["–", "en dash"], ["-", "hyphen"]]) {
  withLine([`code: not run ${dash} 任务未开工`, "security: pass", "qa: pass", "doc: pass"], (run) => {
    expectGreen(run, `\`not run ${dash} <why>\` is green (${name})`);
  });
}
// Green: `pass` and `changes needed` with a task id need no dash at all.
withLine(["code: pass", "security: pass", "qa: pass", "doc: pass"], (run) => expectGreen(run, "four passes need no reasons"));
done();
