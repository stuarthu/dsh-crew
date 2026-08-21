// T-56 DoD item 7 and T-62 DoD item 11: both passages were written INSIDE the
// existing numbered steps. Neither opened a new top-level section.
//
// What it proves: the shape of the PM prompt did not drift. The PRD's risk table
// flagged this: `roles/pm.md` is the longest prompt in the package, its steps are
// cited by number from other files and from QA cases, and a new `## ` section
// between steps would push readers — and pointers — out of alignment. The count is
// what the DoD fixes: 13 before, 13 after, across both tasks that touched the file.
//
// PINNING STYLE: LINE-BASED. A `## ` heading cannot wrap.
//
// TWO-WAY, and the document fixes it: the DoD states the number on both sides of
// both tasks. A future task that legitimately adds a section has to change this
// case in the same commit, which is the point — that is a decision, not a detail.

import { check, done, pm } from "../lib/qa.mjs";

const headings = pm().split("\n").filter((line) => line.startsWith("## "));

check(
  "roles/pm.md still has exactly 13 top-level sections",
  headings.length === 13,
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
