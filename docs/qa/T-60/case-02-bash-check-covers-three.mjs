// T-60, DoD item 2: design rule 4 says the bash check now covers THREE engineer
// roles — and it keeps the hole that is still open: `crew_qa` is deliberately not
// in that list, so taking `bash` out of QA's deny list still fails no check.
//
// What it proves: both halves. A rule that only announced the widening would
// leave the next reader believing every shell role is guarded, which is exactly
// the false confidence `ADR 0010`'s closing section was written to prevent. The
// job that widened the check from one role to three was not allowed to change
// anything about QA's behaviour, so the honest record is "one of three unguarded"
// became "QA alone" — smaller, not closed.
//
// PINNING STYLE: slice LINE-BASED (`designRule(4)`), sentences FLATTENED.

import { check, designRule, done, flat } from "./claude.mjs";

const rule = flat(designRule(4));

check(
  "design rule 4 names all three shell-living engineer roles",
  rule.includes("`crew_engineer`")
    && rule.includes("`crew_test_engineer`")
    && rule.includes("`crew_code_engineer`"),
  "one of the three engineer roles is missing from the rule",
);

check(
  "it says the check covers all three",
  rule.includes("covers **all three**"),
  "the rule does not say the check was widened to three roles",
);

check(
  "it names the three parts of the check, including the self-check on renamed roles",
  rule.includes("an explicit list of role keys")
    && rule.includes("a self-check that every key in the list is really in `ROLES`"),
  "the rule does not describe how the check is built, so a green that looked at nothing cannot be spotted",
);

check(
  "the open hole is still written down: it shrank, it did not close",
  rule.includes("shrank; it did not close"),
  "the sentence keeping the hole honest is missing",
);

check(
  "the hole is named exactly: crew_qa is deliberately not in that list",
  rule.includes("`crew_qa` is deliberately **not**"),
  "the rule does not name QA as the role still unguarded",
);

check(
  "it says what that costs: bash out of QA's deny list still fails no check",
  rule.includes("still fails no check"),
  "the consequence of the open hole is not stated",
);

check(
  "it says why the hole was left: that job could not change QA's behaviour",
  rule.includes("not allowed to change anything about QA's behaviour"),
  "the reason the hole stays open is missing — without it the next reader reads it as an oversight",
);

done();
