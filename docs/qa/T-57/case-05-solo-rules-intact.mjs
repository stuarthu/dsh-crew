// T-57, DoD item 5, the half a permanent case can hold: the solo review rules were
// not rewritten. Only a section about paired evidence was added.
//
// WHAT THIS CASE DELIBERATELY DOES NOT DO. The DoD verifies item 5 with
// `git diff roles/code-reviewer.md` — no deleted lines. That is a fact about one
// commit, and `ADR 0013` keeps a permanent case to one-way assertions. So this case
// holds the FLOOR: the rules that were there before are still there. That stays
// true for ever, and it catches the real risk — a later edit tidying the "old" solo
// rules away now that a newer, longer section sits beside them.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/code-reviewer.md");
const flatText = flat(text);

check(
  "the reviewer is still read-only: it names no way to write a file",
  flatText.includes("read") && !flatText.includes("you may edit"),
  "the read-only nature of the role is no longer stated",
);

check(
  "the solo rule about a unit test that was never seen to fail is still there",
  flatText.includes("never seen to fail"),
  "the solo evidence rule is gone",
);

check(
  "the file still works in terms of blocking findings",
  flatText.includes("blocking"),
  "the vocabulary the whole role runs on is gone",
);

check(
  "it still points at the task row's DoD section as the standard",
  flatText.includes("DoD section"),
  "the standard the reviewer judges against is gone",
);

check(
  "it still points at docs/design/tasks.md",
  flatText.includes("docs/design/tasks.md"),
  "a string verify-mount.mjs also pins is gone",
);

check(
  "no `dod.md` and no `{{`",
  !text.includes("dod.md") && !text.includes("{{"),
  "a forbidden string is present",
);

check(
  "the file is still the full persona, not a paired-shape note that replaced it",
  text.length > 6000,
  `the file is only ${text.length} characters long`,
);

done();
