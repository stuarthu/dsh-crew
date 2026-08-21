// T-64 DoD items 5 and 6 (PRD M1 DoD item 3).
// Proves step 2 of `roles/pm.md` is a Socratic interview with a method — six
// kinds of question, the funnel, both failure modes and a stop rule — and that
// the old open-ended sentence `Stop when the answers are settled` is gone.
//
// Two things about the method here, both of them the reason this case exists:
//
// 1. The step is cut out with `step(text, 2)` before anything is asked of it.
//    The same words — six kinds of question, funnel, leading question, the stop
//    rule — are also written in principle 22 of `principles.md` and in
//    `CHANGELOG.md`, and step 1 and step 3 of this same file talk about asking
//    the user too. A search over the whole file would therefore pass on text
//    that is not in step 2 at all, which is exactly the DoD item this case is
//    for. `docs/qa/T-68/case-02-principle-22-content.mjs` is the case that
//    reads the `principles.md` copy; this one never leaves step 2, except for
//    the one ABSENT check below, which is about the whole file on purpose.
//
// 2. The ABSENT check flattens the file first. Before this job the banned
//    sentence sat on two lines of `roles/pm.md` (`Stop when the answers are` /
//    `settled.`), so a line-by-line `grep` could never have matched it: a check
//    written that way would have been green from the minute it was written,
//    whether the sentence was there or not. PRD v3 corrected DoD item 3 for
//    exactly this, and this repository has gone red on the same trap seven
//    times (`docs/qa/gaps.md` item 21). The per-line count is printed beside
//    the flattened one so the two numbers can be compared, and a self-test
//    below proves the matching used here really does survive a line wrap.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const BANNED = "Stop when the answers are settled";
const banned = (text) => (text.match(/Stop when the answers are settled/g) ?? []).length;

const text = pm();
const two = step(text, 2);
const flatTwo = flat(two);

// ---------------------------------------------------------------- the premise
// A slice that quietly grew to the whole file would make every check below
// pass on text from somewhere else, so the cut itself is asserted first.
check(
  "step(roles/pm.md, 2) really starts at step 2",
  /^2\. \*\*/.test(two),
  `slice starts with ${JSON.stringify(two.slice(0, 40))}`,
);
check(
  "the step 2 slice is a slice, not the whole prompt",
  two.length > 500 && two.length < text.length / 4,
  `slice ${two.length} char(s), file ${text.length} char(s)`,
);

// ------------------------------------------------- six kinds of question, 6
// Every numbered list item inside step 2, with its bold label. The step's own
// opening line (`2. **Interview the user…`) starts at column 0 and the kinds
// are indented, so requiring leading whitespace keeps it out of the count.
const kinds = [...two.matchAll(/^[ \t]+(\d+)\.\s+\*\*(.+?)\*\*/gm)].map((m) => ({
  number: Number(m[1]),
  label: m[2],
}));
check(
  "step 2 lists exactly six kinds of question, numbered 1 to 6",
  kinds.map((k) => k.number).join(",") === "1,2,3,4,5,6",
  `found ${kinds.length}: ${kinds.map((k) => `${k.number}. ${k.label}`).join(" | ") || "none"}`,
);

// The six are asked for by what each one is, not by one fixed wording, so a
// reworded label still passes while a dropped kind cannot.
const labels = kinds.map((k) => k.label).join(" || ");
for (const [what, pattern] of [
  ["clarifying", /clarif/i],
  ["probing an assumption", /assumption/i],
  ["asking for reason or evidence", /evidence|reason/i],
  ["asking for another view", /another view|other view|viewpoint|alternative/i],
  ["asking what follows from it", /consequence|implication|what follows/i],
  ["questioning the question itself", /question the question|question itself/i],
]) {
  check(
    `one of the six kinds is about ${what}`,
    pattern.test(labels),
    `labels: ${labels}`,
  );
}

// ------------------------------------------------------------------ the funnel
check(
  "step 2 names the funnel",
  /funnel/i.test(flatTwo),
  "no `funnel` in step 2",
);
check(
  "step 2 says which way the funnel runs: wide first, narrow later",
  /wide first, narrow later|wide before narrow|open questions come before precise|broad before/i.test(flatTwo),
  "the word funnel alone does not say which end comes first",
);

// -------------------------------------------------------- the failure modes
check(
  "step 2 forbids a leading question",
  /leading question/i.test(flatTwo),
  "no `leading question` in step 2",
);
check(
  "step 2 says what to do instead of a leading question",
  /hides the answer|never put a question mark|go and look it up/i.test(flatTwo),
  "the ban carries no instruction, so it forbids without telling the PM what to do",
);
check(
  "step 2 forbids making the user feel tested",
  /feels? tested|feels? judged|being tested|feel examined/i.test(flatTwo),
  "the second failure mode of principle 22 is missing from the applied version",
);

// ------------------------------------------------------------- the stop rule
check(
  "step 2 has a stop rule at all",
  /when to stop|stop at the moment|stop when/i.test(flatTwo),
  "no stop rule in step 2",
);
check(
  "the stop rule is the openable one: every section of the opening document, no guess left",
  /every section of the opening document/i.test(flatTwo) && /no guess left/i.test(flatTwo),
  "a stop rule that names no condition cannot tell the PM when the interview is over",
);

// ------------------------------------------- step 2 points at principle 22
// T-64 DoD item 5 asks for the applied version to point back at the reasoning.
// `docs/qa/T-68/case-01-principle-22-shape.mjs` pins the other direction
// (principle 22 naming step 2); this half is only checkable from here.
check(
  "step 2 points at principle 22 in principles.md",
  /principle 22/i.test(flatTwo) && /principles\.md/.test(flatTwo),
  "the applied version does not say where its reasoning lives",
);

// --------------------------------------------- the old soft sentence is gone
// This one is about the whole file, not step 2: the sentence must not come back
// anywhere in the PM prompt.
const flatAll = flat(text);
const perLine = text.split("\n").filter((line) => line.includes(BANNED)).length;
check(
  "the method used here finds the banned sentence even when it wraps across lines",
  banned(flat("… Stop when the answers are\n   settled. …")) === 1 && banned("… Stop when the answers are\n   settled. …") === 0,
  "flattening is what makes this check able to fail; without it the sentence hides in a line break",
);
check(
  `roles/pm.md no longer says "${BANNED}" (flattened: ${banned(flatAll)}, per line: ${perLine})`,
  banned(flatAll) === 0,
  `the sentence is back ${banned(flatAll)} time(s) in the flattened file; the per-line count is ${perLine} and proves nothing on its own`,
);

done();
