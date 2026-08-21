// T-51, DoD item 20: the dependency ban is three halves in BOTH personas — do not
// add a package the project does not have, do not install one, do not edit the
// manifest or the lock file.
//
// What it proves: the half that was missing. `case-12` pins all three halves in
// `roles/test-engineer.md`, but `roles/code-engineer.md` carried only the first
// one, and the code engineer is the role most likely to want a package: it writes
// the product code, it has a shell, and it reads a task row as its instructions.
// One ban out of three is not two thirds of a defence — "never add" alone leaves
// `npm install X` readable as allowed, and an install script is arbitrary code
// execution on the user's machine.
//
// DoD 20 states its own check as four greps (`never install` and
// `manifest or the lock`, case-insensitive, in both files). This case is those
// four greps, so the row has a carrier that runs on every `npm test`, plus the
// sentence that explains why one ban is not enough.
//
// One-way: DoD 20 exists precisely because the M3 rewrite could drop these
// strings with every check still green, so T-53 and T-54 must keep them.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const files = {
  "roles/test-engineer.md": flat(repoFile("roles/test-engineer.md")),
  "roles/code-engineer.md": flat(repoFile("roles/code-engineer.md")),
};

// --- DoD 20's four greps, both halves in both files
for (const [name, text] of Object.entries(files)) {
  check(
    `${name} forbids installing a dependency (\`never install\`)`,
    /never install/i.test(text),
    "a role with a shell and no install ban is one task row away from running an install script",
  );
  check(
    `${name} forbids editing the manifest or the lock file (\`manifest or the lock\`)`,
    /manifest or the lock/i.test(text),
    "without this half a dependency is added by editing package.json, and no install is needed at all",
  );
  // A ban with no way out is a rule a role improvises around, so each file has to
  // say what to do with the request instead of carrying it out.
  check(
    `${name} says what to do instead (report it to the PM)`,
    /in your report/i.test(text),
    "the ban names no way out",
  );
}

// --- the sentence that says WHY the ban needs all three halves.
//
// Basis: this is NOT a DoD string. It is the sentence the code engineer added
// after my previous round's report said "editing package.json adds a dependency
// with no install at all", and it is the only place in either persona that
// explains why the three halves are not three ways of saying one thing. Without
// it, the next reader tidying these files has every reason to merge two of them
// back together, which is how the hole appeared the first time. That is my
// judgement, on my own words, and the report says so.
check(
  "roles/code-engineer.md explains why the install ban alone is not enough",
  /a package\.json edit adds a dependency without any install at all/i.test(files["roles/code-engineer.md"]),
  "the reason the ban has three halves is gone, so the next tidy-up can merge two of them away",
);

done();
