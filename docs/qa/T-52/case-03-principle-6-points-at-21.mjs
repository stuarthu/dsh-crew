// T-52, DoD item 1: principle 6 was rewritten in place and points at principle
// 21, and (`ADR 0014`) it points at the glossary as well.
//
// What it proves: a reader who arrives at "tests come before code" is told that
// the rule has two shapes and where the second one is written down. Without that
// pointer, principle 6 is the stale rule `ADR 0011` option C was rejected for:
// it would still read as if the person who writes the unit test is the person
// who writes the code.
//
// PINNING STYLE: FLATTENED. Every sentence in this section wraps at 80 columns,
// so the section is collapsed to one line before anything is matched. The
// heading itself is checked line-based, because a heading cannot wrap.
//
// Note the strings pinned here are deliberately short and structural
// ("principle 21", "Words we use"): this case does not claim to judge whether
// the two shapes are EXPLAINED well. That needs a reader (`gaps.md` entry 1).
//
// One-way: principle 6 will always have to point at the paired shape as long as
// the paired shape exists, and if it is ever removed the removal is a CRD.

import { check, done, flatten, principle, principles } from "./principles.mjs";

const text = principles();
const six = principle(text, 6);
const flat = flatten(six);

check(
  "`## 6.` is still there — the rewrite was in place, not a new number",
  /^## 6\. /m.test(text),
  "no `## 6.` heading",
);

check(
  "principle 6 names principle 21",
  flat.includes("principle 21"),
  "the words \"principle 21\" are nowhere in principle 6, so nothing sends the reader to the paired shape",
);

check(
  "principle 6 names both shapes",
  /\bSolo\b/.test(flat) && /\bPaired\b/.test(flat),
  `Solo: ${/\bSolo\b/.test(flat)}, Paired: ${/\bPaired\b/.test(flat)}`,
);

check(
  "principle 6 names the two new roles",
  flat.includes("crew_test_engineer") && flat.includes("crew_code_engineer"),
  "one of the two paired role names is missing from principle 6",
);

check(
  "principle 6 points at the glossary (ADR 0014 asks for two cross-references)",
  flat.includes("Words we use"),
  "principle 6 does not point at the `Words we use` section",
);

check(
  "principle 6 still demands the failing run",
  flat.includes("without the failing run is not accepted"),
  "the evidence rule of principle 6 is gone — this task was only allowed to reword, not to change the rule",
);

done();
