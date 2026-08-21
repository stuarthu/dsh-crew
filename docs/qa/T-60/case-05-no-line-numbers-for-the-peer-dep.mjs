// T-60, DoD item 3, the prohibition half: `CLAUDE.md` may NOT carry a line number
// into `dsh-subagent/lib/index.js`.
//
// What it proves: a pointer that would rot silently is kept out of a living
// document. Three reasons, all in the DoD cell and all in the file: that package
// is a `peerDependencies` entry which public npm cannot install, so nobody here
// can even check the number; no check in this repository reads it, so it would rot
// with nothing going red; and one of the two error strings appears twice in that
// file (lines 890 and 1338), so a single number was never accurate anyway. The
// numbers live in `CRD 0012`, which is a snapshot of one moment and may rot
// harmlessly — that is `principles.md` 20's rule, and this case is the machine
// half of it for this one file.
//
// PINNING STYLE: LINE-BASED is correct here for once — a `path:number` pointer
// cannot wrap across a line break, and the regex looks for the shape rather than
// for one particular number.
//
// One-way: this file must never carry such a pointer. There is no "today it may".

import { check, claude, done, flat } from "./claude.mjs";

const text = claude();
const flatText = flat(text);

const pointers = [...text.matchAll(/dsh-subagent\/lib\/index\.js:\d+/g)].map((hit) => hit[0]);

check(
  "CLAUDE.md carries no line number into dsh-subagent/lib/index.js",
  pointers.length === 0,
  `found ${pointers.length}: ${pointers.join(", ")} — those numbers belong in CRD 0012, not in a living document`,
);

check(
  "it points at the CRD for the exact file and line numbers instead",
  flatText.includes("docs/decisions/crd/0012-paired-engineers.md"),
  "the pointer to the record that may hold line numbers is missing",
);

check(
  "it says why: a CRD is a snapshot of one moment and this file is not",
  flatText.includes("A CRD is a snapshot of one moment and may carry a line number; this file may not"),
  "the rule that sends the numbers to the CRD is not written down",
);

check(
  "it says the numbers point into code this repository never installs",
  flatText.includes("which this repository never installs"),
  "the reason nobody here could verify such a number is missing",
);

check(
  "it says one of the two strings appears twice anyway",
  flatText.includes("appears twice in that file anyway"),
  "the reason a single number was never accurate is missing",
);

done();
