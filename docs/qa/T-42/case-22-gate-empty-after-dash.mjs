// T-42, DoD item 5c (4 of 6): a dash with nothing after it. This is the near
// miss of case-21: the line LOOKS like it carries a reason — it has the dash the
// rule asks for — and says nothing at all. Its own message, so the writer is not
// told to add a dash they already typed.

import { check, done, tempRepo, runCheck, cleanUp, editFirstVerdicts, expectRed, expectGreen, failLines } from "../lib/qa.mjs";

const EMPTY_DASH = "has a dash with nothing after it";
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

// Red: the dash and nothing else, for both skip words.
for (const word of ["not run", "skipped"]) {
  withLine([`code: ${word} —`, "security: pass", "qa: pass", "doc: pass"], (run, id) => {
    expectRed(run, EMPTY_DASH, `\`code: ${word} —\` with nothing after the dash is red`);
    check(`and the message is the empty-dash one, not the missing-reason one (${id})`,
      !failLines(run).some((text) => text.includes(NO_REASON)), run.out);
  });
}
// Red: a dash followed by whitespace only, and a doubled dash.
withLine(["code: not run —   ", "security: pass", "qa: pass", "doc: pass"], (run) => {
  expectRed(run, EMPTY_DASH, "a dash followed by spaces only is red");
});
withLine(["code: not run --", "security: pass", "qa: pass", "doc: pass"], (run) => {
  expectRed(run, EMPTY_DASH, "a doubled dash with nothing after it is red");
});

// Green: one character after the dash is a reason. The gate does not judge how
// good a reason is — no automated check can — so the boundary is exactly "some
// text".
withLine(["code: not run — 无", "security: pass", "qa: pass", "doc: pass"], (run) => {
  expectGreen(run, "a single word after the dash is green (the gate does not judge the reason)");
});
done();
