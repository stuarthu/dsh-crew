// T-54, DoD item 13: this file never calls the shape "pair programming", and it
// holds no Chinese characters.
//
// What it proves: see the twin case in `docs/qa/T-53/`. Two points specific to
// this half: the code engineer is the one an operator is most likely to compare to
// "the other person in the pair", and it is the half with the shell. An agent that
// reads the pair-programming analogy in its own system prompt has a reason to seek
// the other half out — and this is the role best equipped to try.
//
// The English-only check is the premise the DoD's own verification cells depend
// on: they pin English nouns, and a Chinese string pinned in this file could never
// fail.
//
// PINNING STYLE: FLATTENED, case-insensitive. One-way: both are absences.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/code-engineer.md");
const hits = (flat(text).toLowerCase().match(/pair programming/g) ?? []).length;

check(
  "the file never calls this shape `pair programming`",
  hits === 0,
  `found ${hits} hit(s) — CRD 0012 forbids the name, because that analogy converges and this shape must not`,
);

const chinese = (text.match(/[一-鿿]/g) ?? []).length;

check(
  "the file holds no Chinese characters",
  chinese === 0,
  `found ${chinese} — roles/*.md are English, which is what makes the DoD's English pins meaningful`,
);

check(
  "the file uses this repository's own name for the shape",
  flat(text).includes("the **paired shape**"),
  "the settled name is not used",
);

check(
  "it says the two readings are meant to stay apart, not to converge",
  flat(text).includes("meant to stay apart, not to converge"),
  "the sentence that separates this shape from the banned analogy is missing",
);

done();
