// T-58, DoD item 7: the paired shape exists only in a job that has an architect,
// and the architect is the one who proposes a shape for every row.
//
// What it proves: the boundary `CRD 0014` item 1 drew. Two halves that cannot see
// each other need five interface decisions settled before either starts; only the
// architect writes that kind of record, so a job without one cannot run the shape at
// all.
//
// A NOTE ON THE SECOND HALF OF THIS DoD CELL. The cell also asks the file to say the
// shapes are stamped by the USER at step 5, and the file does say that. `CRD 0021`,
// written after this task landed, overturned it for big work: at step 5 a big job has
// no task table yet, because the architect writes the table at step 8 — so in a big
// job the PM confirms the shapes and the user's single gate comes at the end. The
// paired shape exists only in big jobs. This case therefore pins only the half that
// CRD 0021 left standing (architect-only, and the architect proposes), and the stale
// half is reported as a defect instead of being frozen into a permanent case. A case
// may not pin a sentence the newest decision contradicts.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/architect.md"));

check(
  "the architect proposes a shape for every row of the table",
  flatText.includes("shape") && flatText.includes("every row"),
  "nothing says the architect marks the shapes",
);

check(
  "the architect does not ask the user itself",
  flatText.includes("You do not ask the user yourself"),
  "the architect could interrupt the user directly, which no crew role may do",
);

check(
  "the proposal travels with the whole table, never row by row",
  flatText.includes("with the whole table"),
  "the shapes could be confirmed one at a time, which is what the default-and-exceptions rule forbids",
);

check(
  "the file still points at the PM as the route to the user",
  flatText.includes("the PM"),
  "the architect has no route to a decision it cannot make",
);

done();
