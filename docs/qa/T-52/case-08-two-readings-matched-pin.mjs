// T-52, DoD item 5: principle 21 says what a green first meeting proves — "the
// two readings matched" — and says in the same breath that it does NOT mean the
// document was clear.
//
// What it proves: the single most reversible sentence in the whole design is
// written down. Everything else in principle 21 sells the shape; this is the part
// that says where it is blind (two readers making the SAME wrong assumption), and
// the arXiv source says that case is the common one. A rewrite that drops it
// leaves a rule that oversells itself, and nothing else in the repository would
// notice.
//
// This is a deliberately brittle prose pin, the same trade as `ADR 0004` and
// `ADR 0007`: a legitimate rewording has to change this case in the same commit.
// A red here is not automatically a bug in the case — read the failure, check the
// document, and only then touch this file.
//
// PINNING STYLE: FLATTENED — mandatory here. In the file the sentence reads
//
//     comes out all green, it says exactly one thing: **the two readings
//     matched**. It does **not** say the document was clear …
//
// so the pinned phrase is split across two lines by the 80-column wrap, and a
// line-based `grep -n 'the two readings matched'` reports "not there" for a
// sentence that is there. That mistake was made three times on this job in one
// day, which is why every prose pin in this folder flattens first.

import { check, done, flatten, principle, principles } from "./principles.mjs";

const text = principles();
const flatFile = flatten(text);
const twentyOne = flatten(principle(text, 21));

check(
  "the phrase `the two readings matched` is in the file",
  flatFile.includes("the two readings matched"),
  "the pin is gone. Read DoD item 5 of T-52 and CRD 0012 before changing this case",
);

check(
  "it is inside principle 21, not somewhere else",
  twentyOne.includes("the two readings matched"),
  "the phrase exists but not in principle 21, so the rule that carries it no longer says it",
);

// The DoD asks for the phrase AND its meaning: a green merge is not evidence the
// document was clear. Both halves, because the phrase alone could be used to
// claim the opposite.
check(
  "the same passage denies that a green merge means the document was clear",
  /It does \*\*not\*\* say the document was clear/.test(twentyOne),
  "the denial is missing — the phrase would then read as if a green merge proved the document",
);

check(
  "the passage forbids a report from claiming it",
  /a report may never claim that/i.test(twentyOne),
  "the rule for reports is gone (CRD 0012: 全绿不等于文档清楚)",
);

check(
  "the blind spot is named: two readers, the same wrong assumption",
  /the \*same\* wrong assumption|the same wrong assumption/.test(twentyOne),
  "principle 21 no longer names the kind of ambiguity this shape cannot catch",
);

// Changed together with principle 21 itself, in the same commit, the way
// case-01's header says such a pair must be changed. The earlier version of this
// case pinned the words "the only thing in the crew that catches a shared
// misreading", and the final doc review found that claim overstated: the code
// reviewer reads the same document too and item 6 of its own list asks it to
// check the change against every DoD item. What is true, and what this case pins
// now, is the narrower claim — QA's reading is the only one taken BEFORE it sees
// the code, so it is the only structurally independent net. Pinning the old
// wording would have turned a wrong sentence into a requirement (gaps.md 16).
check(
  "QA is named as the net that stays, on the accurate ground",
  /crew_qa/.test(twentyOne) && /structurally independent/i.test(twentyOne),
  "the sentence that keeps QA in the design (PRD 不在范围内: 改 QA 的任何行为) is gone",
);

done();
