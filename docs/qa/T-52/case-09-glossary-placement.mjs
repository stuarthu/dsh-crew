// T-52, DoD item 9: the glossary is one unnumbered section titled `Words we use`,
// and it sits after the last numbered principle and before
// `What we looked at and did not take`.
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
// WHAT CHANGED HERE, AND WHY IT IS A DECISION AND NOT DRIFT.
// **T-68** added `## 22. Do not tell, ask …`, the Socratic-interview principle
// the user asked for (`docs/decisions/crd/0019-socratic-principle-deferred.md`,
// PRD item A4), and moved `## Words we use` down under it. So this case used to
// say "immediately after principle 21" and now says "immediately after the last
// numbered principle". `ADR 0018` decided that QA changes such an assertion in
// the same commit as the prose, and T-68's DoD item 8 is the box for it.
//
// STILL TRUE, AND KEPT: at T-52's own change the last numbered principle was 21,
// so "after principle 21" and "after the last numbered principle" named the same
// heading then. The untrue part was only the assumption that the number would
// stay 21 — and `ADR 0021` had already seen T-68 coming and said in as many words
// that the glossary "moves to after the last numbered principle", which is the
// wording T-68's DoD item 9 then used. So the rule is being tested as the
// documents word it, not loosened: `ADR 0014` fixed the glossary's neighbours,
// never a digit.
//
// WHAT THIS COSTS, said out loud. The old assertion was deliberately brittle: it
// went red whenever a principle was added, which forced whoever added one to come
// and read `ADR 0014`. This one does not, so a future principle 23 added with the
// glossary correctly moved will leave this case green and nobody will re-read the
// placement decision. The brittle nail is not gone from this folder — case-01
// still pins the exact set of numbers, so adding a principle still forces a visit
// here — but it now guards the numbering decision rather than the placement one.
// The invariant that matters is kept tight below: nothing may sit between the
// last numbered principle and the glossary, and no numbered principle may sit
// after the glossary.
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
const numbered = all.filter((heading) => heading.number !== null);
const lastPrinciple = numbered[numbered.length - 1];
const lastPrincipleAt = all.indexOf(lastPrinciple);
const glossaryAt = indexOf("Words we use");
const rejected = indexOf("What we looked at and did not take");

check(
  "it comes after the last numbered principle",
  lastPrincipleAt !== -1 && glossaryAt !== -1 && glossaryAt > lastPrincipleAt,
  `last numbered principle is ${lastPrinciple?.raw ?? "(none)"} at heading #${lastPrincipleAt}, glossary at #${glossaryAt}`,
);

check(
  "no numbered principle sits after the glossary",
  glossaryAt !== -1 && all.slice(glossaryAt + 1).every((heading) => heading.number === null),
  `numbered heading(s) after the glossary: ${all
    .slice(glossaryAt + 1)
    .filter((heading) => heading.number !== null)
    .map((heading) => heading.raw)
    .join(" | ")}`,
);

check(
  "it comes before `What we looked at and did not take`",
  rejected !== -1 && glossaryAt !== -1 && glossaryAt < rejected,
  `glossary at heading #${glossaryAt}, rejected-ideas table at #${rejected}`,
);

check(
  "it is the section immediately after the last numbered principle",
  glossaryAt === lastPrincipleAt + 1,
  `heading #${lastPrincipleAt + 1} is ${JSON.stringify(all[lastPrincipleAt + 1]?.raw ?? "(none)")}, not the glossary`,
);

check(
  "the file's other unnumbered sections are still unnumbered too (the shape ADR 0014 reused)",
  ["What we looked at and did not take", "Keeping this file honest"].every((raw) => all.some((heading) => heading.raw === raw && heading.number === null)),
  "one of the two existing unnumbered sections is gone or was numbered",
);

done();
