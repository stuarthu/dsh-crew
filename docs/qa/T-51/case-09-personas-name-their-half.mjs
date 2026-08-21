// T-51, DoD item 9 (second half), and PRD v3 "it can be checked" items 2-3: each
// new persona names WHICH half of the task it writes, in the project's own words,
// and neither of them writes "QA test".
//
// What it proves: a role that cannot tell its own half from the other's is a role
// the PM cannot brief. `unit test` and `product code` are the two nouns the
// glossary keeps apart (PRD v3), and `verify-mount.mjs` reads neither. The banned
// spelling "QA test" is pinned as ABSENT in both files, in the direction that
// stays true for ever: it puts the word "test" back on QA's cases, which is the
// exact confusion the glossary exists to end.

import { check, done, repoFile } from "../lib/qa.mjs";

const test = repoFile("roles/test-engineer.md");
const code = repoFile("roles/code-engineer.md");

// --- each file names its own half
check("roles/test-engineer.md says `unit test`", test.includes("unit test"), "the noun that separates it from QA's cases is missing");
check("roles/code-engineer.md says `product code`", code.includes("product code"), "the noun that separates it from the test engineer is missing");

// --- and says what it does NOT write, so the two halves cannot both be claimed
check(
  "roles/test-engineer.md says it writes no product code",
  /no product code/.test(test.replace(/\s+/g, " ")),
  test.slice(0, 600),
);
check(
  "roles/code-engineer.md says it writes no test files for the new behaviour",
  /no test files/.test(code.replace(/\s+/g, " ")),
  code.slice(0, 600),
);

// --- the test engineer is a programmer, not QA, and it knows where QA lives
check("roles/test-engineer.md says it is not QA", /not QA/.test(test), "the first paragraph no longer separates the two roles");
check("roles/test-engineer.md points at docs/qa/ as somebody else's home", test.includes("docs/qa/"), "QA's folder is not named");

// --- the banned spelling, in both files
for (const [file, text] of [["roles/test-engineer.md", test], ["roles/code-engineer.md", code]]) {
  check(`${file} never writes "QA test"`, !text.includes("QA test"), `at index ${text.indexOf("QA test")}`);
}

done();
