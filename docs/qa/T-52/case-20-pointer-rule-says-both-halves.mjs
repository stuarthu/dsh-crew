// T-52, DoD item 20 — the "what it says" half of it. The task row states exactly
// two things the rule has to make clear:
//
//   (a) when pointing at a document in this repository, name the section heading
//       or quote the sentence — not a line number;
//   (b) a line number is allowed only inside a record that is never rewritten
//       (a CRD or an ADR), because such a file is never revised, so a number that
//       rots inside one does no harm.
//
// What it proves: that both halves are really written, and written together. Half
// (a) alone is a ban with no allowance, and every pointer in the four records that
// keep their line numbers today (`CRD 0014` twice, `ADR 0011`, `ADR 0009`) becomes
// a violation the next reader will "fix" by rewriting a record that must never be
// rewritten. Half (b) alone is an allowance with no rule. The value of this rule is
// not theory: principle 6 was rewritten in place, grew by thirty-four lines, and
// ten pointers written as a line number became wrong at the same moment with
// nothing going red.
//
// Overlap with case-19, on purpose and kept small: case-19 pins WHERE the rule
// lives (inside principle 20, no new number, and the file obeying its own ban).
// This case pins WHAT it says. Neither one alone covers DoD item 20.
//
// PINNING STYLE: FLATTENED, and scoped to principle 20's section. Every sentence
// involved wraps at 80 columns, so a line-based pin would report "not there" for
// text that is there (see the wrapping note in ./principles.mjs).
//
// One-way: both halves are permanent. Half (b) may never be widened to a living
// document without overturning the incident it is built on, and half (a) may never
// be dropped while any pointer in this repository is written by hand.

import { check, done, flatten, principle, principles, sentencesWith } from "./principles.mjs";

const text = principles();
const twenty = principle(text, 20);
const flatTwenty = flatten(twenty);

// ------------------------------------------------- half (a): name it, do not number it

check(
  "(a) the rule says a pointer names the section heading it means",
  /names the section heading/i.test(flatTwenty),
  "principle 20 never says to name the section heading, so the rule gives no replacement for the line number",
);

check(
  "(a) the rule offers quoting the sentence as the other way",
  /quotes the sentence|quotes the words/i.test(flatTwenty),
  "the rule offers only one way to write a pointer; the DoD names two (the section heading OR a quoted sentence)",
);

const banned = sentencesWith(twenty, "line number").filter((sentence) => /never|not/i.test(sentence));

check(
  "(a) the line number is refused for a document in this repository",
  banned.some((sentence) => /never points with a line number|not point with a line number/i.test(sentence)),
  `principle 20 mentions a line number in ${banned.length} sentence(s), none of which refuses it outright:\n      ${banned.map((sentence) => sentence.slice(0, 140)).join("\n      ")}`,
);

// ------------------------------------------------- half (b): allowed only in a record

const allowance = sentencesWith(twenty, "still allowed");

check(
  "(b) the rule says where a line number is still allowed",
  allowance.length >= 1,
  "principle 20 bans the line number and never says where it is still fine — which turns the four records that keep theirs into violations",
);

check(
  "(b) the allowance is a record that is never rewritten",
  /record that is never rewritten/i.test(flatTwenty),
  "the allowance does not rest on the file never being rewritten, which is the only reason it is safe",
);

check(
  "(b) the allowance names the CRD and the ADR as that kind of record",
  /\bCRD\b/.test(flatTwenty) && /\bADR\b/.test(flatTwenty) && /a CRD or an ADR|an ADR or a CRD/i.test(flatTwenty),
  "the two record kinds are not named together, so a reader cannot tell which files the allowance covers",
);

check(
  "(b) the allowance says why it is harmless (the number rots honestly)",
  /rots? honestly|rots inside/i.test(flatTwenty),
  "the allowance is stated with no reason; this file's own shape requires the why next to the rule",
);

check(
  "(b) the living documents are named as the side that gets no line number",
  /alive and gets revised|is alive and gets revised/i.test(flatTwenty) && /the pointer names the section or quotes the words/i.test(flatTwenty),
  "the rule never says what to do in a document that is still being revised, which is every document the pointer rot actually happened in",
);

done();
