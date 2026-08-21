// T-75 DoD item 9, T-76 DoD item 8, T-77 DoD item 12 (PRD A1b, and the PRD's
// own v3 -> v4 correction).
// Proves each of the three reviewer prompts carries A1b *itself*: one round per
// milestone, after the coding and after QA, on the changed part only, a re-run
// only of its own kind — and the cost of that shape written down concretely.
//
// Why one case reads three files. A1b is one rule with four landing places, and
// the failure this cell exists to stop is exactly the one that only shows when
// the files are compared: the rule was put into `roles/pm.md` alone, while the
// three reviewers kept the old many-rounds shape, so four prompts contradicted
// each other and every agent obeyed its own copy. Splitting this into three
// near-identical cases would hide the comparison it is for. A role reads its own
// prompt, never the PM's — that sentence is the whole reason for these checks
// (PRD correction record, 2026-08-21, v3 -> v4, reported by T-75's engineer).
//
// Three things about the method, each one a trap this repository has already
// fallen into:
//
// 1. Every check runs on the ONE section, cut out first, never on the whole
//    file. All three prompts talk about "the code around the change", about
//    scope, and about being called back, in other sections written long before
//    this job. A whole-file search would pass on that older text and would have
//    been green before the work was done.
//
// 2. Nothing here pins a whole sentence of the author's prose. The three files
//    were written by three different agents and are allowed to word the same
//    rule differently; a pinned sentence would go red on a legitimate rewrite
//    (`docs/qa/gaps.md` item 2 and `ADR 0004`). Each of the five things is
//    therefore judged by a small set of independent parts that must all be
//    present, and the parts are printed when one is missing.
//
// 3. The cost is the easiest of the five to answer with empty words. "There is
//    a cost to this shape" would satisfy any check that only looks for the word
//    `cost`, so the cost check here asks for the three concrete halves the DoD
//    cell names, out of `CRD 0020`: a defect is found later, the rework is
//    wider, and the user chose this trade knowingly. Two self-tests at the
//    bottom prove that judgement rejects the empty version and accepts a
//    differently worded real one.
//
// The file names and the numbers 1 to 5 are in every check name on purpose: one
// FAIL line has to say which prompt is missing which of the five things.

import { check, done, flat, repoFile, section } from "../lib/qa.mjs";

const HEADING = "One round, at the end, on the changed part only";

// One entry per reviewer. `ownRerun` is the mapping that reviewer must state
// about ITSELF: copying a neighbour's line ("a documentation change re-runs the
// doc review" inside the code reviewer's prompt) does not answer thing 4 for it.
const REVIEWERS = [
  {
    file: "roles/code-reviewer.md",
    ownRerun: /\bcode change\b[^.]{0,40}\bre-?runs? the code review\b/i,
    others: [/\bsecurity review\b/i, /\bdoc(?:umentation)? review\b/i],
    otherNames: "the security review and the doc review",
  },
  {
    file: "roles/security-reviewer.md",
    ownRerun: /\bsecurity change\b[^.]{0,40}\bre-?runs? the security review\b/i,
    others: [/\bcode review\b/i, /\bdoc(?:umentation)? review\b/i],
    otherNames: "the code review and the doc review",
  },
  {
    file: "roles/doc-reviewer.md",
    ownRerun: /\bdocumentation change\b[^.]{0,40}\bre-?runs? the doc(?:umentation)? review\b/i,
    others: [/\bcode review\b/i, /\bsecurity review\b/i],
    otherNames: "the code review and the security review",
  },
];

// ------------------------------------------------------- the five judgements
//
// Each one takes the flattened section text and returns the parts it found, so
// a failure can print which part is missing rather than just "no match".

/** Thing 1: one round per milestone, and no second round by default. */
export function thingOne(text) {
  return {
    "once per milestone": /(?:reviews?\s+(?:\*\*)?once(?:\*\*)?\s+per milestone|once per milestone|(?:only )?one round (?:per|a) milestone)/i.test(text),
    "no round two by default": /(?:no round\s+two|no second round|not a round two|no further rounds?)/i.test(text),
  };
}

/** Thing 2: the round runs at the end, after the coding and after QA. */
export function thingTwo(text) {
  return {
    "at the end of the milestone": /at the end of (?:it|the milestone)|at the end,/i.test(text),
    "after the coding": /after (?:all )?the coding|once the coding/i.test(text),
    "after QA": /after (?:the )?QA|QA has (?:finished|handed)|once QA/i.test(text),
  };
}

/** Thing 3: the changed part only — untouched work and out-of-scope work are not in it. */
export function thingThree(text) {
  return {
    "only the changed part": /only the changed part/i.test(text),
    "untouched work is not yours": /nobody touched|untouched/i.test(text),
    "nothing outside the scope of this milestone": /outside the scope/i.test(text),
  };
}

/** Thing 4: a re-run is of the caller's own kind only, and the three never re-run together. */
export function thingFour(text, ownRerun) {
  return {
    "a re-run of its OWN kind is named": ownRerun.test(text),
    "the three do not re-run together": /do not re-?run together|never re-?run together|not all three/i.test(text),
  };
}

