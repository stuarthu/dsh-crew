// T-63, DoD items 5 and 6 (the PRD's M1 DoD item 8): `principles.md` and
// `roles/pm.md` each carry the "who writes which class of document" table, the
// two tables COVER the same classes, and every class they share names the same
// writer.
//
// WHAT THIS CASE PROVES, AND WHAT IT DELIBERATELY DOES NOT.
// DoD item 6 asks that the two tables "say the same thing". This case proves
// COVERAGE and OWNERSHIP, not synonymy:
//
//   * coverage — both tables are there, both carry the same number of class
//     rows, at least the eleven classes DoD item 5 lists appear in each of them,
//     and each of those eleven matches exactly one row per table;
//   * ownership — read row by row, in order, the short table's writer column is
//     the long table's writer column, cut short at a clause boundary.
//
// It cannot prove that two tables which name the same class in DIFFERENT WORDS
// mean the same class. That half is not testable by any case written the way
// this suite writes them: the moment the wording of one row drifts, a checker
// has only two endings — a false red, or a relaxation ("both tables have at
// least eleven rows") that proves nothing at all. The gap is real and it is not
// theoretical: the last row of these two tables differs TODAY.
// `principles.md` calls the class "and this file"; `roles/pm.md`, which is a
// different file, has to say "and the crew's principles file" to mean the same
// thing. So this case carries that one pair as DATA — both strings written out
// below — and any other pair that stops matching goes red. Closing the gap for
// real needs a pinned vocabulary of class names (the `Words we use` glossary is
// the precedent). That belongs in `docs/qa/gaps.md`, not in a checker here.
//
// THE FOUR TRAPS THIS JOB ALREADY WALKED INTO, AND HOW EACH IS CLOSED HERE.
//
//   1. A pinned phrase that moved to another line. Not a risk for the reads
//      below: a markdown table row cannot wrap, so table rows are one of the few
//      things in this repository that may be read line by line
//      (`docs/qa/gaps.md` item 21). Everything read here is a table row.
//   2. Pinning a proxy instead of the thing. The thing is the two tables, so
//      both tables are parsed and compared cell by cell — no count of a phrase
//      standing in for a table.
//   3. Reading a file that is not the file under test. Both tables are read from
//      their own file, and each read is checked against the heading it came
//      from.
//   4. A class name found SOMEWHERE ELSE answering for the table. `principles.md`
//      and `roles/pm.md` both talk about PRDs, HLDs, ADRs and CRDs in dozens of
//      places outside these tables, so a whole-file search would pass on prose
//      while the table itself was empty. Closed the way
//      `docs/qa/T-60/case-09-prd-and-hld-exist-now.mjs` closes the same hole:
//      slice the table out first, then ask inside the slice only. This case
//      slices twice over — the `## ` section, then the one markdown table inside
//      it — and proves the slice is the right one three ways: the section
//      heading, the table's own header row, and exactly one separator row (a
//      second table in the section would silently shift every row index).
//
// The row counts are printed, so a reader can see what was sliced without
// running anything else.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, done, flat, pm, section } from "../lib/qa.mjs";

// ------------------------------------------------------------ slicing a table

