// T-65 DoD items 1 and 2 (PRD M1 DoD item 5, requirement A1b).
// Proves step 10 of `roles/pm.md` carries the new review shape: the three
// reviews (code, security, doc) run at the END of the milestone, after the
// coding and after QA, **one round each**, **in parallel**, and on **the
// changed part only** — plus the second half of A1b, that only a change of the
// same kind brings that same review back, named kind by kind.
//
// Three things about the method here, each one a lesson this repository paid
// for:
//
// 1. The step is cut out with `step(text, 10)` before anything is asked of it.
//    Words like "one round each", "in parallel" and "only the changed part"
//    also live in the Hard rules section, in step 8 and in step 15 of this same
//    file, and in `principles.md`. A search over the whole prompt would pass on
//    text that is not in step 10 at all — which is the DoD item's own check
//    ("read step 10"). The slice length is printed beside the file length so a
//    cut that quietly grew to the whole prompt is visible, and the first two
//    checks assert the cut itself.
//
// 2. Everything is matched on the FLATTENED slice. `roles/pm.md` wraps at
//    about 80 columns, and several of the sentences pinned here really do wrap
//    — `... brings that review / back` is one of them. A line-by-line grep for
//    that sentence matches nothing whether the rule is there or not, which is
//    how this repository shipped checks that could never go red
//    (`docs/qa/gaps.md` item 21, PRD v3's correction to DoD item 3). The
//    self-test below prints the per-line count next to the flattened one to
//    show the difference is real.
//
// 3. The second DoD item asks for the three kinds of change to be named ONE BY
//    ONE, so the three are looked for inside a single cut-out passage rather
//    than anywhere in step 10. Three separate mentions scattered across the
//    step would not be the rule the item asks for.
//
// What this case does NOT cover, on purpose, so it does not repeat work:
// the absence of the old multi-round wording (`same round rules`, `on every
// landing`) and the survival of `No code starts before the doc review passes.`
// belong to `docs/qa/T-65/case-03-old-round-wording-gone.mjs`; the two-step
// shape of the QA round belongs to `case-02`.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const text = pm();
const ten = step(text, 10);
const flatTen = flat(ten);

// ---------------------------------------------------------------- the premise
check(
  "step(roles/pm.md, 10) really starts at step 10",
  /^10\. \*\*/.test(ten),
  `slice starts with ${JSON.stringify(ten.slice(0, 48))}`,
);
check(
  `the step 10 slice is a slice, not the whole prompt (slice ${ten.length} char(s), file ${text.length} char(s))`,
  ten.length > 3000 && ten.length < text.length / 3,
  `slice ${ten.length} char(s), file ${text.length} char(s)`,
);

// ------------------------------------------------- flattening is load-bearing
// One of the sentences pinned below wraps across two lines in the source file.
// If the counts ever match, the wrap moved — the check still works, but the
// number printed here stops being evidence, so it is printed either way.
const WRAPPED = "brings that review back";
const perLine = ten.split("\n").filter((line) => line.includes(WRAPPED)).length;
const flattened = flatTen.split(WRAPPED).length - 1;
check(
  `flattening finds "${WRAPPED}" that a line-by-line read cannot (flattened: ${flattened}, per line: ${perLine})`,
  flattened === 1,
  "the re-run rule is not in step 10 at all, flattened or not",
);

// ------------------------------ DoD item 1: the round is at the end, not per task
check(
  "step 10 says QA and the three reviews run once per milestone, at the end of it",
  /run once per milestone, at the end of it/i.test(flatTen),
  "step 10 does not say when the round runs",
);
check(
  "step 10 says nothing in that round runs per task",
  /Nothing below runs per task/i.test(flatTen),
  "without this sentence the per-task shape is still a fair reading of the step",
);
check(
  "step 10 names what has to be finished first: the last task landed and the coding done",
  /last task of the milestone has landed/i.test(flatTen) && /the coding is finished/i.test(flatTen),
  "the step gives no starting condition, so 'at the end' names no moment",
);

