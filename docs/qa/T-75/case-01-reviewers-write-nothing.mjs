// T-75 DoD item 5, T-76 DoD item 5 and T-77 DoD item 5 (the PRD's A3 = B11, and
// its M1 DoD items 7 and 8).
//
// What it proves: each of the three reviewer prompts —
// `roles/code-reviewer.md`, `roles/security-reviewer.md` and
// `roles/doc-reviewer.md` — says IN ITS OWN WRITE-SET STATEMENT that its write
// set is empty and that its report is its only output; and neither of the two
// "who writes which document" tables hands a reviewer a class of document to
// write, which would make all three statements false.
//
// WHY THIS CASE EXISTS. The three DoD items give exactly two ways to check
// themselves: "read that section", and `node tools/verify-mount.mjs` green.
//
//   * "read that section" is a person reading, not a check that can be re-run.
//     It is also the whole substance of the item ("and it must say so"), so the
//     main half of three DoD items is guarded by nothing at all.
//   * `tools/verify-mount.mjs` is a UNIT TEST, and it pins the TOOL TABLE: no
//     role key containing `review` may allow `write` or `edit` (design rule 2).
//     That is a different fact. It says nothing about whether the prompt the
//     role actually reads states the rule. A role reads its own prompt, not the
//     tool table — the same argument the PRD's v4 correction makes about A1b.
//
// So this case is not a second copy of a unit test, and it is deliberately not
// one of the T-63 cases either: `case-01` proves the ten prompts HAVE the
// write-set section, `case-04` proves the "Reading is not restricted" line
// closes it, `case-05` proves it names classes and not file names, and
// `case-07` proves the two who-writes tables agree WITH EACH OTHER. None of
// them asks what the three reviewers' sections SAY, and `case-07` stays green
// if both tables gain the same wrong row.
//
// WHY THE JUDGEMENT IS STRUCTURAL AND NOT A COPIED SENTENCE. The three DoD
// items give no anchor string at all — item 5 of T-76 and T-77 say only "same as
// T-75 item 5". The three files really do word it three different ways, and the
// wording they share is smaller than any one of the three sentences:
//
//   code-reviewer.md:     "**Your own write set is empty.** ... Your one output
//                          is your **report**, and the report is the last
//                          message you send back to the PM — a message, not a
//                          file."
//   security-reviewer.md: "**Your write set is empty.** ... **Your report is
//                          your only output**, and it is the last message you
//                          send to the PM, not a file on disk."
//   doc-reviewer.md:      "**Your write set is empty.** ... **Your report is
//                          your only output, and it is not a file.**"
//
// Pinning any one of those sentences would be a check that only ever held for
// one file. So three structural things are asked of each file instead: the
// phrase `write set is empty`, which is the load-bearing string all three
// share; a sentence carrying both `report` and `only`/`one output`; and the
// claim that the report is not a file. The third one is this case's own
// addition rather than a literal DoD requirement, and it is here because
// without it the other two contradict each other: a report that were a file
// would mean the write set is not empty. All three files carry it today.
//
// FOUR TRAPS THIS CASE IS BUILT AROUND, all of them measured in this job
// (`ADR 0023`, and `docs/qa/gaps.md` items 21, 27, 28 and 31):
//
//   1. Prose wraps at 80 columns, so nothing is read line by line except
//      markdown table rows and headings, which cannot wrap. Every prose read
//      below happens after `flat()`.
//   2. The anchors in this repository's documents are often the RENDERED shape,
//      not the bytes. Every prose read below also strips `` ` ``, `*`, `_` and
//      `\` first, so `**Your write set is empty.**` and `Your write set is
//      empty.` both match.
//   3. `flat` is not a shell command, so a verification command copied verbatim
//      from the task table prints 0 without reading a byte. Nothing here shells
//      out; the `flat()` helper does the work.
//   4. A check that reads the wrong slice, or an empty one, is a green that
//      looked at nothing. Every slice below is proved before it is judged: the
//      write-set statement must start with its own heading, be at least 200
//      characters long and contain no `###` subsection; each table must have
//      exactly one header row, exactly one separator row, and at least ten
//      two-cell data rows.
//
// WHAT THE SLICE IS, AND WHY IT STOPS AT THE FIRST `###`. `principles.md`, in
// `### The shape of a role's write set`, says the "Reading is not restricted"
// line "ends the write-set statement and not the section", and that rule A and
// rule B "follow it in subsections of their own". So the write-set STATEMENT is
// the text from the `## What you may write` heading to the first `### ` under
// it. Judging the whole `## ` section instead would let a prompt satisfy this
// case with a sentence buried inside its rule A subsection, where no reader
// looking for its write set would find it.
//
// WHAT THIS CASE CANNOT PROVE. That the section reads clearly, or that a reader
// would understand it — `docs/qa/gaps.md` items 1 and 2. It holds the floor:
// the three load-bearing claims are present, in the right slice, in all three
// files. A reworded claim goes red on purpose; the fix is to change this case in
// the same commit as the rewording (`ADR 0018`), never to widen the assertion.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, done, flat, repoFile } from "../lib/qa.mjs";

