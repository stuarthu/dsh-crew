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
// CHANGED BY T-65 (apply-req job), and it is a decision, not drift.
// This case used to assert that `A task is finished when code review passes` was
// intact. T-65 replaced that sentence with `A task is finished when its own unit
// tests pass`. The reasons are written down in
// `docs/decisions/crd/0020-apply-req-speed-items.md` item 1 (QA and the three
// reviews moved out of the per-task loop, so the old gate waited on three checks
// that have not run when a task is handed in — it could never be met, and it made
// every task unfinishable), in the PRD as A1c with B4 beside it, and in
// `principles.md` principle 6, which already says the same thing in its own words.
// `docs/decisions/adr/0018-red-existing-cases.md` decided that QA edits this
// assertion in the same commit as the prose; T-65's DoD item 8 is the box for it.
//
// STILL TRUE, AND KEPT: the old gate really was the gate until CRD 0020, and it
// existed because twenty tasks of an earlier job were called done with no code
// review at all. The only untrue part was the inference "so it is always those
// three checks".
//
// AND THE HALF THAT WAS NEVER PINNED ANYWHERE — this is the second thing this
// case now earns. `verify-mount.mjs` pins the gate sentence, and pins the old
// sentence as absent, but it says nothing about the other half of that same
// paragraph: the Verdicts line STILL carries four values, and a check that has
// not run is `not run` with its own reason, never `pass`. That half exists only
// inside the pin's failure message, which no check reads. So dropping `doc:` from
// step 10, or dropping the "never `pass`" rule, goes red NOWHERE in the project —
// exactly the shape of the `docs/qa/gaps.md` count above. T-65's own report named
// this hole and had no permission to close it; it is closed here. Losing it is
// the expensive kind of loss: `tools/verify-tasks.mjs` would still demand four
// values in `docs/design/tasks.md` (pinned by `docs/qa/T-42/case-20`), so a PM
// whose prompt no longer mentions them meets a red gate with no instructions.
//
// PINNING STYLE: LINE-BASED counting for the path (a path cannot wrap), FLATTENED
// for the two parallel anchors and the gate sentence, which are sentences, and
// STEP-SCOPED for the gate's qualifier. The window matters there: the four values
// have to sit beside the gate they qualify, and step 11 also talks about the
// Verdicts line, so a whole-file read would pass on step 11's text alone and
// prove nothing about step 10.
//
// One-way: four is a floor. A fifth mention is a legitimate addition; three is the
// silent erosion this case exists to catch.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const text = pm();
const flatText = flat(text);
// Throws when step 10 is gone, which is louder than falling back to the whole
// file: a window that silently grew would leave every check below green.
const step10 = flat(step(text, 10));

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
  "step 10 still carries a finish gate, and it is the unit-test one",
  flatText.includes("A task is finished when its own unit tests pass"),
  "the pinned sentence is gone — without it nothing in the prompt says when a task is done, and this crew ran 20 tasks with no gate at all",
);

check(
  "and the old three-check gate has not come back",
  !flatText.includes("A task is finished when code review passes"),
  "CRD 0020 replaced that gate: QA and the three reviews no longer run per task, so a gate waiting on them can never be met and no task would ever be finishable",
);

// The half of the same paragraph that nothing else pins. One check per value, so
// an edit that drops one says WHICH one.
check(
  "step 10 still says the Verdicts line carries four values",
  step10.includes("carries **four** values"),
  "the gate got lower, the Verdicts line did not: dropping this claim is how `finished` quietly becomes `nothing else to record`",
);

for (const value of ["code:", "security:", "qa:", "doc:"]) {
  check(
    `and step 10 still names the \`${value}\` value`,
    step10.includes(`\`${value}\``),
    "verify-tasks.mjs still demands all four in docs/design/tasks.md (docs/qa/T-42/case-20), so a PM whose prompt has lost this one meets a red gate with no instructions",
  );
}

check(
  "step 10 still says an unrun check is `not run` with its own reason, never `pass`",
  step10.includes("the honest value is `not run` with its own reason, never `pass`"),
  "nothing automated can catch a `pass` typed for a review nobody ran (CLAUDE.md says so about the Verdicts gate) — this sentence is the only thing standing there",
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
