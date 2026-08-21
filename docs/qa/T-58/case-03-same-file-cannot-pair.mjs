// T-58, DoD item 3: a task whose unit tests and product code must change the SAME
// FILE cannot use the paired shape. This hard constraint has to be written out.
//
// What it proves: the architect cannot mark an impossible row `pair`. This is
// arithmetic, not judgement — the two file lists may not overlap, and one file
// cannot be on both lists — and `CRD 0021`'s cost section leans on exactly that: the
// user no longer stamps the task table row by row in a big job, and the reason that
// is safe is that this constraint is checkable rather than a matter of taste.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/architect.md"));

check(
  "the file writes out the same-file constraint",
  flatText.includes("must sit in the same file"),
  "the hard constraint is missing",
);

check(
  "it is marked as a hard limit, not a preference",
  flatText.includes("a hard limit, not a preference"),
  "the constraint reads as advice, which is how an impossible row gets marked pair",
);

check(
  "the file still says why: two lists that may not overlap cannot share a file",
  flatText.includes("may not overlap"),
  "the arithmetic behind the limit is missing",
);

check(
  "the way out is given: split the task, or leave it solo",
  flatText.includes("`solo`"),
  "no alternative is offered, so the architect has nowhere to go with such a row",
);

done();
