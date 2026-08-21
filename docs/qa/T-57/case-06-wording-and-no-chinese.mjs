// T-57, DoD item 7: the file never calls the shape "pair programming", and it holds
// no Chinese characters.
//
// What it proves: the vocabulary rule holds in the file that has to EXPLAIN the
// shape to a role that only ever reads about it. The temptation to reach for the
// familiar analogy is highest exactly where something has to be explained briefly,
// and `CRD 0012` bans it: pair programming converges by talking, and this shape
// works only because the two readings do not converge. A reviewer holding the wrong
// analogy would expect the two halves to have agreed with each other — and would
// read the disagreement record, the most valuable artefact the shape produces, as
// evidence that something went wrong.
//
// PINNING STYLE: FLATTENED, case-insensitive. One-way: both are absences.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/code-reviewer.md");
const hits = (flat(text).toLowerCase().match(/pair programming/g) ?? []).length;

check(
  "the file never calls this shape `pair programming`",
  hits === 0,
  `found ${hits} hit(s)`,
);

const chinese = (text.match(/[一-鿿]/g) ?? []).length;

check(
  "the file holds no Chinese characters",
  chinese === 0,
  `found ${chinese} — roles/*.md are English`,
);

check(
  "QA's artefact is called a case, not a test",
  flat(text).includes("cases"),
  "the glossary noun for QA's work is missing",
);

check(
  "the unit-test half's artefact is called a unit test",
  flat(text).includes("unit test"),
  "the glossary noun for the other artefact is missing",
);

done();
