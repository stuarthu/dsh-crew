// T-42, DoD item 5c (6 of 6): the gate reads `## T-<number>` sections and
// nothing else. The task table is a document ABOUT the Verdicts line — it has an
// appendix explaining the shape, fenced examples, and prose that uses the words
// `not run` and `skipped` — so a gate that read those would red a correct file
// on its own documentation.
//
// The assertion is the strongest one available here: the whole output, byte for
// byte, must be what the untouched copy printed. Not "still green" — identical,
// including the totals line. A gate that quietly counted an appendix line would
// still be green and would have moved the numbers.

import { check, done, tempRepo, runCheck, cleanUp, copyFile, put, editFirstVerdicts, expectGreen, TASKS_MD } from "../lib/qa.mjs";

let baseline;
const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-tasks.mjs");
  expectGreen(base, "the untouched copy is green");
  baseline = base.out;
} finally {
  cleanUp(dir);
}

/** Apply a mutation and require the output to be identical to the baseline. */
const unchanged = (what, mutate) => {
  const copy = tempRepo();
  try {
    mutate(copy);
    const run = runCheck(copy, "tools/verify-tasks.mjs");
    check(
      what,
      run.status === 0 && run.out === baseline,
      `exit ${run.status}\n      --- got:\n      ${run.out.trim().split("\n").join("\n      ")}\n      --- expected:\n      ${baseline.trim().split("\n").join("\n      ")}`,
    );
  } finally {
    cleanUp(copy);
  }
};

const append = (dir, text) => put(dir, TASKS_MD, `${copyFile(dir, TASKS_MD)}\n${text}\n`);

// A blatantly illegal Verdicts line under an ordinary `## ` heading: no task id
// in the heading, so there is no task section for it to belong to.
unchanged("a fake Verdicts line under a non-task `## ` heading changes nothing", (copy) => append(copy, `## 附录：这一行怎么读

- **Verdicts**：code: 也许吧
`));

// A Verdicts line after a late `# ` heading. The appendix parts of this file are
// level-1 headings, so a line under one of them belongs to no task — not to the
// last task section above it.
unchanged("a Verdicts line after a late `# ` heading belongs to no task", (copy) => append(copy, `# 附录

- **Verdicts**：security: not run
`));

// The words in prose. This file explains the rule at length, so the words appear
// outside any Verdicts line — and they must not be counted.
unchanged("`not run` and `skipped` in prose change nothing", (copy) => append(copy, `## 附录：措辞

这一段里出现 not run、skipped、changes needed 这些词，但它们不是 Verdicts 行。
`));

// A fenced example INSIDE a real task section. Without the fence rule the
// `## T-99` heading would open a section of its own, and its illegal Verdicts
// line would be read as that section's record.
unchanged("a fenced `## T-99` example inside a task section is an example, not a section", (copy) => {
  editFirstVerdicts(copy, (line) => `${line}

\`\`\`markdown
## T-99 — 一个例子

- **Verdicts**：code: not run
\`\`\`
`);
});

done();
