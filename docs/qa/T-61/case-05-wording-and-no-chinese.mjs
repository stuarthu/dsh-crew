// T-61, DoD item 6: `CHANGELOG.md` never calls the shape "pair programming", and it
// holds no Chinese characters.
//
// What it proves: the vocabulary rule holds in the most public file of all — the one
// a user reads when deciding whether to upgrade. `CRD 0012` banned the name because
// the analogy converges while this shape depends on not converging, and a user who
// takes the analogy home also takes home pair programming's cost figures, which is
// exactly how this job's own cost estimate first went wrong.
//
// PINNING STYLE: FLATTENED, case-insensitive. One-way: both are absences.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("CHANGELOG.md");
const hits = (flat(text).toLowerCase().match(/pair programming/g) ?? []).length;

check(
  "CHANGELOG.md never calls this shape `pair programming`",
  hits === 0,
  `found ${hits} hit(s)`,
);

const chinese = (text.match(/[一-鿿]/g) ?? []).length;

check(
  "CHANGELOG.md holds no Chinese characters",
  chinese === 0,
  `found ${chinese} — this file is English`,
);

check(
  "it uses the repository's own name for the shape",
  flat(text).includes("**paired shape**"),
  "the settled name is not used",
);

check(
  "it says the shape is the opposite of two people at one keyboard",
  flat(text).includes("the opposite of two people at one keyboard"),
  "the contrast that replaces the banned analogy is missing",
);

check(
  "and names the reason: those two converge, these two must not",
  flat(text).includes("those two are meant to converge, and these two are meant not to"),
  "the reason is missing",
);

check(
  "the precise nouns are used: unit tests, and product code",
  flat(text).includes("unit test") && flat(text).includes("product code"),
  "the glossary nouns are missing",
);

done();
