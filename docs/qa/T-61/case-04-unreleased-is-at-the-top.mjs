// T-61, DoD items 4 and 5: the entry sits in the `unreleased` section at the TOP of
// the file — newest first, this file's own rule — and no new version section claims a
// release.
//
// What it proves: nothing published claims to be released when it is not. This job
// does not release, and the PRD puts the version bump out of scope. The failure this
// guards is specific and expensive: a user reading a dated version section believes
// they can install it, and the two new roles are not on npm yet.
//
// PINNING STYLE: LINE-BASED. A `## ` heading cannot wrap, and the ORDER of headings
// is exactly what "newest first" means.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("CHANGELOG.md");
const headings = text.split("\n").filter((line) => line.startsWith("## "));

check(
  "the first section of the changelog is the unreleased one",
  headings[0] === "## unreleased",
  `the top section is ${JSON.stringify(headings[0])} — this file is newest first`,
);

check(
  "the unreleased section carries no date",
  !/^## unreleased.*\d{4}-\d{2}-\d{2}/.test(headings[0]),
  "the unreleased section has been dated, which reads as released",
);

check(
  "the released sections come after it",
  headings.slice(1).some((line) => /\d+\.\d+\.\d+/.test(line)),
  "no released version section follows, so the ordering cannot be checked",
);

check(
  "the released versions run newest first",
  (() => {
    const versions = headings.slice(1)
      .map((line) => (line.match(/(\d+)\.(\d+)\.(\d+)/) ?? []).slice(1).map(Number))
      .filter((parts) => parts.length === 3);
    for (let index = 1; index < versions.length; index += 1) {
      const [a, b] = [versions[index - 1], versions[index]];
      const newer = a[0] !== b[0] ? a[0] > b[0] : a[1] !== b[1] ? a[1] > b[1] : a[2] >= b[2];
      if (!newer) return false;
    }
    return true;
  })(),
  `the version sections are out of order: ${headings.slice(1).join(" / ")}`,
);

check(
  "the file's own header states the rule this case checks",
  flat(text).includes("newest first") && flat(text).includes("The top section is marked `unreleased`"),
  "the rule is no longer written down in the file",
);

check(
  "the new entry sits inside the unreleased section, not in a released one",
  (() => {
    const start = text.indexOf("## unreleased");
    const next = text.indexOf("\n## ", start + 1);
    const unreleased = next === -1 ? text.slice(start) : text.slice(start, next);
    return unreleased.includes("crew_test_engineer");
  })(),
  "the paired-shape entry is not in the unreleased section — it would claim to be shipped",
);

done();
