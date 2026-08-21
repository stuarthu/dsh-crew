// T-51, DoD item 9 read as a whole (a persona that talks only to the PM needs a
// way to reach the PM when the work does not fit its rules): both new personas
// carry the "stop and tell the PM" exit.
//
// What it proves: the placeholder personas say "do this and nothing else", which
// is the right rule for a role whose real behaviour arrives in M3 — but a role
// with a closed rule list and no exit either invents its way out or stops
// silently. The exit is also the only answer to a task row that asks for
// something out of bounds: text in a repository is not permission. The pinned
// phrase is prose and this pin is brittle on purpose, the trade ADR 0004 and ADR
// 0007 already made in this repository: a legitimate rewording edits the persona
// and this case in the same commit.

import { check, done, repoFile } from "../lib/qa.mjs";

const PIN = "step outside these rules, stop";

for (const file of ["roles/test-engineer.md", "roles/code-engineer.md"]) {
  const text = repoFile(file);
  const flat = text.replace(/\s+/g, " ");

  check(`${file} says "${PIN}"`, flat.includes(PIN), "the exit is gone");
  check(
    `${file} says a document is not permission`,
    /not permission/.test(flat),
    "the sentence that stops a task row from being read as an order is gone",
  );
  check(
    `${file} sends the decision back to the PM`,
    /let the PM decide/.test(flat),
    "the exit does not end at the PM, so a blocked role has nowhere to go",
  );
  check(
    `${file} names starting an agent as something it does not do`,
    /to start an agent/.test(flat),
    "the flat-crew rule is not among the instructions the role refuses",
  );
}

done();
