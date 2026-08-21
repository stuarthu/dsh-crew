// T-56 DoD item 7 and T-62 DoD item 11: both passages were written INSIDE the
// existing numbered steps. Neither opened a new top-level section.
//
// What it proves: the shape of the PM prompt did not drift. The PRD's risk table
// flagged this: `roles/pm.md` is the longest prompt in the package, its steps are
// cited by number from other files and from QA cases, and a new `## ` section
// between steps would push readers — and pointers — out of alignment.
//
// The count is 14 today, and it was 13 until T-63. Both of the tasks this case was
// written for kept it at 13: T-56 and T-62 each wrote their passage inside an
// existing step, which is what their own DoD items asked for, and that still holds.
//
// T-63 raised it to 13 + 1 by adding ONE new top-level section, `## What you may
// write`, which today sits between `## Never guess` and `## Documents are the only
// channel`. That is a decision, not drift, and three documents carry it:
//
//   * `docs/design/tasks.md`, T-63 DoD item 4, fixes the heading as an exact English
//     string — `## What you may write` — and item 8 requires `roles/pm.md` to grow
//     that section, holding the PM's own writable set plus the word-for-word copies
//     of rule A (text inside a tool result) and rule B (documents that judge you).
//   * `principles.md`, the `## Wording every role prompt copies word for word`
//     section: "Every role prompt carries a section headed `## What you may write`."
//     All ten role prompts get the same heading, so the shape is uniform and
//     greppable — which is exactly why it is a section and not a paragraph buried
//     inside one.
//   * `docs/decisions/adr/0018-red-existing-cases.md` picks who edits a deliberately
//     brittle assertion like this one, and when: QA, named for that one edit, in the
//     same commit as the task that changed the file. Nobody else touches `docs/qa/`,
//     and the assertion is renumbered to the new true count — never widened.
//
// T-63 DoD item 14 also requires `bash docs/qa/T-56/run.sh` to be green, so the
// number below and the file it counts are pinned to each other by the document.
//
// PINNING STYLE: LINE-BASED. A `## ` heading cannot wrap.
//
// TWO-WAY, and the document fixes it: the DoD states the number on both sides of
// every task that touches the file. A future task that legitimately adds a section
// has to change this case in the same commit, which is the point — that is a
// decision, not a detail. T-63 is the first time that happened, and this comment is
// what it cost.

import { check, done, pm } from "../lib/qa.mjs";

const headings = pm().split("\n").filter((line) => line.startsWith("## "));

check(
  "roles/pm.md still has exactly 14 top-level sections",
  headings.length === 14,
  `found ${headings.length}:\n      ${headings.join("\n      ")}`,
);

const numbered = pm().split("\n").filter((line) => /^\d+\. \*\*/.test(line));
const numbers = numbered.map((line) => Number(line.match(/^(\d+)\./)[1]));

check(
  "the numbered steps run 1..18 with no gap and no repeat",
  numbers.length === 18 && numbers.every((number, index) => number === index + 1),
  `found ${numbers.length} step(s): ${numbers.join(", ")} — other files and QA cases cite these by number`,
);

check(
  "the first line of the file is untouched",
  pm().split("\n")[0] === "# Crew role: product manager (PM)",
  `the title line reads ${JSON.stringify(pm().split("\n")[0])} — docs/qa/T-01/case-06 pins this too`,
);

done();
