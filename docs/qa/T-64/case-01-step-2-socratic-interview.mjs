// T-64 DoD items 5 and 6 (PRD M1 DoD item 3), and T-84 DoD items 1 to 3
// (PRD M1 DoD item 10).
// Proves step 2 of `roles/pm.md` is a Socratic interview with a method — six
// kinds of question, the funnel, both failure modes and a stop rule — that the
// old open-ended sentence `Stop when the answers are settled` is gone, and that
// the step carries its own reasoning instead of a numbered pointer at
// `principles.md`.
//
// ONE HALF OF T-64 DoD ITEM 5 IS SUPERSEDED, and this file is where that shows.
// The cell asks step 2 to point at principle 22 of `principles.md`; T-84, on
// PRD M1 DoD item 10, deleted that pointer, because `principles.md` does not
// ship in the npm package. The last block of this file was turned around for it,
// with the whole story written there. The other four things item 5 asks for —
// six kinds, the funnel, no leading question, a stop rule — are unchanged.
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

// ------------------- step 2 carries its reasoning, and no numbered pointer
//
// THIS BLOCK USED TO ASK FOR THE OPPOSITE, and the flip is the point. Until
// T-84 it read `step 2 points at principle 22 in principles.md`, from T-64 DoD
// item 5. That requirement is gone: PRD M1 DoD item 10 bans a repository-internal
// pointer in a role prompt, because `principles.md` does NOT ship in the npm
// package (the `files` list in package.json does not name it). In somebody
// else's repository the sentence sent the reader to a numbered entry inside a
// file that is not there — a number into nothing. T-84 deleted the pointer and
// wrote the reasoning in place instead, so the old assertion is now red on a
// correct file. The check is turned around, not dropped: the direction changed
// and the count grew, because a rule reversed with nothing left behind is a rule
// nobody guards.
//
// THREE THINGS ARE ASSERTED, and the third is the one no other pin has.
// `docs/qa/T-67/case-03-no-principles-by-number.mjs` bans the name-first shape
// across all ten prompts, and a pin in `tools/verify-mount.mjs` bans the
// number-first shape across all ten. Both stay GREEN on a step 2 that deleted
// the pointer and put nothing in its place — which is the failure this case
// exists to catch. So the pair is asserted together, inside step 2 and nowhere
// else: no numbered pointer, AND the reasoning really is here. The two ABSENT
// halves are deliberately narrower in scope than the two whole-file pins and
// wider in direction: both word orders, because `docs/qa/gaps.md` item 29 is
// exactly the lesson that one ABSENT pin only bans the word order its author
// happened to imagine.
//
// THE POSITIVE HALF IS JUDGED BY STRUCTURE, NOT BY QUOTATION. The sentence T-84
// landed is prose and will be reworded, so pinning it word for word would buy a
// false red later (`docs/qa/gaps.md` item 31). What is required is the SHAPE of a
// reason: one sentence that weighs the two costs against each other — what
// asking one more question costs, and what a wrong opening document costs. Two
// unrelated statements in different sentences do not make that trade visible,
// which is why both halves must land inside the same sentence.
//
// The self-test below covers both matchers, for the reason `docs/qa/gaps.md`
// item 21 has been re-learned eight times in this repository: this prose wraps at
// 80 columns, so the pointer can come back with the number ending one line and
// the file name opening the next, and a line-by-line scan reads 0 on a file that
// carries it.