/** Drop the emphasis and code marks a table cell may carry, and flatten it. */
const norm = (cell) => flat(cell.replace(/\*\*/g, "").replace(/`/g, "")).trim();

/** Split one markdown table row into its normalised cells. */
const cellsOf = (row) => row.split("|").slice(1, -1).map(norm);

/**
 * The one markdown table of a `## ` section, as rows of cells.
 *
 * `where` is only used in the failure text. Every premise is asserted, not
 * assumed: a moved heading, a renamed header row or a second table in the same
 * section must go red here rather than quietly shift the rows this case then
 * compares.
 */
function tableOf(text, heading, where) {
  const slice = section(text, heading);
  const firstLine = slice.split("\n")[0].trim();
  const rows = slice.split("\n").filter((line) => line.trim().startsWith("|"));
  const separators = rows.filter((row) => /^\|[\s-|]+\|$/.test(row.trim()));

  check(
    `${where}: the "${heading}" section was sliced out`,
    firstLine === `## ${heading}`,
    `the slice starts with ${JSON.stringify(firstLine)}, not with "## ${heading}"`,
  );
  check(
    `${where}: that section holds exactly one markdown table`,
    separators.length === 1,
    `found ${separators.length} table separator row(s); with two tables in one section every row`
      + ` index below would be shifted and the comparison would be meaningless`,
  );
  check(
    `${where}: the table's header row is the who-writes-what header`,
    cellsOf(rows[0] ?? "||").join(" / ") === "Class of document / Who writes it",
    `the header row is ${JSON.stringify(rows[0] ?? "")} — this may be a different table`,
  );

  return rows.slice(2).map(cellsOf);
}

const principlesTable = tableOf(
  readFileSync(join(REPO, "principles.md"), "utf8"),
  "Who writes which document",
  "principles.md",
);
const pmTable = tableOf(pm(), "What you may write", "roles/pm.md");

console.log(`note  principles.md: ${principlesTable.length} class row(s); roles/pm.md: ${pmTable.length} class row(s)`);

// -------------------------------------------------------------------- coverage

// DoD item 5 names eleven classes the long table must cover, and DoD item 6 asks
// the short table for the same ones. Each anchor is the distinctive part of one
// class name, and each must match EXACTLY ONE row per table: an anchor that
// matched two rows would stay green after one of them was deleted, and an anchor
// matching none would be a class nobody writes down.
const CLASSES = [
  ["opening document", "the opening document of a job (a PRD)"],
  ["an hld", "the design (an HLD)"],
  ["dod section on each row", "the task table's rows and their DoD sections"],
  ["a decision about how", "a decision about how (an ADR)"],
  ["a change request", "a change request (a CRD)"],
  ["an interface contract", "an interface contract, and a paired task's interface ADR"],
  ["qa's cases", "QA's cases and the run.sh beside them"],
  ["the shared qa runner and the standing gap list", "the shared QA runner and the standing gap list"],
  ["product code and its unit tests", "product code and its unit tests"],
  ["reader-facing files", "the two READMEs and CHANGELOG.md"],
  ["the project's own rules file", "the project's own rules file, and the crew's principles file"],
];

const rowsMatching = (table, anchor) =>
  table.filter((row) => (row[0] ?? "").toLowerCase().includes(anchor));

for (const [anchor, what] of CLASSES) {
  for (const [where, table] of [["principles.md", principlesTable], ["roles/pm.md", pmTable]]) {
    const found = rowsMatching(table, anchor);
    check(
      `${where}: exactly one row is about ${what}`,
      found.length === 1,
      `${found.length} row(s) whose class cell contains ${JSON.stringify(anchor)}.`
        + ` The class cells are: ${table.map((row) => JSON.stringify(row[0])).join(", ")}`,
    );
  }
}

check(
  `principles.md covers at least the eleven classes DoD item 5 lists (${principlesTable.length} rows)`,
  principlesTable.length >= 11,
  `the table has ${principlesTable.length} class row(s), fewer than the eleven classes DoD item 5 names`,
);

check(
  "both tables carry the same number of class rows",
  principlesTable.length === pmTable.length && principlesTable.length > 0,
  `principles.md has ${principlesTable.length} class row(s) and roles/pm.md has ${pmTable.length}.`
    + ` A class dropped from one table, or added to one only, is exactly the disagreement DoD item 6`
    + ` forbids.\n      principles.md: ${principlesTable.map((row) => JSON.stringify(row[0])).join(", ")}`
    + `\n      roles/pm.md:   ${pmTable.map((row) => JSON.stringify(row[0])).join(", ")}`,
);

// ------------------------------------------------- row by row, in the same order

// The one class the two files are ALLOWED to word differently, written out in
// full because this case cannot judge synonyms and will not pretend to. Read the
// header of this file before adding a second entry: every entry here is a place
// where the two tables stopped being comparable by machine.
const KNOWN_SYNONYM = [
  {
    principles: "The project's own rules file, and this file",
    pm: "The project's own rules file, and the crew's principles file",
    why: "`principles.md` can say \"this file\"; roles/pm.md is a different file and has to name it",
  },
];

/** Clause ends the short table may legitimately stop at. */
const BOUNDARY = /^[.:;,]|^ —/;
const OWNER_FLOOR = 10;

const pairs = Math.min(principlesTable.length, pmTable.length);

for (let index = 0; index < pairs; index += 1) {
  const [principlesClass, principlesOwner] = principlesTable[index];
  const [pmClass, pmOwner] = pmTable[index];
  const allowed = KNOWN_SYNONYM.find(
    (pair) => pair.principles === principlesClass && pair.pm === pmClass,
  );

  check(
    `row ${index + 1}: both tables name the same class — ${JSON.stringify(principlesClass)}`,
    principlesClass === pmClass || allowed !== undefined,
    `principles.md says ${JSON.stringify(principlesClass)} and roles/pm.md says ${JSON.stringify(pmClass)}.`
      + ` Either one table was reworded on its own, or a row was inserted or deleted in one of them`
      + ` and every row after it is now compared against the wrong partner. If the two really mean the`
      + ` same class in different words, this case cannot tell — say so and add the pair to`
      + ` KNOWN_SYNONYM above, with the reason.`,
  );
  if (allowed) {
    console.log(`note  row ${index + 1}: known wording difference, same class — ${allowed.why}`);
  }

  // The short table's writer column must be the long table's, cut short: the
  // same text from the first character, ending either at the end of the cell or
  // at a clause boundary. The floor stops the degenerate pass — an emptied cell
  // is a prefix of everything.
  const tail = principlesOwner.startsWith(pmOwner) ? principlesOwner.slice(pmOwner.length) : null;
  check(
    `row ${index + 1}: both tables name the same writer — ${JSON.stringify(pmOwner)}`,
    tail !== null && pmOwner.length >= OWNER_FLOOR && (tail === "" || BOUNDARY.test(tail)),
    `principles.md says ${JSON.stringify(principlesOwner)} and roles/pm.md says ${JSON.stringify(pmOwner)}.`
      + ` The short table's writer column must be the long one's, cut short at a clause boundary`
      + ` (the long table may add an explanation, and nothing else).`,
  );
}

done();
