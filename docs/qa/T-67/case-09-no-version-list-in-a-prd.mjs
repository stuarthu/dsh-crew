// T-67, DoD item 2 (PRD M1 DoD item 14, second half): no `docs/design/prd-*.md`
// carries a version list. A PRD keeps ONE line of "current version + date"; the
// history of the document lives in the `Applied` line of its CRD and in git.
//
// WHY THIS CASE EXISTS. It is the first thing the user said about the previous
// job's PRD: `too long, history version should not be in the same prd.` That PRD
// was 370 lines and opened with sixteen lines of version entries, so a reader had
// to walk past ten `version N (...)` items before reaching the problem the
// document is about. `CRD 0023` decision six turned that complaint into a rule.
//
// WHAT COUNTS AS A VERSION LIST, WRITTEN DOWN HERE ON PURPOSE.
// The DoD item gives the shape and this case freezes it: THREE OR MORE
// CONSECUTIVE LINES, each one starting with a version marker. A line is a version
// marker line when, at the START of the line (up to three spaces of markdown
// indent, then an optional `-`/`*`/`+` bullet or `#` heading marker, then optional
// bold/italic markers), one of these follows:
//
//   * `v` and then a number - `v7`, `v1.2.0`, `ver 3`, `version 10`;
//   * the Chinese word for "version" and then a number (written below with `\u`
//     escapes, because a case file carries no Chinese character - the PRDs it
//     reads are Chinese, the case is not);
//   * a bare full semver, `0.9.0`, the way a changelog list writes one.
//
// THE THRESHOLD OF THREE IS THE POINT, NOT AN ACCIDENT. One version line is what
// a PRD is REQUIRED to have (`CRD 0023` decision six: current version and date).
// Two can be a version line plus a sentence about versions. Three in a row is a
// list, and a list is what the user refused. A detector that reddens on one line
// would forbid the very line the rule asks for, so the two self-tests below pin
// both ends: a synthetic three-line list must be caught, and a synthetic two-line
// one must NOT be.
//
// FOUR SHAPES THAT MUST NEVER BE MISTAKEN FOR A VERSION LIST, each with a
// self-test below, because each of them is a line the repository is supposed to
// keep:
//
//   1. the rows of the `\u4fee\u6b63\u8bb0\u5f55` ("record of corrections")
//      table, which rule B12 REQUIRES a PRD to carry - one row per change, with a
//      date and a reason. Those rows start with `| 2026-` and mention `v1 -> v2`
//      inside the cell, never at the start of the line. That table is not a
//      version list: it is a table with a reason per row, and it is the one place
//      a reader sees every change at a glance. Killing it to satisfy this case
//      would break B12;
//   2. the sentence saying the history is NOT in this file - it contains the
//      Chinese word for version followed by the word for history, not a number;
//   3. the date line, `- date: 2026-08-21` - a date is not a version;
//   4. a wrapped continuation line of a list item - it starts with spaces and
//      prose, so it carries no version marker of its own.
//
// WHAT THIS CASE CANNOT SEE, SAID OUT LOUD. Because the rule counts PHYSICAL
// lines, a version list whose entries WRAP defeats it: entry, continuation,
// entry, continuation gives runs of one. That is not a hypothesis - it is the
// state of `docs/design/prd-2026-08-21-paired-engineers.md` today, whose seven
// version entries occupy lines 3 to 18 and pass this case. The hole belongs to
// the definition, not to the detector, so it is reported to the PM and written in
// `docs/qa/gaps.md` rather than patched here: widening the rule to logical list
// items is a change to a DoD item, and QA does not write those.
//
// The file list is walked with `readdirSync`, never hardcoded. Since the PRD's A7
// (one PRD per job, `prd-<date>-<job slug>.md`) the names change with every job,
// and a hardcoded name would turn this case green by looking at nothing.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, done } from "../lib/qa.mjs";

const DESIGN = join("docs", "design");

// The Chinese word for "version", as escapes: a case file stays free of Chinese
// characters while still matching a Chinese document.
const VERSION_WORD = "\u7248\u672c";

