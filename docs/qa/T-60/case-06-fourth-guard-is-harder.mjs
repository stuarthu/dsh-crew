// T-60, DoD item 4: the fourth guard is stated to be the HARDEST of the four,
// because it leans on no deny list and on no wording in any prompt.
//
// What it proves: the reader can tell which guard survives an edit. The other
// three can each be weakened by something a user or a maintainer may plausibly
// do — a `roleDeny` edit, a rewritten persona, a preset that ships a new
// messaging tool. The lineage check cannot, because it lives in dsh's own
// delivery path. Losing this sentence would flatten four guards into "four
// things that all look equally solid", and the next person choosing what to rely
// on would choose wrong.
//
// PINNING STYLE: FLATTENED, sliced to design rule 1.

import { check, designRule, done, flat } from "./claude.mjs";

const rule = flat(designRule(1));

check(
  "the fourth guard is called the hardest of the four",
  rule.includes("This is the hardest of the four"),
  "the ranking sentence is missing",
);

check(
  "the reason is named: it leans on no deny list and on no prompt wording",
  rule.includes("it leans on no deny list and on no wording in any prompt"),
  "the reason the fourth guard is harder is missing — that reason is the whole content of this DoD item",
);

check(
  "it names the three edits that cannot weaken it",
  rule.includes("a `roleDeny` edit")
    && rule.includes("a rewritten persona")
    && rule.includes("a preset that ships a new messaging tool"),
  "the edits it survives are not named",
);

check(
  "it says each of the other three CAN be weakened by exactly that",
  rule.includes("while each of the other three can be weakened by exactly that"),
  "the contrast with the other three guards is missing, so the ranking has no content",
);

done();
