// T-52, DoD items 2 and 9: `principles.md` carries the numbers 1 to 22 and
// nothing else — no gap, no repeat, and no number on a section that is not a
// principle.
//
// What it proves: the one thing in this file that other files address by number
// still means what they think it means. This is the whole reason `ADR 0011`
// chose to rewrite principle 6 in place instead of splitting it: seven places
// cite this file by number or by line (`CLAUDE.md` "principles.md 8, 13, 14, 15,
// 19 and 20", `principles.md:589`, several CRDs and ADRs), and inserting or
// renumbering one principle makes every one of them wrong at once with no check
// going red. This case is that missing check for the numbers.
//
// It also holds the "not a principle" half of DoD 9: the glossary must NOT be
// numbered at all (`ADR 0014` option B, rejected). That half is unchanged — it
// used to be written as "there is no `## 22.`" because on the day this case was
// written 22 was the number the glossary would have taken. The rule was never
// about the digit; it is that `Words we use` carries no number.
//
// WHAT CHANGED HERE, AND WHY IT IS A DECISION AND NOT DRIFT.
// **T-68** added `## 22. Do not tell, ask — and ask the question that fits the
// hole in what you know`, the Socratic-interview principle, and moved
// `## Words we use` down so that it still follows the last numbered principle.
// The top number is 22 now, so the three assertions that read 21 read 22.
// It is a decision, and it was written down before it happened:
//
//   * the user asked for the principle in as many words, and asked to wait for
//     the job that also applies it — `docs/decisions/crd/0019-socratic-principle-deferred.md`;
//   * that same CRD predicted this exact red, naming this case and case-19, in
//     its section on what would bite later;
//   * the PRD of the job that applied it carries it as item A4;
//   * `docs/decisions/adr/0018-red-existing-cases.md` decided who changes the
//     assertion: QA, in the same commit as the prose, so no commit is red and
//     `docs/qa/` stays QA's. T-68's DoD item 8 is the box for that work;
//   * principle 22 pays what a number costs in this file (`ADR 0014`'s reason
//     for refusing the glossary one): it has a rule, a why with this
//     repository's own evidence, a `Lives in` pointing at one step of
//     `roles/pm.md`, and ten outside sources.
//
// STILL TRUE, AND KEPT: at T-52's own change the set really was 1 to 21, and the
// glossary really was refused a number then — and is still refused one now. The
// only untrue part was the inference "so the top number is 21 forever".
//
// THE FILE NAME still says `1-to-21`, on purpose. Four durable documents cite
// this case by its exact file name — `CRD 0019`, `ADR 0018`, the job's HLD, and
// T-68's own DoD item 8 — and none of those four is QA's to edit, so a rename
// would make four citations wrong in the same moment it fixed one name. Read the
// name as the day this case was born; the assertions below are today's range.
//
// PINNING STYLE: LINE-BASED. A `## ` heading cannot wrap at 80 columns, so
// reading headings line by line is safe here (see the note in ./principles.mjs).
//
// One-way: the exact set is pinned on purpose, so growing it is never quiet.
// `ADR 0021` already expects a principle 23 to be proposed one day; the job that
// really adds it changes this line together with the file, in the same commit,
// and QA is the one who changes it. What can never become legitimate is 1 to 20
// landing on different text, which is what case-02 pins, or `Words we use`
// taking a number of its own, which is pinned below and in case-09.

import { check, done, headings, principles } from "./principles.mjs";

const all = headings(principles());
const numbers = all.filter((heading) => heading.number !== null);
const found = numbers.map((heading) => heading.number);

/** The top number, changed by the job that really adds a principle. See the header. */
const TOP = 22;

check(
  `principles.md carries exactly the numbers 1 to ${TOP}`,
  JSON.stringify(found) === JSON.stringify(Array.from({ length: TOP }, (unused, index) => index + 1)),
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
  `the highest number is ${TOP} — nothing was added above it unannounced`,
  Math.max(...found) === TOP,
  `highest number is ${Math.max(...found)}`,
);

check(
  "the glossary is not a principle — `Words we use` carries no number (ADR 0014)",
  all.some((heading) => heading.raw === "Words we use" && heading.number === null),
  all.some((heading) => heading.raw === "Words we use")
    ? "the `Words we use` heading was given a number — that is ADR 0014's rejected option B"
    : "there is no `## Words we use` heading at all",
);

check(
  "principle 21 exists (DoD 3)",
  found.includes(21),
  "no `## 21.` heading",
);

done();
