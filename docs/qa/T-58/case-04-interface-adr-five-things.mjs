// T-58, DoD item 4: every paired task gets an interface ADR of its own, under
// `docs/decisions/adr/`, and it pins FIVE things: the import path, the exported
// name, the signature, the shape of the return value, and what happens on an error.
//
// A WARNING THE DoD MAKES EXPLICIT: do NOT pin the bare word `import`. Line 88 of
// this file already carried `import, HTTP/REST, gRPC…` long before this task, so a
// case pinning `import` would go green having checked nothing. The pin is the phrase
// `interface ADR`, which was 0 times in the whole repository before this job.
//
// What it proves: the one document the two halves share is completely specified.
// The file says what happens if it is not: "Leave one of the five out and both
// halves decide it alone" — and one of five landing differently makes the merged
// run red for a clash of names, which teaches nobody anything and buries the real
// signal.
//
// PINNING STYLE: FLATTENED. Each of the five is checked separately, so losing one
// cannot hide behind the other four.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/architect.md"));

check(
  "the file uses the phrase `interface ADR`",
  flatText.includes("interface ADR"),
  "the phrase is missing — it was 0 times in the whole repository before this job",
);

check(
  "the ADR lives in the decisions folder, one file per paired task",
  flatText.includes("docs/decisions/adr/") && flatText.includes("one file per paired task"),
  "where the ADR lives, or that there is one per task, is missing",
);

check(
  "its file name goes on the task's shape line",
  flatText.includes("name the file on the task's shape line"),
  "nothing connects the ADR to the row that needs it",
);

check(
  "the file says it pins five things",
  flatText.includes("it pins **five** things"),
  "the count is missing, which is how a sixth or a fourth creeps in unnoticed",
);

const five = [
  ["the import path", "the exact path the unit tests import from"],
  ["the exported name", "exactly as the code will export it"],
  ["the signature", "how many arguments, in what order"],
  ["the shape of the return value", "the fields and their types"],
  ["what happens on an error", "thrown or returned"],
];

for (const [name, detail] of five) {
  check(
    `it pins ${name}`,
    flatText.includes(`**${name}**`),
    "one of the five is missing, and the file itself says both halves then decide it alone",
  );
  check(
    `and says what that means in practice (${name})`,
    flatText.includes(detail),
    `the item is named but not defined: ${JSON.stringify(detail)} is missing`,
  );
}

check(
  "it says leaving one out means both halves decide it alone",
  flatText.includes("Leave one of the five out and both halves decide it alone"),
  "the consequence of an incomplete ADR is missing",
);

check(
  "it says a clash of names is not a disagreement",
  flatText.includes("a clash of names, not a disagreement"),
  "the distinction that makes this ADR worth writing is missing",
);

done();