const WRITE_SET_HEADING = "## What you may write";
const TABLE_HEADER = "| Class of document | Who writes it |";

const REVIEWERS = [
  "roles/code-reviewer.md",
  "roles/security-reviewer.md",
  "roles/doc-reviewer.md",
];

/**
 * Drop the markdown emphasis and code markers, then collapse whitespace. Trap 1
 * and trap 2 together: the anchors below are about words, not about where a line
 * wraps or how a phrase happens to be marked up today.
 */
const plain = (text) => flat(text.replace(/[`*_\\]/g, ""));

/** Sentences of an already-flattened string. */
const sentences = (text) => text.split(/(?<=[.!?])\s+/).filter((s) => s.trim() !== "");

/**
 * The write-set STATEMENT of one role prompt: from its `## What you may write`
 * heading to the first `### ` beneath it (or to the next `## ` when a prompt has
 * no subsections there).
 *
 * Throws when the shape has moved. That is deliberate: a slice that quietly came
 * back empty would let every assertion below pass on nothing, which is the
 * failure `docs/qa/gaps.md` item 21 calls "a green check that looked at nothing".
 */
function writeSetStatement(relative) {
  const text = repoFile(relative);
  const headings = text.split("\n").filter((line) => line.trim() === WRITE_SET_HEADING);
  if (headings.length !== 1) {
    throw new Error(
      `${relative} has ${headings.length} lines reading exactly "${WRITE_SET_HEADING}", expected 1`
      + " — the write-set section moved or was renamed, so this case cannot tell which text to judge."
      + " Find the new shape and teach this case about it on purpose.",
    );
  }
  const start = text.indexOf(WRITE_SET_HEADING);
  const rest = text.slice(start + WRITE_SET_HEADING.length);
  const stops = [rest.indexOf("\n### "), rest.indexOf("\n## ")].filter((at) => at !== -1);
  const end = stops.length === 0 ? rest.length : Math.min(...stops);
  return text.slice(start, start + WRITE_SET_HEADING.length + end);
}

// ------------------------------------------------- the three write-set statements

const statements = new Map();

for (const relative of REVIEWERS) {
  const slice = writeSetStatement(relative);
  statements.set(relative, plain(slice));
  check(
    `${relative}: the write-set statement was sliced, not guessed`,
    slice.startsWith(WRITE_SET_HEADING) && slice.length >= 200 && !slice.includes("### "),
    `${slice.length} chars, starts with the heading: ${slice.startsWith(WRITE_SET_HEADING)},`
    + ` contains a "### " subsection: ${slice.includes("### ")}`,
  );
}

// Claim one: the write set is empty, said out loud. `write set is empty` is the
// one phrase all three files share; `code-reviewer.md` writes "Your OWN write
// set is empty", so the possessive is not part of the anchor.
for (const [relative, statement] of statements) {
  const hit = /write set is empty/i.test(statement);
  check(
    `${relative}: its write-set statement says the write set is empty`,
    hit,
    `no /write set is empty/i in the ${statement.length}-char statement.`
    + ` This file must say so itself — a role reads its own prompt, not the PM's and not the tool table.`
    + `\n      statement begins: ${JSON.stringify(statement.slice(0, 220))}`,
  );
}

// Claim two: the report is the only output. Judged per sentence so that the word
// "report" somewhere else in the statement cannot answer for it: `report` and
// `only output` (or `one output`) have to be in the SAME sentence.
for (const [relative, statement] of statements) {
  const carrying = sentences(statement)
    .filter((s) => /report/i.test(s) && /\b(?:only|one) output\b/i.test(s));
  check(
    `${relative}: its write-set statement says the report is its only output`,
    carrying.length >= 1,
    `no single sentence carries both /report/i and /\\b(only|one) output\\b/i.`
    + ` Sentences naming a report: ${JSON.stringify(sentences(statement).filter((s) => /report/i.test(s)))}`,
  );
  if (carrying.length >= 1) console.log(`      ${relative}: ${carrying[0]}`);
}

// Claim three, this case's own: the report is not a file. Without it the other
// two claims contradict each other — a report written to disk is a write set
// that is not empty. Not a literal DoD requirement; all three files carry it.
for (const [relative, statement] of statements) {
  check(
    `${relative}: its write-set statement says the report is not a file`,
    /not a file/i.test(statement),
    "no /not a file/i in the statement. With the report on disk, \"the write set is empty\""
    + " and \"the report is my output\" cannot both be true.",
  );
}

// ------------------------------------- the two "who writes which document" tables
//
// The thing nobody sees by looking at one file. Each reviewer prompt says it
// writes no file of any class. The two tables are where a class of document is
// handed to a role, so a row naming a reviewer would make all three prompts
// false — and no existing check would notice: `docs/qa/T-63/case-07` compares
// the two tables with EACH OTHER, so both gaining the same wrong row is green
// there.
//
// Markdown table rows cannot wrap, so these are read line by line — one of the
// few reads in this repository where that is safe (`docs/qa/gaps.md` item 21).

/**
 * The data rows of the one who-writes table in a file, as [class, writer] pairs.
 * @throws when the table's shape has moved
 */
function whoWritesRows(relative) {
  const lines = readFileSync(join(REPO, relative), "utf8").split("\n");
  const headers = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => line === TABLE_HEADER);
  if (headers.length !== 1) {
    throw new Error(
      `${relative} has ${headers.length} rows reading exactly "${TABLE_HEADER}", expected 1`
      + " — the table moved or its header changed, so there is no single table to judge.",
    );
  }
  const rows = [];
  for (let at = headers[0].index + 1; at < lines.length && lines[at].trim().startsWith("|"); at += 1) {
    rows.push(lines[at].trim());
  }
  const isSeparator = (row) => /^\|[\s|:-]+\|$/.test(row);
  const separators = rows.filter(isSeparator);
  const data = rows.filter((row) => !isSeparator(row))
    .map((row) => row.replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim()));
  const shaped = data.filter((cells) => cells.length === 2);
  if (separators.length !== 1 || shaped.length < 10 || shaped.length !== data.length) {
    throw new Error(
      `${relative}: sliced ${rows.length} row(s) after the header — ${separators.length} separator(s),`
      + ` ${data.length} data row(s), ${shaped.length} of them with exactly two cells.`
      + " Expected one separator and at least ten two-cell rows, so this is not the table this case means.",
    );
  }
  return { rows: shaped, at: headers[0].index + 1 };
}

for (const relative of ["principles.md", "roles/pm.md"]) {
  let table;
  try {
    table = whoWritesRows(relative);
  } catch (error) {
    // Not a throw: one moved table must not hide the twelve results above, and
    // the reason has to reach the report in one piece.
    check(`${relative}: the who-writes table was sliced, not guessed`, false, String(error.message));
    continue;
  }
  check(
    `${relative}: the who-writes table was sliced, not guessed`,
    true,
    `${table.rows.length} class row(s) from line ${table.at}`,
  );
  const naming = table.rows.filter(([, writer]) => /review/i.test(writer));
  check(
    `${relative}: no class of document is written by a reviewer`,
    naming.length === 0,
    `${naming.length} row(s) name a reviewer in the "who writes it" column: ${JSON.stringify(naming)}.`
    + " All three reviewer prompts say they write no file of any class, so such a row makes them false.",
  );
}

done();