// The file name first, tolerating the closing mark this project writes around
// it: "`principles.md` 21", "principles.md, 21".
const NAME_FIRST = /principles\.md["'`)\]*,;:]*\s+\d/gi;
// The number first, which is how the deleted pointer was written: "principle 22
// in `principles.md`". A counting noun is required before the digit, so a
// correct sentence that happens to put a number near the name — "one of the 3
// files: `principles.md`" — cannot go red.
const NUMBER_FIRST = /\b(?:principles?|rules?|entr(?:y|ies)|items?|sections?)\s+\d+[^.\n]{0,24}?principles\.md/gi;

/** Every hit of one matcher in a piece of text, flattened first, with context. */
const pointers = (text, pattern) => [...flat(text).matchAll(pattern)]
  .map((match) => JSON.stringify(flat(text).slice(Math.max(0, match.index - 50), match.index + match[0].length).trim()));
const perLinePointers = (text, pattern) => text.split("\n").filter((line) => new RegExp(pattern.source, "i").test(line)).length;

// Both samples fold exactly where a real rewrap would fold them: between the
// number and the file name. Each must be found once flattened and be invisible
// to a line-by-line scan, or the two scans here are the same scan and the whole
// folding case is untested.
const FOLDED_NUMBER_FIRST = "its sources are principle 22\nin `principles.md`, the crew's own principles file";
const FOLDED_NAME_FIRST = "the reasoning lives in `principles.md`\n21, read it there";
check(
  "the two matchers used here find a pointer that wraps across two lines",
  pointers(FOLDED_NUMBER_FIRST, NUMBER_FIRST).length === 1
    && perLinePointers(FOLDED_NUMBER_FIRST, NUMBER_FIRST) === 0
    && pointers(FOLDED_NAME_FIRST, NAME_FIRST).length === 1
    && perLinePointers(FOLDED_NAME_FIRST, NAME_FIRST) === 0,
  `number-first sample: ${pointers(FOLDED_NUMBER_FIRST, NUMBER_FIRST).length} flattened / ${perLinePointers(FOLDED_NUMBER_FIRST, NUMBER_FIRST)} per line;`
  + ` name-first sample: ${pointers(FOLDED_NAME_FIRST, NAME_FIRST).length} flattened / ${perLinePointers(FOLDED_NAME_FIRST, NAME_FIRST)} per line.`
  + " Each must be 1 flattened and 0 per line; flattening is what makes these two checks able to fail at all",
);

const nameFirst = pointers(two, NAME_FIRST);
check(
  `step 2 does not point at principles.md by number, file name first (flattened: ${nameFirst.length}, per line: ${perLinePointers(two, NAME_FIRST)})`,
  nameFirst.length === 0,
  `${nameFirst.length} pointer(s):\n      ${nameFirst.join("\n      ")}\n      principles.md is not in the npm package, so a numbered entry in it is a number into a file that is not there`,
);

const numberFirst = pointers(two, NUMBER_FIRST);
check(
  `step 2 does not point at principles.md by number, number first either (flattened: ${numberFirst.length}, per line: ${perLinePointers(two, NUMBER_FIRST)})`,
  numberFirst.length === 0,
  `${numberFirst.length} pointer(s):\n      ${numberFirst.join("\n      ")}\n      this is the word order that walked past four pins written to ban this rule (docs/qa/gaps.md item 29)`,
);

// The positive half. Sentences are cut on `.` only, so the `;` the landed
// sentence uses to join the two costs stays inside one sentence.
const ASKING_COSTS = /(?:question|asking|ask)[^.]{0,40}\bcosts?\b|\bcosts?\b[^.]{0,30}(?:one turn|a turn)/i;
const WRONG_DOCUMENT_COSTS = /(?:wrong|bad|unclear)[^.]{0,30}(?:opening document|prd)|(?:opening document|prd)[^.]{0,40}\bcosts?\b|\bcosts?\b[^.]{0,40}(?:whole job|every task)/i;
const weighing = flatTwo.split(".").filter((sentence) => ASKING_COSTS.test(sentence) && WRONG_DOCUMENT_COSTS.test(sentence));
check(
  "step 2 says in place why the step is worth running: one sentence weighing what a question costs against what a wrong opening document costs",
  weighing.length >= 1,
  weighing.length === 0
    ? "no single sentence in step 2 holds both halves of that trade. The pointer at the reasoning was deleted on purpose (PRD M1 DoD item 10), so the reason has to be HERE — a step that only gives orders tells the PM what to do and never why it is worth a turn. Two unrelated statements in different sentences do not count: the trade is what makes it a reason"
    : `matched: ${weighing.map((sentence) => JSON.stringify(sentence.trim())).join(" | ")}`,
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