// The order inside the step: QA (10c) first, then the three reviews together.
// Asserted by position, because the DoD item is about the order and not about
// two sentences existing somewhere.
const qaFirst = flatTen.search(/10c first: one round of QA/i);
const thenThree = flatTen.search(/Then 10a, 10b and 10d, in one message/i);
check(
  "step 10 runs QA first and the three reviews after it",
  qaFirst !== -1 && thenThree !== -1 && qaFirst < thenThree,
  `"10c first" at ${qaFirst}, "Then 10a, 10b and 10d" at ${thenThree}`,
);
// "…and before the commit" is the file's own order: committing is step 11.
check(
  "the round sits before the commit: step 11 is the commit step",
  /^11\. \*\*Commit\./.test(step(text, 11)),
  `step 11 starts with ${JSON.stringify(step(text, 11).slice(0, 48))}`,
);

// ------------------------------------ DoD item 1: one round each, and parallel
check(
  "step 10 says the three reviews are one round each",
  /one round each/i.test(flatTen),
  "no 'one round each' in step 10",
);
check(
  "step 10 says the three run in parallel, in one message",
  /Parallel is the default/i.test(flatTen) && /in one message/i.test(flatTen),
  "step 10 does not say the three reviews start together",
);

// --------------------------------- DoD item 1: only the changed part is in scope
check(
  "step 10 says only the changed part is in any of those rounds",
  /Only the changed part is in any of those rounds/i.test(flatTen),
  "no scope limit on the reviews in step 10",
);
check(
  "step 10 says what is out of scope: untouched work, and work outside this milestone",
  /nobody touched is not in scope/i.test(flatTen) && /outside this milestone's scope/i.test(flatTen),
  "the scope limit names no boundary, so a reviewer can read it either way",
);

// ------------------------- DoD item 1: the three reviews really are these three
for (const [what, pattern] of [
  ["10a is the code review", /10a\. Code review/i],
  ["10b is the security review", /10b\. Security review/i],
  ["10d is the doc review", /10d\. Doc review/i],
]) {
  check(`step 10 keeps its three reviews: ${what}`, pattern.test(flatTen), `no match for ${pattern}`);
}

// ---------- DoD item 2: only a same-kind change re-runs that review, kind by kind
// Cut the re-run rule out of step 10 first. The three kinds have to be named in
// ONE passage: three mentions spread over the step would not be the rule.
const ruleStart = flatTen.search(/Only a change made because of/i);
const afterStart = ruleStart === -1 ? "" : flatTen.slice(ruleStart);
const ruleEnd = afterStart.search(/\*\*The cost/i);
const rule = ruleEnd === -1 ? afterStart.slice(0, 400) : afterStart.slice(0, ruleEnd);
check(
  `step 10 has a re-run rule as one passage (${rule.length} char(s) cut out)`,
  ruleStart !== -1 && rule.length > 120 && rule.length < 600,
  `start at ${ruleStart}, ${rule.length} char(s): ${JSON.stringify(rule.slice(0, 120))}`,
);
check(
  "the re-run rule fires only on a change made because of a review's own finding",
  /Only a change made because of a review's own finding/i.test(rule),
  `passage: ${JSON.stringify(rule)}`,
);
for (const [kind, pattern] of [
  ["a code change re-runs the code review", /code change re-runs the code review/i],
  ["a documentation change re-runs the doc review", /(documentation|doc) change re-runs the doc review/i],
  ["a security change re-runs the security review", /security change re-runs the security review/i],
]) {
  check(
    `the re-run rule names this kind on its own: ${kind}`,
    pattern.test(rule),
    `passage: ${JSON.stringify(rule)}`,
  );
}
check(
  "the re-run rule says the three never come back together",
  /three never re-run together/i.test(rule),
  `passage: ${JSON.stringify(rule)}`,
);

done();
