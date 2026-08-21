// T-58, DoD item 6: an interface ADR is NOT a boundary contract, and the file says
// exactly how they differ.
//
// A boundary contract in `docs/design/api/` is one per pair of MODULES that talk,
// it belongs to those modules, and it outlives every task built against it. An
// interface ADR is one per TASK, and the two sides it holds apart are not modules at
// all — they are the unit tests and the product code of one task, landing inside the
// same module.
//
// What it proves: the two documents do not collapse into each other. `CRD 0014`
// rejected two placements for the interface pin, and this passage is the reason
// written down. The consequences are concrete and in the file: a paired task in a
// ONE-MODULE design still needs its interface ADR, and a paired task that also sits
// on a module boundary needs BOTH files.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/architect.md"));

check(
  "the file states the distinction outright",
  flatText.includes("An interface ADR is not a boundary contract"),
  "the distinction is missing",
);

check(
  "a boundary contract is one per pair of modules that talk",
  flatText.includes("per pair of **modules** that talk to each other"),
  "what a boundary contract is for is not stated",
);

check(
  "it says a boundary contract outlives every task built against it",
  flatText.includes("outlives every task built against it"),
  "the lifetime difference is missing — that is the whole basis of the split",
);

check(
  "an interface ADR is one per task",
  flatText.includes("per **task**"),
  "what an interface ADR is for is not stated",
);

check(
  "it says the two halves are not modules but the two halves of one task",
  flatText.includes("they are the two halves of one task"),
  "the reason the halves do not deserve a boundary contract is missing",
);

check(
  "consequence one: a paired task in a one-module design still needs its ADR",
  flatText.includes("a paired task in a one-module design still needs its interface ADR"),
  "the first consequence is missing",
);

check(
  "consequence two: a paired task on a module boundary needs both files",
  flatText.includes("needs both files"),
  "the second consequence is missing",
);

check(
  "both wrong moves are forbidden by name",
  flatText.includes("Never put a task's interface into `docs/design/api/`")
    && flatText.includes("never let a boundary contract shrink into one task's ADR"),
  "one of the two collapses is not ruled out",
);

done();
