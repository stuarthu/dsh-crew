// T-60, DoD item 3, first half — and one of the three holes this QA round was
// asked to close first: the flat rule counts FOUR guards, not three.
//
// What it proves: the count itself. `CLAUDE.md` said "three" until this task, and
// `CRD 0012` found a fourth guard that was already real in dsh — the lineage
// check on `send_message`. Nothing in `npm test` reads this file's prose, so the
// number could quietly go back to three and every check would stay green. That is
// the same shape as the accident recorded in `CRD 0010`.
//
// PINNING STYLE: slice LINE-BASED (`designRule(1)`), sentences and the count word
// FLATTENED — `**Four**` sits mid-sentence in wrapped prose.
//
// One-way: at least four guards, and each of the four named. A fifth guard found
// later is a legitimate addition; going back to three is the regression.

import { check, designRule, done, flat } from "./claude.mjs";

const rule = flat(designRule(1));

check(
  "design rule 1 says **Four** independent guards keep the crew flat",
  rule.includes("**Four**"),
  "the rule no longer counts four guards — it said three before this job and the fourth is a real dsh behaviour",
);

check(
  "the word `three` is not the count any more",
  !rule.includes("**Three** independent guards"),
  "the old count came back",
);

check(
  "guard one is there: every deny-list role denies all crew_* tools",
  rule.includes("every deny-list role denies all `crew_*` tools"),
  "the deny-list guard is missing",
);

check(
  "guard two is there: maxDepth 1, which names no tool",
  rule.includes("`maxDepth: 1`") && rule.includes("names no tool"),
  "the maxDepth guard, or the reason no config change can weaken it, is missing",
);

check(
  "guard three is there: the crew preset removes the agent-starting tools",
  rule.includes("the crew preset") && rule.includes("`subagent_fork`"),
  "the preset guard is missing",
);

check(
  "guard four is there and is announced as the fourth",
  rule.includes("which is the fourth and is described next"),
  "the fourth guard is not introduced, so the count and the list could drift apart",
);

check(
  "the rule still says why flatness matters: a grandchild out of the PM's reach",
  rule.includes("out of the PM's reach"),
  "the reason for the whole rule is missing",
);

done();
