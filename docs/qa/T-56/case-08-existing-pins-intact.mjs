// T-56 DoD item 10 and T-62 DoD item 12: neither task broke a pin that was already
// on `roles/pm.md`. This is the file with the most pins on it in the repository.
//
// THE ONE THAT EARNS THIS CASE. `docs/qa/gaps.md` appears in `roles/pm.md` four
// times, and `tools/verify-mount.mjs:820` only requires THREE or more in the PM's
// section — while `host/crew.js` treats the whole of `roles/pm.md` as that section.
// So deleting one of the four does NOT go red anywhere in the project. Both DoD
// cells say so explicitly and call this cell the insurance. That is what this case
// is: the count of four, pinned where nothing else pins it.
//
// PINNING STYLE: LINE-BASED counting for the path (a path cannot wrap), FLATTENED
// for the two parallel anchors, which are sentences.
//
// One-way: four is a floor. A fifth mention is a legitimate addition; three is the
// silent erosion this case exists to catch.

import { check, done, flat, pm } from "../lib/qa.mjs";

const text = pm();
const flatText = flat(text);

const gaps = (text.match(/docs\/qa\/gaps\.md/g) ?? []).length;

check(
  "roles/pm.md still points at docs/qa/gaps.md four times",
  gaps >= 4,
  `found ${gaps} — verify-mount.mjs only requires 3 or more, so losing one goes red NOWHERE else in the project`,
);

// The two parallel anchors are different strings on purpose, one in step 9 and one
// in step 10, and verify-mount.mjs pins each separately.
check(
  "the step 9 anchor `Parallel by default` is intact",
  flatText.includes("Parallel by default"),
  "verify-mount.mjs pins this exact string",
);

check(
  "the step 10 anchor `Parallel is the default` is intact",
  flatText.includes("Parallel is the default"),
  "verify-mount.mjs pins this one separately — the two strings are not interchangeable",
);

check(
  "`A task is finished when code review passes` is intact",
  flatText.includes("A task is finished when code review passes"),
  "a pinned sentence is gone",
);

check(
  "the `scope:` anchor is intact",
  text.includes("`scope:"),
  "a pinned string is gone",
);

check(
  "the PM prompt still names crew_engineer",
  flatText.includes("crew_engineer"),
  "the solo engineer tool is no longer named",
);

for (const forbidden of ["{{", "dod.md", "host/git-guard.js", "publishingWorkflow()", "branchPushTriggers()"]) {
  check(
    `roles/pm.md still contains no ${forbidden}`,
    !text.includes(forbidden),
    forbidden === "{{"
      ? "dsh would try to interpolate it at mount time"
      : "the PM prompt must not point at this package's own internals — it ships to every project (docs/qa/T-01/case-16)",
  );
}

done();
