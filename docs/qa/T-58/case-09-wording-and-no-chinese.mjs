// T-58, DoD item 10: the file never calls the shape "pair programming", and holds
// no Chinese characters.
//
// What it proves: the vocabulary rule holds in the file that DEFINES the shape for
// the role that marks the rows. `CRD 0012` banned the name because the analogy
// converges and this shape must not. An architect carrying the analogy would mark
// rows `pair` for the reasons pair programming is chosen — a tricky piece of code,
// a junior on the team — instead of the four reasons `CRD 0012` fixed, which are
// about a document being readable two ways.
//
// PINNING STYLE: FLATTENED, case-insensitive. One-way: both are absences.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/architect.md");
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
  `found ${chinese} — roles/*.md are English, which is what makes the DoD's English pins meaningful`,
);

check(
  "the precise noun `unit test` is used for what the test half writes",
  flat(text).includes("unit test"),
  "the glossary noun is missing",
);

check(
  "no `dod.md`, no `{{`, and the ADR folder is still named",
  !text.includes("dod.md") && !text.includes("{{") && text.includes("docs/decisions/adr/"),
  "a string verify-mount.mjs pins on this file has changed",
);

done();
