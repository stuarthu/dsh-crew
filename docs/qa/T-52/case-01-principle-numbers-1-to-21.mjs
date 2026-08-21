// T-52, DoD items 2 and 9: `principles.md` carries the numbers 1 to 21 and
// nothing else — no gap, no repeat, and no `## 22.`
//
// What it proves: the one thing in this file that other files address by number
// still means what they think it means. This is the whole reason `ADR 0011`
// chose to rewrite principle 6 in place instead of splitting it: seven places
// cite this file by number or by line (`CLAUDE.md` "principles.md 8, 13, 14, 15,
// 19 and 20", `principles.md:589`, several CRDs and ADRs), and inserting or
// renumbering one principle makes every one of them wrong at once with no check
// going red. This case is that missing check for the numbers.
//
// It also holds the "not a principle" half of DoD 9: the glossary must NOT
// become `## 22.` (`ADR 0014` option B, rejected).
//
// PINNING STYLE: LINE-BASED. A `## ` heading cannot wrap at 80 columns, so
// reading headings line by line is safe here (see the note in ./principles.mjs).
//
// One-way: the file may grow principle 22 one day, and then the number 22 is
// legitimate. What can never become legitimate is 1 to 20 landing on different
// text, which is what case-02 pins. Here the exact set is pinned because today
// the top number is 21 and any 22 in this file would mean the glossary was
// numbered after all — the shape `ADR 0014` refused. A later job that really
// adds principle 22 changes this line together with the file, in the same commit.

import { check, done, headings, principles } from "./principles.mjs";

const numbers = headings(principles()).filter((heading) => heading.number !== null);
const found = numbers.map((heading) => heading.number);

check(
  "principles.md carries exactly the numbers 1 to 21",
  JSON.stringify(found) === JSON.stringify(Array.from({ length: 21 }, (unused, index) => index + 1)),
  `found ${found.length} numbered heading(s): ${found.join(", ")}`,
);

check(
  "every number appears exactly once",
  new Set(found).size === found.length,
  `repeated: ${found.filter((number, index) => found.indexOf(number) !== index).join(", ")}`,
);

check(
  "the numbers are in ascending order",
  found.every((number, index) => index === 0 || number > found[index - 1]),
  `order: ${found.join(", ")}`,
);

check(
  "there is no `## 22.` — the glossary is not a principle (ADR 0014)",
  !found.includes(22) && Math.max(...found) === 21,
  `highest number is ${Math.max(...found)}`,
);

check(
  "principle 21 exists (DoD 3)",
  found.includes(21),
  "no `## 21.` heading",
);

done();
