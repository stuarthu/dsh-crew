// T-51, DoD item 9 (first half): both new personas say they talk only to the PM,
// in the same words the other personas use.
//
// What it proves: the sentence that keeps the crew flat from the INSIDE is in
// both files. `verify-mount.mjs` reads every persona, but only for three things —
// it loads, it is at least 500 characters, it has no `{{` — so a placeholder
// that never mentioned the PM at all would pass every check in this repository
// (T-53 item 7 and T-54 item 8 say so in their own verification columns).
//
// The pinned string is the wording six shipped personas already use, so the two
// new files cannot drift into a private phrasing of the same rule (ADR 0009: the
// price of three standalone copies is drift, and pinned sentences are what is
// paid instead).

import { check, done, repoFile } from "../lib/qa.mjs";

const PIN = "is the only one you talk to";

for (const file of ["roles/test-engineer.md", "roles/code-engineer.md"]) {
  const text = repoFile(file);
  check(`${file} says "${PIN}"`, text.includes(PIN), `the sentence is not in the file`);
  // The PM, not the user and not the sibling: the same paragraph has to close
  // both other doors, or "only one you talk to" reads as advice about tone.
  check(`${file} says it does not talk to the user`, /never\s+talk\s+to\s+the\s+user/i.test(text.replace(/\s+/g, " ")), text.slice(0, 400));
  check(
    `${file} says it cannot talk to the other engineer`,
    /(other engineer)/.test(text) && /cannot talk to the other engineer/.test(text.replace(/\s+/g, " ")),
    "the no-sibling-channel rule (CRD 0012) is not stated",
  );
}

// The same sentence, in the six personas it was taken from. If somebody reworded
// it there, the two new files would be the odd ones out and this pin would be
// pinning a phrase the project no longer uses.
for (const file of ["roles/architect.md", "roles/engineer.md", "roles/qa.md", "roles/code-reviewer.md", "roles/researcher.md", "roles/security-reviewer.md"]) {
  check(`${file} still uses the same wording`, repoFile(file).includes(PIN), `"${PIN}" is gone from a persona the new files copied it from`);
}

done();
