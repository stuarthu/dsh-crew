// T-60, DoD items 9 and 11: `CLAUDE.md` never calls this shape "pair
// programming", and the design rules keep their numbers.
//
// What it proves two things:
//
//   * `CRD 0012` forbids the name outright — the analogy is wrong, because pair
//     programming works by two people converging and this shape works by two
//     readings deliberately NOT converging. A reader who takes the analogy home
//     will also take home pair programming's cost numbers, which is where this
//     job's cost estimate first went wrong.
//   * The design rules are cited by number — by QA cases, by the task table, and
//     by other documents. Renumbering them, or deleting one, silently redirects
//     every one of those pointers. This is a floor: rule 1 to rule N, in order,
//     none missing.
//
// PINNING STYLE: FLATTENED and case-insensitive for the banned name (this file is
// English, so the Chinese form cannot pin anything here); LINE-BASED for the rule
// markers, which cannot wrap.
//
// One-way: the banned name must stay absent, and the numbering must stay
// gap-free. A new rule appended at the end is a legitimate addition.

import { check, claude, designRuleNumbers, done, flat } from "./claude.mjs";

const hits = (flat(claude()).toLowerCase().match(/pair programming/g) ?? []).length;

check(
  "CLAUDE.md never calls this shape `pair programming`",
  hits === 0,
  `found ${hits} hit(s) — CRD 0012 forbids the name, because that analogy converges and this shape must not`,
);

const numbers = designRuleNumbers();

check(
  "the design rules are numbered 1..N with no gap and no repeat",
  numbers.length > 0 && numbers.every((number, index) => number === index + 1),
  `the rules are numbered ${numbers.join(", ")} — other documents and QA cases cite these by number`,
);

check(
  "there are at least the seven design rules this file had before the paired shape",
  numbers.length >= 7,
  `only ${numbers.length} design rule(s) left — a deleted rule silently redirects every pointer to the rules after it`,
);

check(
  "the file still says every design rule is checked by verify-mount.mjs",
  flat(claude()).includes("Each one is checked by `tools/verify-mount.mjs`"),
  "the sentence tying the rules to a machine check is missing",
);

done();
