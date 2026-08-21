// T-59, DoD items 1 and 2: "what it does not promise" is its OWN passage in both
// READMEs — not a footnote — and it says all three things.
//
//   1. a green first meeting means only that the two readings matched;
//   2. a correlated misreading is not caught by this shape;
//   3. the ceiling of the whole thing is the quality of that DoD section, and
//      that DoD section had no second pair of eyes.
//
// What it proves: the README does not oversell. This is the half a reader skips,
// so the DoD required it to be a section of its own rather than a note — and the
// third item is the sharpest, because it says the shape's value is capped by a
// document only one person wrote. Losing item 3 would leave the impression that
// two readers make a weak DoD section safe. They do not.
//
// PINNING STYLE: LINE-BASED for the heading, FLATTENED for the three claims.

import { check, done, headings, readmes } from "./readmes.mjs";

for (const readme of readmes()) {
  check(
    `${readme.path}: "what a green run does not prove" is its own heading, not a note`,
    headings(readme.text).some((line) =>
      /does not prove|does not promise|证明不了|不保证/.test(line)),
    `no heading carries the limits. Headings: ${headings(readme.text).join(" / ")}`,
  );

  check(
    `${readme.path}: limit one — green says only that the two readings matched`,
    readme.path === "README.md"
      ? readme.flat.includes("says exactly one thing: the two readings matched")
      : readme.flat.includes("只说明一件事：两份读法对上了"),
    "the first limit is missing",
  );

  check(
    `${readme.path}: limit one also says it does NOT mean the document was clear`,
    readme.path === "README.md"
      ? readme.flat.includes("does **not** say the document was clear")
      : readme.flat.includes("它**不**说明文档是清楚的"),
    "the stronger claim is not ruled out",
  );

  check(
    `${readme.path}: limit two — a shared wrong reading goes through undetected`,
    readme.path === "README.md"
      ? readme.flat.includes("the *same* wrong meaning out of one weak sentence")
      : readme.flat.includes("读出**同一个**错意思"),
    "the correlated-misreading limit is missing",
  );

  check(
    `${readme.path}: limit three — the ceiling is the DoD section, which nobody double-read`,
    readme.path === "README.md"
      ? readme.flat.includes("no second pair of eyes")
      : readme.flat.includes("没有第二双眼睛"),
    "the ceiling of the whole shape is not stated — a reader would think two halves fix a weak DoD section",
  );
}

done();