/**
 * Thing 5: the cost, concretely. The three parts are the DoD cell's own words,
 * taken from `CRD 0020`'s "the cost, written down and not hidden" section.
 * The word `cost` alone is deliberately not enough.
 */
export function thingFive(text) {
  return {
    "a defect is found later": /found later|later than it used to|surfaces? later|defects? [^.]{0,40}later/i.test(text),
    "the rework is wider": /rework is wider|wider rework|more (?:code|work) has already been (?:built|written)/i.test(text),
    // `knowingly` on its own is not enough: the word can turn up in a sentence
    // about the reviewer's own habits. The user has to be the one accepting.
    "the user chose this trade knowingly": /chose this trade|user [^.]{0,30}(?:accepted|chose|knowingly)|(?:accepted|chosen) (?:knowingly )?by the user/i.test(text),
  };
}

const missing = (parts) => Object.keys(parts).filter((part) => !parts[part]);
const all = (parts) => missing(parts).length === 0;
const detail = (parts) => `missing: ${missing(parts).join("; ") || "nothing"}`;

// ---------------------------------------------------------------- the reading
const read = REVIEWERS.map((reviewer) => {
  const whole = repoFile(reviewer.file);
  let cut = "";
  try {
    cut = section(whole, HEADING);
  } catch {
    cut = "";
  }
  return { ...reviewer, whole, cut, flat: flat(cut) };
});

// ----------------------------------------------------------------- the premise
// A missing or runaway slice would make every check below answer about the wrong
// text, so the cut is asserted first, per file.
for (const reviewer of read) {
  check(
    `${reviewer.file}: has the "${HEADING}" section, and the cut is a slice, not the whole file`,
    reviewer.cut.length > 400 && reviewer.cut.length < reviewer.whole.length,
    `section ${reviewer.cut.length} char(s), file ${reviewer.whole.length} char(s)`,
  );
}

// -------------------------------------------------------- five things per file
for (const reviewer of read) {
  const one = thingOne(reviewer.flat);
  check(`${reviewer.file}: thing 1 of 5 — one round per milestone, no round two by default`, all(one), detail(one));

  const two = thingTwo(reviewer.flat);
  check(`${reviewer.file}: thing 2 of 5 — the round is at the end, after the coding and after QA`, all(two), detail(two));

  const three = thingThree(reviewer.flat);
  check(`${reviewer.file}: thing 3 of 5 — the changed part only`, all(three), detail(three));

  const four = thingFour(reviewer.flat, reviewer.ownRerun);
  check(`${reviewer.file}: thing 4 of 5 — a re-run is of its own kind only`, all(four), detail(four));

  const five = thingFive(reviewer.flat);
  check(`${reviewer.file}: thing 5 of 5 — the cost of this shape, concretely`, all(five), detail(five));
}

// ------------------------------------------------- the three run side by side
// A1b says the three rounds are parallel. A prompt that says "once per
// milestone" but nothing about the other two leaves its reader free to assume it
// waits for them.
for (const reviewer of read) {
  const named = reviewer.others.filter((other) => other.test(reviewer.flat)).length;
  check(
    `${reviewer.file}: the other two reviews run at the same time, each of them once`,
    /at the same time as yours|in parallel/i.test(reviewer.flat) && named === 2,
    `${named} of 2 other reviews named (expected ${reviewer.otherNames}); "at the same time" present: ${/at the same time as yours|in parallel/i.test(reviewer.flat)}`,
  );
}

// ------------------------------------------------------ the same shape, thrice
// The failure this cell is for is one file drifting away from the other two, so
// the heading itself is compared across the three.
check(
  "all three prompts carry this rule under one and the same heading",
  read.every((reviewer) => reviewer.whole.includes(`## ${HEADING}`)),
  read.map((reviewer) => `${reviewer.file}: ${reviewer.whole.includes(`## ${HEADING}`)}`).join("; "),
);

// -------------------------------------------------------------- self-tests
// A judgement nobody has watched fail is not a judgement. These two prove the
// cost check is not a word search, and that thing 1 really needs both halves.
check(
  "self-test: the cost judgement rejects empty words",
  !all(thingFive("There is a cost to this shape, and we accept it.")),
  `parts found: ${JSON.stringify(thingFive("There is a cost to this shape, and we accept it."))}`,
);
check(
  "self-test: the cost judgement accepts the same cost said differently",
  all(thingFive(
    "Bugs surface later, after more code has already been built on top, and the user chose this trade knowingly.",
  )),
  detail(thingFive(
    "Bugs surface later, after more code has already been built on top, and the user chose this trade knowingly.",
  )),
);
check(
  "self-test: the cost judgement is not satisfied by the word knowingly on its own",
  !thingFive("Never knowingly leave a check unanswered.")["the user chose this trade knowingly"],
  `parts found: ${JSON.stringify(thingFive("Never knowingly leave a check unanswered."))}`,
);
check(
  "self-test: thing 1 rejects a prompt that reviews once but never denies a round two",
  !all(thingOne("You review once per milestone, at the end.")),
  `parts found: ${JSON.stringify(thingOne("You review once per milestone, at the end."))}`,
);

done();
