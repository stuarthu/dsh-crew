// T-53, DoD item 2: the file never uses the wording "QA test", and every mention
// of QA describes somebody else's work.
//
// What it proves: the glossary rule of `principles.md` 21 holds in the file most
// at risk of breaking it. "QA test" is the phrase that merges the two roles into
// one, and the PRD banned it outright: QA writes CASES, a programmer writes unit
// TESTS. A persona that used the banned phrase would be teaching the confusion it
// exists to prevent.
//
// PINNING STYLE: FLATTENED, so a line break between `QA` and `test` cannot hide
// the phrase. That is not a theoretical worry — a wrapped phrase defeating a
// line-based grep is the single most repeated mistake of this job (eight times).
//
// One-way: the phrase must never appear. There is no "today it may".

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/test-engineer.md"));

check(
  "the file never says `QA test`",
  !flatText.includes("QA test"),
  "the banned wording is back — QA writes cases, a programmer writes unit tests",
);

check(
  "it never says `QA tests` either",
  !flatText.includes("QA tests"),
  "the plural form of the banned wording is present",
);

check(
  "QA's artefact is called a case",
  flatText.includes("acceptance case") || flatText.includes("its cases"),
  "QA's work is never named with the right noun, so nothing anchors the distinction",
);

check(
  "the file still uses the precise noun for its own work",
  flatText.includes("unit test"),
  "the file does not name its own artefact precisely either",
);

done();
