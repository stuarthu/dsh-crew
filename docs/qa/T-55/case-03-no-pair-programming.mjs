// T-55, DoD item 6: this file never calls the shape "pair programming", and it
// holds no Chinese characters.
//
// What it proves: the signpost introduced the other road without importing the
// banned analogy. This file is where the temptation is highest — it is the one
// that has to explain the paired shape in three sentences to a role that will
// never use it, and "it is like pair programming" is exactly the shortcut a
// three-sentence explanation reaches for. `CRD 0012` forbids it: the analogy
// converges and this shape must not.
//
// PINNING STYLE: FLATTENED, case-insensitive. One-way: both are absences.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/engineer.md");
const hits = (flat(text).toLowerCase().match(/pair programming/g) ?? []).length;

check(
  "the file never calls this shape `pair programming`",
  hits === 0,
  `found ${hits} hit(s)`,
);

const chinese = (text.match(/[一-鿿]/g) ?? []).length;

check(
  "the file holds no Chinese characters",
  chinese === 0,
  `found ${chinese} — roles/*.md are English`,
);

check(
  "it uses this repository's own name for the other road",
  flat(text).includes("**paired shape**"),
  "the settled name is not used",
);

done();
