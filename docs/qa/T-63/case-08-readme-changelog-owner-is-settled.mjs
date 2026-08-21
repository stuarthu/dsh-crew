// T-63 DoD item 7: the "who writes which document" table really settles who owns
// the two READMEs, `CHANGELOG.md` and the repository's own rules file — and what
// it says does not contradict step 14 of `roles/pm.md`.
//
// WHY THIS CASE EXISTS, AND WHY IT IS DIFFERENT FROM THE OTHER T-63 CASES.
// Every other case in this folder pins a string that must be there (or must be
// gone). This one pins the AGREEMENT between two files, because T-63 DoD item 7
// is the only cell of the whole task that names a question the repository could
// not answer before: `roles/pm.md` step 14 says the reader-facing files are the
// PM's own output (`These are your output too.`), while a real job did them as
// engineer task rows. Item 7 says in so many words that the two readings cannot
// both be true, and it gives exactly two ways out:
//
//   route 1: the table says the PM writes them, and `These are your output too`
//            stays in step 14;
//   route 2: the table says an engineer may write them, and that sentence is
//            changed by T-66.
//
// So there are three states, not two, and the third one is a live contradiction
// in the shipped prompts: the table hands the files to an engineer while step 14
// still calls them the PM's own output. That third state is what this case turns
// red on, and nothing else in the project can see it — `tools/verify-mount.mjs`
// reads strings one file at a time, and no check anywhere compares a row of
// `principles.md` against a step of `roles/pm.md`.
//
// HOW IT READS THE TWO SIDES.
//   * The table: the `## Who writes which document` section of `principles.md`,
//     which says of itself that it is the source and the short table in
//     `roles/pm.md` is the copy. Table rows do not wrap, so they are read line
//     by line — that is allowed for table rows and headings only.
//   * The sentence: step 14 of `roles/pm.md`, sliced out with `step()` so a copy
//     of the sentence in some other step could not answer for this one, and
//     flattened before matching, because the prose in `roles/` wraps at 80
//     columns and a line-by-line grep reads a wrapped sentence as absent. The
//     case counts the sentence flat AND line by line and says so when the two
//     numbers differ, which is the sign that it has started wrapping.
//
// WHAT IT DELIBERATELY DOES NOT DO. It does not judge which route is the right
// one — that is the PM's call, not QA's — and it does not compare the two tables
// with each other (that is the neighbouring case about the two tables agreeing).
// It also does not fail on the fourth state (the table says the PM writes them
// and the sentence is gone): that leaves step 14 silent, not contradictory, and
// item 7 does not ask for a red there. Both facts are printed as notes instead.

import { pm, repoFile, section, step, flat, check, done } from "../lib/qa.mjs";

const TABLE_SECTION = "Who writes which document";

const principles = repoFile("principles.md");
const table = section(principles, TABLE_SECTION);

/** The body rows of the one markdown table in that section. */
const rows = table
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.startsWith("|"))
  .filter((line) => !/^\|[\s|:-]+\|$/.test(line))
  .filter((line) => !/Class of document/.test(line))
  .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));

console.log(`the table in principles.md has ${rows.length} class row(s)`);

/** The row about the reader-facing files: both READMEs and the changelog. */
const readerRows = rows.filter(
  (cells) => /README/.test(cells[0]) && /CHANGELOG\.md/.test(cells[0]),
);
/** The row about the repository's own rules file. */
const rulesRows = rows.filter((cells) => /rules file/i.test(cells[0]));

check(
  "principles.md's table has exactly one row for the two READMEs and CHANGELOG.md",
  readerRows.length === 1,
  `found ${readerRows.length} such row(s) under "## ${TABLE_SECTION}"; T-63 DoD item 7 needs that row to exist before anything else here can be judged`,
);
check(
  "principles.md's table has exactly one row for the repository's own rules file",
  rulesRows.length === 1,
  `found ${rulesRows.length} such row(s) under "## ${TABLE_SECTION}"; item 7 names the rules file (CLAUDE.md here) beside the READMEs and the changelog`,
);

if (readerRows.length !== 1 || rulesRows.length !== 1) done();

const readerClass = readerRows[0][0];
const readerOwner = readerRows[0][1] ?? "";
const rulesOwner = rulesRows[0][1] ?? "";

console.log(`reader-facing row  : ${readerClass} => ${readerOwner}`);
console.log(`rules-file row     : ${rulesRows[0][0]} => ${rulesOwner}`);

/** Does that row let anybody but the PM write those files? */
const engineerMayWrite = /engineer/i.test(readerOwner);
/** Does it hand them to the PM at all? */
const pmIsNamed = /\bPM\b/.test(readerOwner);

check(
  "the reader-facing row names an owner at all",
  engineerMayWrite || pmIsNamed,
  `the owner column reads ${JSON.stringify(readerOwner)}, which names neither the PM nor an engineer, so the row answers nothing and item 7's question is still open`,
);

// ------------------------------------------------ the sentence in step 14
const step14 = step(pm(), 14);
const SENTENCE = "These are your output too";
const flatCopies = flat(step14).split(SENTENCE).length - 1;
const lineCopies = step14.split("\n").filter((line) => line.includes(SENTENCE)).length;
const sentenceStands = flatCopies > 0;

console.log(`"${SENTENCE}" in step 14 of roles/pm.md: ${flatCopies} flat, ${lineCopies} line by line`);
if (flatCopies !== lineCopies) {
  console.log("note  the sentence now wraps across lines, so any line-by-line pin on it is lying");
}

// The contradiction item 7 named. Route 1 and route 2 both pass; the third state
// — the table hands the files to an engineer while step 14 still claims them as
// the PM's own output — is the one that must be red.
check(
  "the table's owner for the reader-facing files and step 14 of roles/pm.md do not contradict each other",
  !(engineerMayWrite && sentenceStands),
  [
    "This is exactly the contradiction T-63 DoD item 7 was written to close.",
    `The table row says: ${JSON.stringify(readerOwner)} — an engineer may write those files under a task row.`,
    `Step 14 of roles/pm.md still says: ${JSON.stringify(SENTENCE)} — they are the PM's own output.`,
    "Item 7 gives two ways out and only two: EITHER the table says the PM writes them and that",
    "sentence stays, OR the table says an engineer writes them and T-66 changes that sentence.",
    "Fix one of the two files (which one is the PM's call, not QA's) — do not weaken this case.",
  ].join("\n      "),
);

// A note, not a check: the same sentence's neighbour. Step 14 also says the
// reader-facing files belong to no task, which reads oddly beside a table row
// that puts them under a task row — but it can also be read as describing only
// the path where the PM writes them itself, so it is reported and not failed.
const flatStep14 = flat(step14);
const noTask = flatStep14.indexOf("belong to no task");
if (noTask !== -1) {
  const window = flatStep14.slice(noTask, noTask + 200);
  if (/README|CHANGELOG/.test(window)) {
    console.log(`note  step 14 also says the reader-facing files belong to no task: "${window.trim()}"`);
  }
}
if (!engineerMayWrite && !sentenceStands) {
  console.log("note  the table keeps those files with the PM while step 14 no longer claims them; silent, not contradictory");
}

check(
  "the repository's own rules file stays with the PM alone",
  /\bPM\b/.test(rulesOwner) && !/engineer/i.test(rulesOwner),
  `the owner column reads ${JSON.stringify(rulesOwner)}; item 7 splits the four files into two classes on purpose — reader-facing output can be a task row, the rules the crew works under cannot`,
);

done();
