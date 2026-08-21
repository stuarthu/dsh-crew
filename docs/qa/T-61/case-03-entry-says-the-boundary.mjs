// T-61, DoD item 3: the entry says where the paired shape is allowed and where it is
// not — only in a job that has an architect; small work has none.
//
// What it proves: a user does not go looking for a feature that cannot appear on
// their small job. This is the most common shape of a changelog complaint: a
// documented feature that does not show up, because its precondition was not
// mentioned. `CRD 0014` item 1 made the precondition real — five interface decisions
// have to be pinned before two halves that cannot see each other start writing, and
// only an architect writes that record.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("CHANGELOG.md"));

check(
  "the entry has a paragraph on where the shape is allowed and where it is not",
  flatText.includes("Where the paired shape is allowed, and where it is not"),
  "the boundary is not given its own paragraph",
);

check(
  "it says the shape exists only in a job that has an architect",
  flatText.includes("only in a job that has an architect"),
  "the precondition is missing",
);

check(
  "it says small work has no paired shape at all, and every row is solo",
  flatText.includes("no paired shape at all") && flatText.includes("every row is `solo`"),
  "the small-work half of the boundary is missing",
);

check(
  "it says why: the five things both halves must land on before either starts",
  flatText.includes("the same five things")
    && flatText.includes("the import path")
    && flatText.includes("what happens on an error"),
  "the reason the shape needs an architect is missing",
);

check(
  "it names the interface ADR as where those five are settled",
  flatText.includes("**interface ADR**"),
  "the record that carries the five decisions is not named",
);

check(
  "it names the other limit: the two halves cannot own the same file",
  flatText.includes("have to change the same file cannot be paired"),
  "the second boundary is missing",
);

check(
  "it says the solo shape is still the default and unchanged",
  flatText.includes("The solo shape is still the default, and not one word of it changed"),
  "a user could read the entry as a change to the road they already use",
);

done();
