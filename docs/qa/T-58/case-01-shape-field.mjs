// T-58, DoD item 1: the architect's task table carries a `**Shape**` field,
// directly after the milestone and before the file list, with two values.
//
// SCOPE. The pin is on the BOLDED FIELD NAME. The DoD warns that lowercase `shape`
// already appeared six times in this file as ordinary prose before the task, so a
// check for the word could not fail. `ADR 0012`'s Chinese `- **形状**：` is how the
// field looks in a Chinese task table; this file is English and pins the English
// form.
//
// What it proves: the role that actually WRITES the task table knows the field
// exists and where it goes. The PM's copy of this rule is pinned by
// `docs/qa/T-56/case-01`; on big work the architect is the one who writes the rows,
// so a missing field here means no row is ever marked `pair` at all.
//
// PINNING STYLE: FLATTENED for the field name and sentences; the ordering is
// checked as a sentence, which is how the file states it.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/architect.md"));

check(
  "the file uses the bolded field name `**Shape**`",
  flatText.includes("**Shape**"),
  "the field name is missing — a check for lowercase `shape` would pass on prose already in the file",
);

check(
  "the two values are named: solo and pair",
  flatText.includes("`solo`") && flatText.includes("`pair`"),
  "one of the two values is missing",
);

check(
  "the field goes straight after the milestone and before the file list",
  flatText.includes("written straight after the milestone and before the file list"),
  "the position is not stated",
);

check(
  "the reason for that order is there: the shape decides what the list looks like",
  flatText.includes("the shape decides what that list looks like"),
  "the reason is missing, so a later edit will treat the order as arbitrary",
);

check(
  "the English field name is given with an example of each value",
  flatText.includes("- **Shape**: solo") && flatText.includes("- **Shape**: pair"),
  "the field is described but never shown, which is how two writers produce two spellings",
);

check(
  "a pair row carries the interface ADR on the same line",
  flatText.includes("interface ADR on the same line"),
  "the pair value does not carry its ADR path",
);

done();
