// T-52, DoD item 9: the glossary is one unnumbered section titled `Words we use`,
// and it sits after principle 21 and before `What we looked at and did not take`.
//
// What it proves: `ADR 0014`'s option A landed exactly as decided — not as
// principle 22 (option B), not folded inside principle 21 (option C). Position is
// the decision here, so position is what is checked: a glossary inside principle
// 21 would put the wrong scope on a table that serves principles 6, 13, 21 and
// `roles/qa.md` alike.
//
// `ADR 0014` also fixed the exact English title, and says why: `principles.md`
// holds zero Chinese characters, so a pin like `grep '## 用词'` on this file is
// not a weak check, it is a check that can never fire. The title string is
// therefore part of the requirement, not styling.
//
// PINNING STYLE: LINE-BASED. Headings cannot wrap.
//
// One-way: the section stays unnumbered and stays between those two neighbours
// unless `ADR 0014` is superseded.

import { check, done, headings, principles } from "./principles.mjs";

const text = principles();
const all = headings(text);

const glossary = all.filter((heading) => heading.raw === "Words we use");

check(
  "there is exactly one `## Words we use` heading",
  glossary.length === 1,
  `found ${glossary.length}: ${all.map((heading) => heading.raw).join(" | ")}`,
);

check(
  "it is unnumbered",
  glossary.length === 1 && glossary[0].number === null,
  glossary.length === 1 ? `it carries the number ${glossary[0].number}` : "the section is missing",
);

const indexOf = (raw) => all.findIndex((heading) => heading.raw === raw);
const twentyOne = all.findIndex((heading) => heading.number === 21);
const glossaryAt = indexOf("Words we use");
const rejected = indexOf("What we looked at and did not take");

check(
  "it comes after principle 21",
  twentyOne !== -1 && glossaryAt !== -1 && glossaryAt > twentyOne,
  `principle 21 at heading #${twentyOne}, glossary at #${glossaryAt}`,
);

check(
  "it comes before `What we looked at and did not take`",
  rejected !== -1 && glossaryAt !== -1 && glossaryAt < rejected,
  `glossary at heading #${glossaryAt}, rejected-ideas table at #${rejected}`,
);

check(
  "it is the section immediately after principle 21",
  glossaryAt === twentyOne + 1,
  `heading #${twentyOne + 1} is ${JSON.stringify(all[twentyOne + 1]?.raw ?? "(none)")}`,
);

check(
  "the file's other unnumbered sections are still unnumbered too (the shape ADR 0014 reused)",
  ["What we looked at and did not take", "Keeping this file honest"].every((raw) => all.some((heading) => heading.raw === raw && heading.number === null)),
  "one of the two existing unnumbered sections is gone or was numbered",
);

done();