const VERSION_LINE = new RegExp(
  "^ {0,3}" // markdown allows up to three spaces of indent
    + "(?:[-*+]|#{1,6})?[ \\t]*" // an optional bullet or heading marker
    + "(?:\\*{1,2}|_{1,2})?[ \\t]*" // optional bold/italic markers around the word
    + "(?:"
    + "v(?:er|ersion)?\\.?[ \\t]*\\d" // v7, v1.2.0, ver 3, version 10
    + "|" + VERSION_WORD + "(?:\\*{1,2})?[ \\t]*[:\uff1a]?[ \\t]*\\d" // the Chinese word, then a number
    + "|\\d+\\.\\d+\\.\\d+" // a bare full semver, as a changelog list writes one
    + ")",
);

const RUN = 3; // three consecutive marker lines are a list

/**
 * Every run of RUN or more consecutive version marker lines.
 *
 * @param lines - the file split on newlines
 * @returns one entry per run: its 1-based first and last line, and the lines
 */
function versionRuns(lines) {
  const runs = [];
  let start = -1;
  for (let i = 0; i <= lines.length; i += 1) {
    const isMarker = i < lines.length && VERSION_LINE.test(lines[i]);
    if (isMarker) {
      if (start === -1) start = i;
      continue;
    }
    if (start !== -1 && i - start >= RUN) {
      runs.push({ from: start + 1, to: i, lines: lines.slice(start, i) });
    }
    start = -1;
  }
  return runs;
}

const show = (runs) => runs
  .map((run) => `lines ${run.from}-${run.to}:\n        ${run.lines.map((line) => line.slice(0, 90)).join("\n        ")}`)
  .join("\n      ");

// --- the detector's own boundary, so a later edit cannot loosen it quietly ----

const THREE = [
  `- **${VERSION_WORD}**\uff1a7 (a change)`,
  `- ${VERSION_WORD} 6 (an older change)`,
  `- ${VERSION_WORD} 5 (an older change still)`,
];
const TWO = [`- **${VERSION_WORD}**\uff1a7 (a change)`, `- ${VERSION_WORD} 6 (an older change)`];
const KEEPERS = [
  `| 2026-08-21, v1 -> v2 | added three sections | added | PM |`,
  `| 2026-08-22, v6 -> v7 | corrected DoD item 15 | corrected | PM |`,
  `| 2026-08-21, v2 -> v3 | corrected DoD item 3 | corrected | PM |`,
  `- **${VERSION_WORD}\u5386\u53f2\u4e0d\u5728\u672c\u6587\u4ef6\u91cc\u3002**`,
  `- **\u65e5\u671f**\uff1a2026-08-21`,
  `  a wrapped continuation line of the entry above it`,
];

check(
  "the detector catches a three-line version list",
  versionRuns(THREE).length === 1 && versionRuns(THREE)[0].from === 1 && versionRuns(THREE)[0].to === 3,
  `it found ${JSON.stringify(versionRuns(THREE))} in a list that is three lines long`,
);

check(
  "the detector leaves a two-line one alone (the threshold is three, not one)",
  versionRuns(TWO).length === 0,
  `it flagged ${show(versionRuns(TWO))} - a PRD is required to carry its current version line`,
);

check(
  "the detector leaves the B12 correction table, the no-history sentence, the date line and a wrapped line alone",
  versionRuns(KEEPERS).length === 0 && !KEEPERS.some((line) => VERSION_LINE.test(line)),
  `it flagged ${KEEPERS.filter((line) => VERSION_LINE.test(line)).map((line) => line.slice(0, 90)).join(" | ")}`,
);

// --- the real question -------------------------------------------------------

const prds = readdirSync(join(REPO, DESIGN))
  .filter((name) => /^prd-.+\.md$/.test(name))
  .sort();

// A premise, not a formality: with no PRD found - a renamed folder, a changed
// name shape - every check below would pass by looking at nothing.
check(
  `${DESIGN} holds at least one prd-*.md`,
  prds.length > 0,
  `readdirSync found ${JSON.stringify(readdirSync(join(REPO, DESIGN)))}`,
);

for (const name of prds) {
  const lines = readFileSync(join(REPO, DESIGN, name), "utf8").split("\n");
  const runs = versionRuns(lines);
  check(
    `${DESIGN}/${name} has no version list (no ${RUN}+ consecutive version lines)`,
    runs.length === 0,
    `${runs.length} version list(s) found in ${name}. A PRD keeps one "current version + date" line; `
      + `the history belongs in the CRD's Applied line and in git.\n      ${show(runs)}`,
  );
}

done();
