// T-53, DoD item 13, and the premise every other pin in this folder rests on:
// this file is English, and it never calls the shape "pair programming".
//
// What it proves two things:
//
//   * `CRD 0012` forbids the name. Pair programming works by two people
//     converging through constant talk; this shape works by two readings
//     deliberately not converging. An agent that reads the analogy in its own
//     system prompt may act on it — and the first thing it would do is try to
//     talk to the other half, which is the one thing the shape forbids.
//   * The file holds no Chinese characters. Every `roles/*.md` is English, and
//     that is why the DoD's own verification cells pin English nouns: a Chinese
//     string checked here could never fail, so it would prove nothing. Keeping
//     the file English is what keeps those cells meaningful.
//
// PINNING STYLE: FLATTENED and case-insensitive for the banned name.
//
// One-way: both are absences that must hold for ever.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/test-engineer.md");
const hits = (flat(text).toLowerCase().match(/pair programming/g) ?? []).length;

check(
  "the file never calls this shape `pair programming`",
  hits === 0,
  `found ${hits} hit(s) — the analogy converges, and this shape must not`,
);

const chinese = (text.match(/[一-鿿]/g) ?? []).length;

check(
  "the file holds no Chinese characters",
  chinese === 0,
  `found ${chinese} Chinese character(s) — roles/*.md are English, which is what makes the English pins in the DoD meaningful`,
);

check(
  "the file uses this repository's own name for the shape",
  flat(text).includes("the paired shape"),
  "the settled name is not used, so nothing anchors the vocabulary",
);

check(
  "and says that is the only name for it",
  flat(text).includes("that is the only name for it"),
  "the file does not close the door on other names",
);

done();
