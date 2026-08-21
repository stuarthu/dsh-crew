// T-51, the blocking finding of this job's security review: neither new persona
// may add a dependency, and the test engineer may not install one or edit the
// manifest or the lock file to slip one in.
//
// What it proves: the one attack chain this job opened stays shut. Both new roles
// keep `bash` (they have to run what they write), and both read a task row as
// their instructions. So a task row that says "use package X" — written by
// anybody who can put text in this repository — would otherwise end as `npm
// install X` inside a role's shell, and an install script is arbitrary code
// execution on the user's machine. The rule has to live in the persona, because
// the persona is the only thing the child reads.
//
// No DoD row carries these strings (see the QA report), so this case IS their
// carrier: without it, the rewrite in M3 can drop them and every check stays
// green.

import { check, done, repoFile } from "../lib/qa.mjs";

const test = repoFile("roles/test-engineer.md");
const code = repoFile("roles/code-engineer.md");
const flat = (text) => text.replace(/\s+/g, " ");

// --- the test engineer: choose, do not add; never install; never edit the manifest
check(
  "roles/test-engineer.md says adding a package is not its call",
  flat(test).includes("Adding a package the project does not depend on yet is **not** your call"),
  flat(test),
);
check(
  "roles/test-engineer.md forbids installing one",
  flat(test).includes("Never install one"),
  "the install ban is gone — a role with a shell and no ban is one task row away from running an install script",
);
check(
  "roles/test-engineer.md forbids editing the manifest or the lock file",
  flat(test).includes("never edit the manifest or the lock file"),
  "the second half of the ban is gone: a new dependency can be slipped in by editing package.json instead of by installing",
);
check(
  "roles/test-engineer.md says what to do instead (report it)",
  /put it in your report/.test(flat(test)),
  "a ban with no way out turns into a role that improvises",
);

// --- the code engineer: same ban on adding, in its own words
check(
  "roles/code-engineer.md forbids adding a dependency the project does not have",
  flat(code).includes("never add a dependency this project does not have yet"),
  flat(code),
);
check(
  "roles/code-engineer.md says what to do instead (report it)",
  /put that in your report/.test(flat(code)),
  "the code engineer has no way out of the ban",
);

// --- and both refuse the instruction wherever it comes from
for (const [file, text] of [["roles/test-engineer.md", test], ["roles/code-engineer.md", code]]) {
  check(
    `${file} refuses an instruction to add or install a dependency`,
    flat(text).includes("to add or install a dependency"),
    "the escape-hatch paragraph no longer names the dependency instruction as one it does not carry out",
  );
}

done();
