// T-60, DoD item 5: the same place says what the fourth guard does NOT do. Two
// things, and both matter.
//
//   * It did not reopen a sideways channel. What `send_message` buys is the PM
//     waking its OWN child again with that child's context intact — which is why
//     `roles/pm.md` is allowed to say "wake that engineer again". Child to child
//     is still refused.
//   * It says nothing about the code engineer not reading the unit tests. That
//     one is held by the two git worktrees, not by lineage.
//
// What it proves: the guard is not over-claimed. Losing the first half would let
// a reader think siblings can now talk; losing the second would let a reader
// think lineage keeps the code half away from the tests, and then dropping a
// worktree would look harmless. Both are exactly the kind of wrong conclusion
// that gets built on later.
//
// PINNING STYLE: FLATTENED, sliced to design rule 1.

import { check, designRule, done, flat } from "./claude.mjs";

const rule = flat(designRule(1));

check(
  "the rule says there are two things this guard does not do",
  rule.includes("Two things this guard does **not** do"),
  "the limits paragraph is missing",
);

check(
  "limit one: it did not reopen a sideways channel",
  rule.includes("It does not reopen a sideways channel"),
  "the first limit is missing",
);

check(
  "it says what send_message really buys: the PM waking its own child again",
  rule.includes("the **PM** waking its own child again with that child's context intact"),
  "the legitimate use is not described, so the limit reads as a contradiction of roles/pm.md",
);

check(
  "it says child to child is still refused",
  rule.includes("child to child is still refused"),
  "the sentence closing the sideways channel is missing",
);

check(
  "limit two: it says nothing about the code engineer not reading the unit tests",
  rule.includes("not reading the unit tests"),
  "the second limit is missing",
);

check(
  "it names what does hold that: the two git worktrees",
  rule.includes("held by the two git worktrees"),
  "the real mechanism for test isolation is not named — a reader could then drop a worktree believing lineage covers it",
);

done();
