// Shared helpers for the T-52 cases. This file is NOT a case: the runners only
// execute files named `case-*.mjs`.
//
// Everything here is read-only against the repository.
//
// WRAPPING — read this before writing another pin against this file.
// `principles.md` is prose wrapped at 80 columns, so almost every sentence in it
// spans two or three lines. A line-based pin on a sentence therefore reports
// "not there" for a sentence that IS there. That happened three times in one day
// on this job (a bolded `**DoD section**` split across lines, a `roleDeny: {`
// anchor broken the same way, and a PM grep for a sentence that wrapped). So
// every helper here offers both ways, and each case says in its header which one
// it uses:
//
//   * FLATTENED (`flatten`) — collapse every run of whitespace to one space,
//     then match. The only safe way to pin a sentence.
//   * LINE-BASED (`headings`, `tableRows`) — only for things that cannot wrap:
//     a `## ` heading, a `| … |` table row, one noun, one path.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Repository root: <repo>/docs/qa/T-52 -> up three. */
export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

/** Read one repository file as text. */
export const repoFile = (relative) => readFileSync(join(REPO, relative), "utf8");

/** `principles.md`, the file T-52 owns. */
export const principles = () => repoFile("principles.md");

/** Collapse every run of whitespace, so a prose pin does not depend on where the line wraps. */
export const flatten = (text) => text.replace(/\s+/g, " ");

/**
 * Every `## ` heading of a markdown file, in order, line-based (a heading cannot
 * wrap). Numbered ones carry `number`; unnumbered ones carry `number: null`.
 */
export function headings(text) {
  return text.split("\n").flatMap((line, index) => {
    const heading = /^## (.*)$/.exec(line);
    if (!heading) return [];
    const numbered = /^(\d+)\.\s+(.*)$/.exec(heading[1]);
    return [{
      line: index + 1,
      raw: heading[1],
      number: numbered ? Number(numbered[1]) : null,
      title: numbered ? numbered[2] : heading[1],
    }];
  });
}

/**
 * One `## ` section of a markdown file, from its heading to the next `## `.
 * `wanted` is matched against the whole heading text, so `principleSection(text, 21)`
 * cannot accidentally return principle 2's text.
 */
export function sectionOf(text, wanted) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => line === `## ${wanted}` || line.startsWith(`## ${wanted} `) || line.startsWith(`## ${wanted}. `));
  if (start === -1) throw new Error(`principles.md has no "## ${wanted}" heading — the file's shape moved`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => line.startsWith("## "));
  return (end === -1 ? lines.slice(start) : lines.slice(start, start + 1 + end)).join("\n");
}

/** One numbered principle, by number. */
export const principle = (text, number) => sectionOf(text, `${number}.`);

/**
 * The `| … |` rows of the first markdown table inside `text` whose header row
 * contains `headerNeedle`. Line-based on purpose: a table row cannot wrap.
 * Returns the header row, the divider and the data rows separately, each row as
 * an array of trimmed cells.
 *
 * @throws when no such table is there, so a case dies loudly on a moved file
 *         instead of quietly passing on an empty row list
 */
export function table(text, headerNeedle) {
  const lines = text.split("\n");
  const head = lines.findIndex((line) => line.trimStart().startsWith("|") && line.includes(headerNeedle));
  if (head === -1) throw new Error(`no table header row containing ${JSON.stringify(headerNeedle)} — the file's shape moved`);
  const cells = (line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim());
  const rows = [];
  for (const line of lines.slice(head + 1)) {
    if (!line.trimStart().startsWith("|")) break;
    rows.push(line);
  }
  const divider = rows[0] ?? "";
  const data = rows.slice(1).filter((line) => !/^\s*\|[\s|:-]*\|\s*$/.test(line));
  return {
    header: cells(lines[head]),
    columns: cells(lines[head]).length,
    divider: cells(divider),
    rows: data.map((line) => cells(line)),
    rawRows: data,
  };
}

// ---------------------------------------------------------------- assertions
//
// Same shape as docs/qa/lib/qa.mjs: an `ok`/`FAIL` line per check, totals at the
// end, non-zero exit when anything failed.

const failures = [];
let passed = 0;

/** Assert one thing. `detail` is printed only when it fails. */
export function check(what, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`ok    ${what}`);
  } else {
    failures.push(what);
    console.error(`FAIL  ${what}${detail ? `\n      ${detail}` : ""}`);
  }
}

/** Print the totals and exit non-zero when anything failed. */
export function done() {
  if (failures.length === 0) {
    console.log(`\nall ${passed} check(s) passed`);
    process.exit(0);
  }
  console.error(`\n${failures.length} of ${passed + failures.length} check(s) failed: ${failures.join("; ")}`);
  process.exit(1);
}

/**
 * Every sentence of a flattened text that contains `needle` (case-insensitive),
 * for a pin that has to judge the CONTEXT of each hit rather than its presence.
 * Sentences are cut at `.`, `!`, `?` and at table-cell borders (`|`), because a
 * table cell is its own sentence for this purpose.
 */
export function sentencesWith(text, needle) {
  const flat = flatten(text);
  const sentences = flat.split(/(?<=[.!?])\s+|\s*\|\s*/).filter((part) => part.trim() !== "");
  const lower = needle.toLowerCase();
  return sentences.filter((sentence) => sentence.toLowerCase().includes(lower));
}

/** How many times `needle` appears in a flattened text, case-insensitive. */
export function countFlat(text, needle) {
  const flat = flatten(text).toLowerCase();
  return flat.split(needle.toLowerCase()).length - 1;
}
