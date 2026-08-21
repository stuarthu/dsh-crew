// T-52, `ADR 0014` (named in T-52's 要求来源 / requirement sources), the
// cross-reference half of DoD items 9 and 14: principle 21 points at the
// `Words we use` section, and the glossary's own claim that it is pointed at
// from two places is true.
//
// What it proves: the glossary is unnumbered on purpose (`ADR 0014` option A),
// and the price of that choice — "a reader who navigates by number will walk
// past it" — was accepted only because TWO principles point at it: "加两处交叉
// 引用：原则 6 和原则 21 各指一次" (`ADR 0014`, 决定). The `Words we use` section
// itself states this as a fact about the file: "Principle 6 and principle 21 each
// point here instead." So this is not decoration: if principle 21 does not point
// at the glossary, the file says something about itself that is not true, and the
// one mitigation for an unnumbered section is half missing.
//
// PINNING STYLE: FLATTENED. "Words we use" is bolded inline in prose and would
// otherwise be split by the 80-column wrap.
//
// One-way: as long as the glossary is unnumbered, both pointers have to exist.
// If a later job numbers it, that is a change to `ADR 0014` and this case
// changes with it, in the same commit.

import { check, done, flatten, principle, principles, sectionOf } from "./principles.mjs";

const text = principles();
const twentyOne = flatten(principle(text, 21));
const glossary = flatten(sectionOf(text, "Words we use"));

check(
  "principle 21 points at the `Words we use` section",
  twentyOne.includes("Words we use"),
  "principle 21 never names the glossary, so one of ADR 0014's two cross-references is missing",
);

check(
  "the glossary claims both principles point at it",
  /[Pp]rinciple 6 and principle 21 each point here/.test(glossary),
  "the glossary no longer makes that claim — check ADR 0014 before changing this line",
);

check(
  "principle 6 is the other pointer (the pair, not one of them)",
  flatten(principle(text, 6)).includes("Words we use"),
  "principle 6 does not point at the glossary either",
);

done();
