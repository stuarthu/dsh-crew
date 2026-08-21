// T-52, DoD item 6: principle 21 writes down its two boundaries — the paired
// shape exists only in a job that has an architect (`CRD 0014` item 1), and while
// the halves are written the independence is real isolation, two git worktrees,
// not good faith (`CRD 0013` item 3).
//
// What it proves: the two corrections that arrived AFTER `CRD 0012` are in the
// rule, not only in the CRDs. `CRD 0012`'s own text says the opposite on both
// points — its pointer block names the "independence is a seatbelt, not a lock"
// section as overturned, and that section is "一条给写文档的人的指令", an
// instruction to whoever writes the documents. If principle 21 had been written
// from `CRD 0012` alone it would say the wrong thing, and it would be the newest
// and most authoritative place saying it.
//
// PINNING STYLE: FLATTENED, and scoped to principle 21's own section, so a hit
// somewhere else in this 1300-line file cannot make it pass. Both sentences wrap.
//
// One-way: both boundaries hold as long as the paired shape exists. Widening
// either of them is a CRD.

import { check, done, flatten, principle, principles } from "./principles.mjs";

const twentyOne = flatten(principle(principles(), 21));

check(
  "principle 21 names the architect",
  twentyOne.includes("architect"),
  "the word architect is nowhere in principle 21, so the CRD 0014 boundary is missing",
);

check(
  "the boundary is stated: no architect, no paired shape",
  /only in a job that has an architect/i.test(twentyOne) || /where there is no architect there is no paired shape/i.test(twentyOne),
  "principle 21 does not say the paired shape needs an architect job",
);

check(
  "the five things the architect pins are named (CRD 0014 item 3)",
  ["import path", "exported name", "signature", "return value", "error"].every((part) => twentyOne.includes(part)),
  `missing: ${["import path", "exported name", "signature", "return value", "error"].filter((part) => !twentyOne.includes(part)).join(", ")}`,
);

check(
  "principle 21 says the isolation is two git worktrees",
  /two git worktrees/i.test(twentyOne) && twentyOne.includes("git worktree add"),
  "principle 21 does not say the isolation is made of worktrees",
);

check(
  "principle 21 says it is a lock, not good faith (CRD 0013 item 3)",
  /real isolation, not good faith/i.test(twentyOne),
  "the wording that separates a lock from a seatbelt is gone — CRD 0012's overturned section says the opposite, so this sentence is the correction",
);

check(
  "principle 21 says where the lock ends (CRD 0013 item 5)",
  /the lock holds until the merge, and it ends there/i.test(twentyOne),
  "principle 21 does not say the isolation ends at the merge, which is the one place CRD 0013 admits it is deliberate",
);

done();
