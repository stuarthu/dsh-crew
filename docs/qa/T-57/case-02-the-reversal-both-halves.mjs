// T-57, DoD item 2: the reversal, and BOTH of its halves.
//
//   * A green first meeting is the BEST result, not a suspicious one. In the solo
//     shape a unit test never seen to fail is blocking, and the reviewer must not
//     carry that suspicion across.
//   * And it proves ONE thing only: the two readings matched. Not that the
//     document was clear.
//
// What it proves: the reviewer neither punishes the shape's best outcome nor
// accepts an overclaim about it. This is the single place in the crew where those
// two instincts collide, and `CRD 0012` items 14 and 15 required both halves in one
// passage. With only the first half a reviewer would wave through "the DoD section
// was unambiguous"; with only the second it would flag every green run as
// suspicious and the shape would become unusable.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-reviewer.md"));

check(
  "half one: a green first meeting is the best result, not a suspicious one",
  flatText.includes("A green first meeting is the best result, not a suspicious one"),
  "the reversal's first half is missing",
);

check(
  "it names the instinct being reversed: in the solo shape that would be blocking",
  flatText.includes("a unit test that was never seen to fail proves nothing"),
  "the solo rule this reverses is not named, so the reversal has nothing to push against",
);

check(
  "it says not to carry that suspicion across",
  flatText.includes("Do not carry that suspicion across"),
  "the instruction is missing",
);

check(
  "it says the green run is not a finding on its own",
  flatText.includes("it is not a finding on its own"),
  "the reviewer could still raise the green run as a defect",
);

check(
  "it says the red run still exists in this shape, and where to look for it",
  flatText.includes("The red run still exists in this shape"),
  "without this, the reviewer may conclude the paired shape has no red run at all",
);

check(
  "half two: what a green first meeting says is that the two readings matched",
  flatText.includes("the two readings matched"),
  "the reversal's second half is missing",
);

check(
  "it says it does NOT say the document was clear",
  flatText.includes("It does **not** say the document was clear"),
  "the limit on the claim is missing",
);

check(
  "turning a green meeting into `the DoD section was unambiguous` is blocking",
  flatText.includes('"the DoD section was unambiguous"') && flatText.includes("blocking"),
  "the overclaim is not made a finding, so it would pass review and be built on later",
);

done();
