// T-56, DoD item 5: the hard limit runs the OTHER WAY and is NOT a fifth reason.
// A task whose unit tests and whose product code have to change the same file
// `may not use the pair shape`. It gets its own paragraph, outside the list of
// four.
//
// What it proves: a prohibition is not filed among recommendations. The four
// reasons all argue FOR the shape and trade against each other; this one forbids
// it and trades against nothing. Mixed into the list, it would read as a fifth
// consideration to be weighed — and a PM weighing it would eventually decide the
// other four outweigh it, which is arithmetically impossible: two file lists that
// may not overlap cannot both contain one file.
//
// DELIBERATELY FRAGILE (`ADR 0004`, `ADR 0007`): the exact phrase
// `may not use the pair shape` was 0 times in this file before this task, and the
// DoD names it as a prose pin. A legitimate rewording must change this case in the
// same commit.
//
// PINNING STYLE: FLATTENED for the phrase; the "outside the list" property is
// checked by position, which is the only way to check it at all.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const four = step(pm(), 4);
const flatFour = flat(four);

check(
  "step 4 carries the phrase `may not use the pair shape`",
  flatFour.includes("may not use the pair shape"),
  "the pinned phrase is gone — it was 0 times in this file before this task",
);

check(
  "the hard limit is introduced as running the other way, and not as a fifth reason",
  flatFour.includes("One hard limit runs the other way, and it is not a fifth reason"),
  "the limit is not marked as the opposite of the four reasons",
);

// Position: the phrase must come AFTER the four-item list, in its own paragraph —
// not inside the list. The list ends where the hard-limit paragraph begins, so the
// test is that the phrase sits past that boundary.
const listStart = four.indexOf("rests on one of four reasons");
const limitStart = four.indexOf("One hard limit runs the other way");
const phraseAt = four.indexOf("may not use the pair shape");

check(
  "the phrase sits in the hard-limit paragraph, not inside the four-item list",
  listStart !== -1 && limitStart !== -1 && phraseAt > limitStart,
  `list at ${listStart}, hard limit at ${limitStart}, phrase at ${phraseAt} — the phrase must come after the hard-limit paragraph opens`,
);

check(
  "the hard limit and the four reasons are two separate paragraphs",
  four.slice(listStart, limitStart).includes("\n\n"),
  "the two are not separated by a paragraph break",
);

check(
  "it says none of the four reasons trades against the limit",
  flatFour.includes("none of the four reasons trades against that"),
  "the limit could be read as outweighable",
);

check(
  "it gives the arithmetic: two lists that may not overlap cannot share a file",
  flatFour.includes("one file cannot be in both of them"),
  "the reason the limit is arithmetic rather than judgement is missing",
);

check(
  "it says what to do instead: split the task, or leave it solo",
  flatFour.includes("Split the task until the two halves own different files"),
  "no way out is given, so a PM meeting the limit has nowhere to go",
);

done();
