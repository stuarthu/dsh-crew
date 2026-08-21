// T-55, DoD item 2, the half a permanent case can actually hold: the behaviour
// rules are still there.
//
// WHAT THIS CASE DELIBERATELY DOES NOT DO. The DoD verifies item 2 with
// `git diff roles/engineer.md` — no deleted lines, no rule rewritten. That is a
// statement about one moment in history, not a standing property of the file, and
// `ADR 0013` keeps a permanent case to one-way assertions. A case cannot re-read a
// diff that will be a hundred commits old next month.
//
// So this case holds the FLOOR instead: the rules T-55 was forbidden to touch are
// still in the file. That is one-way and it stays true for ever — the signpost was
// allowed to ADD, never to remove. If a later change deletes the solo engineer's
// test-first rule or its git ban, this case goes red even though the diff T-55
// produced is long gone.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/engineer.md"));

check(
  "the solo engineer still works test first",
  flatText.includes("test first") || flatText.includes("unit test first"),
  "the rule that defines the solo road is gone",
);

check(
  "it still has to see the unit test fail before writing the code",
  flatText.includes("fail") && flatText.includes("before"),
  "the red-first requirement is gone",
);

check(
  "the git ban is still there",
  flatText.includes("commit") && flatText.includes("PM"),
  "the rule that keeps git in the PM's hands is gone",
);

check(
  "the rule against weakening an assertion is still there",
  flatText.includes("weaken"),
  "the assertion rule is gone",
);

check(
  "the role still reports to the PM alone",
  flatText.includes("is the only one you talk to"),
  "the reporting rule is gone",
);

check(
  "the file is still the full persona, not a signpost that replaced it",
  repoFile("roles/engineer.md").length > 6000,
  `the file is only ${repoFile("roles/engineer.md").length} characters — the signpost was meant to be added to the rules, not to replace them`,
);

done();
