// T-64 DoD item 1 (PRD M1 DoD item 6): `roles/pm.md` offers exactly two lanes,
// `ask` and `team`, the third lane is gone from the lane list, and every
// backticked `quick` still left anywhere in the file sits inside the note that
// says that lane was cancelled.
//
// Why it is written this way, and not as a count:
//
//   `grep -c 'quick' roles/pm.md` is the proxy metric this job's PRD corrected
//   twice. The file carries the ordinary English phrase `a quick look` (the
//   researcher lane, "when the digging is bigger than a quick look"), which has
//   nothing to do with a crew lane and stays after the change. So that number is
//   never 0, and a check built on it can neither go green honestly nor go red
//   when the lane comes back. This case counts only the **backticked** form and
//   asks WHERE each hit is, so the cancellation note is free to name the lane it
//   cancelled while a lane row named `quick` is still caught.
//
//   Two lanes present is also not enough on its own. A file with no `quick`
//   anywhere and only ONE lane left is just as broken, so the lane list is
//   counted from its rows and the set of names is compared, not searched.
//
// Everything is matched on flattened text (`flat()`), never line by line: this
// repository has gone red seven times over a pinned string that a line wrap had
// split in two.
//
// Reads one file: `roles/pm.md`. Writes nothing.

import { pm, section, flat, check, done } from "../lib/qa.mjs";

const HEADING = "Step 1: pick a lane, every time";
const LANES = ["ask", "team"];
const BACKTICKED = "`quick`";

const text = pm();

// ---------------------------------------------------------------- the section

let laneSection = null;
let sectionError = "";
try {
  laneSection = section(text, HEADING);
} catch (error) {
  sectionError = String(error?.message ?? error);
}
check(
  `roles/pm.md still has a "## ${HEADING}" section`,
  laneSection !== null,
  `${sectionError} — the lane list moved or was renamed, so nothing below could be judged`,
);
if (laneSection === null) done();

// ------------------------------------------------------- the cancellation note
//
// The note is found by what it says, not by its exact sentence: the paragraph of
// the lane section that states there is no third lane and that it was cancelled.
// Anchoring on one full sentence would make a reworded but correct note red.

const paragraphs = laneSection.split(/\n\s*\n/);
const noteIndex = paragraphs.findIndex(
  (paragraph) => /third lane/i.test(paragraph) && /cancel/i.test(paragraph),
);
const note = noteIndex === -1 ? "" : paragraphs[noteIndex];

check(
  "the lane section says in so many words that the third lane is cancelled",
  noteIndex !== -1,
  "no paragraph in the lane section mentions both a third lane and its cancellation; "
    + "T-64 DoD item 1 asks for a sentence saying it was cancelled, and why, written where the lane used to be",
);

// "and why": a reason word has to be there. This proves a reason was written
// down, not that the reason is a good one — see docs/qa/gaps.md.
check(
  "the cancellation note gives a reason, not only the fact",
  /\b(reason|because|why)\b/i.test(note),
  `the note holds none of "reason", "because" or "why": ${JSON.stringify(flat(note).slice(0, 200))}`,
);

// ------------------------------------------------------------- the lane list
//
// Only the rows BEFORE the cancellation note count as lanes, so prose further
// down the section that happens to backtick a word is never mistaken for a lane.

const listText = (noteIndex === -1 ? paragraphs : paragraphs.slice(0, noteIndex)).join("\n\n");
const rows = [...listText.matchAll(/^[-*]\s+`([^`\n]+)`\s*(?:[—–-]|:)/gm)].map((match) => match[1]);

check(
  `the lane list offers exactly ${LANES.length} lanes`,
  rows.length === LANES.length,
  `found ${rows.length}: ${JSON.stringify(rows)} — a third lane back in the list, a lane deleted, `
    + "or the list rewritten in a shape this case cannot read; all three need a human to look",
);

for (const lane of LANES) {
  check(
    `the \`${lane}\` lane is one of them`,
    rows.includes(lane),
    `the lane list holds ${JSON.stringify(rows)}`,
  );
}

check(
  "the lane list holds no lane beyond those two",
  rows.every((lane) => LANES.includes(lane)),
  `unexpected lane(s): ${JSON.stringify(rows.filter((lane) => !LANES.includes(lane)))}`,
);

// ------------------------------------- where the backticked `quick` may appear
//
// Counted on flattened text on both sides, so a hit that a line wrap split, or a
// note whose sentences wrap, is still matched. Equal totals mean every hit lies
// inside the note; one hit anywhere else makes the numbers differ.

const copies = (haystack) => haystack.split(BACKTICKED).length - 1;
const inFile = copies(flat(text));
const inNote = copies(flat(note));

console.log(`      ${BACKTICKED} in roles/pm.md: ${inFile}, of those inside the cancellation note: ${inNote}`);
console.log(`      bare "quick" (the prose the old check counted): ${flat(text).split("quick").length - 1}`);

check(
  `every ${BACKTICKED} in roles/pm.md sits inside the cancellation note`,
  inFile === inNote,
  `${inFile} occurrence(s) in the file, ${inNote} of them inside the note — `
    + `${inFile - inNote} elsewhere, which is the cancelled lane living on outside its own obituary`,
);

done();
