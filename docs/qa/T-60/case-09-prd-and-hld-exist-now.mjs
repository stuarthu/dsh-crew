// T-60, DoD item 7: the "State and documents" section no longer claims this
// repository has no `prd.md` and no `hld.md`. A PRD and an HLD really exist.
//
// THIS CASE ALSO CARRIES THE METHOD FOR THE WRAPPING TRAP, which is why it is
// worth reading before writing another pin on prose anywhere in this repository.
//
// This task's own DoD cell verifies item 7 with `grep -n 'no \`prd.md\`'
// CLAUDE.md` must be empty — and that grep was empty from the moment it was
// written, because the sentence it hunted wrapped between `There is no` and
// `` `prd.md` ``. A verification that cannot fail is not a verification. It is the
// seventh time the same trap bit this job.
//
// The method that catches it: COUNT IT TWICE. Count the phrase on the flattened
// text and again line by line. When the flattened count is higher than the
// line-based count, the phrase wraps — and any line-based pin on it is lying. The
// two counts must agree before a line-based pin may be trusted. That method is
// now written into `docs/qa/gaps.md` item 21.
//
// WHAT CHANGED HERE, AND WHY IT IS A DECISION AND NOT DRIFT.
// **T-67** (apply-req job) landed the PRD's A7: one PRD per job, named
// `docs/design/prd-<date>-<job slug>.md`, and `hld` the same shape. The PM did the
// two `git mv` calls in T-67's commit, so the two documents this case is about are
// now `docs/design/prd-2026-08-21-paired-engineers.md` and
// `docs/design/hld-2026-08-21-paired-engineers.md`. Until then they were
// `docs/design/prd.md` and `docs/design/hld.md` — named here so the rename has a
// record in a living file, which is a MENTION of the old path and not a pointer to
// it (the PRD's DoD item 11, v6, forbids the pointer and requires the mention).
// It is a decision, and it was written down before it happened:
//
//   * the user asked for it in the opening interview, and refused a date-only name
//     because two jobs on one day would collide — `CRD 0023` decision two;
//   * the reason is a loss this repository nearly took: the fixed name
//     `docs/design/prd.md` held the PREVIOUS job's PRD (paired-engineers, ten
//     versions, 370 lines), so the next job's first line would have overwritten it
//     with nothing going red;
//   * `docs/decisions/adr/0017-scope-of-the-rename-sweep.md` drew the sweep's
//     boundary — living documents change, historical snapshots keep the old name
//     honestly — and named this very case in its option D;
//   * `docs/decisions/adr/0018-red-existing-cases.md` decided who changes the
//     assertion: QA, in the same commit as the rename, so no commit is red and
//     `docs/qa/` stays QA's. T-67's DoD item 8 is the box for that work.
//
// AND THE PROXY IT REPLACES. The two cells used to be `existsSync` on those two
// exact paths. The exact path was never the point: what makes `CLAUDE.md`'s old
// sentence false is that this repository REALLY HAS a PRD and an HLD, and the
// filename was only the cheapest way to ask that. A7 makes the filename change
// with every job, so a pin on any one name is a pin that expires on the next job —
// the same reason the PRD's own DoD item 14 asks about `docs/design/prd-*.md` by
// pattern. So the premise is now asked BY PATTERN: `docs/design/` holds at least
// one `prd-*.md` and at least one `hld-*.md`.
//
// AND THE HOLE THE PATTERN OPENS, CLOSED IN THE SAME BREATH. `ADR 0017` weighed
// leaving a one-line tombstone at the old path and refused it for one reason: this
// case would have stayed green while proving nothing at all. A bare
// pattern has exactly that hole — `prd-x.md` holding one line would pass it. So a
// matching file must also carry a document's worth of text. The floor is
// deliberately far below reality: the smallest of the four documents in
// `docs/design/` today is 26,707 bytes, and the floor is 2,000, so a real document
// that is merely short cannot go red here while a tombstone cannot pass.
//
// STILL TRUE, AND KEPT: `CLAUDE.md` really did carry the false sentence, and the
// original verification for item 7 really was empty from the day it was written.
// Both of those are unchanged by the rename, and the two checks and the
// count-it-twice guard below are the same checks they always were.
//
// WHAT CHANGED HERE THE SECOND TIME, AND WHY THAT IS ALSO A DECISION.
// **T-80** (same job) changed the same section for two requirements at once, and
// between them they rewrote both halves of the one sentence the last two cells
// below used to pin, `` `prd.md` — the opening document of **both** lanes ``:
//
//   * the PRD's **B5** took every `both lanes` out of the file. The phrase had
//     nothing to point at — the file lists TWO lanes today and listed three when
//     the phrase was written. `grep -i 'both lanes' CLAUDE.md` is now 0.
//   * the PRD's **A7** — the same requirement that moved the first two cells onto
//     a pattern — turned the table's two rows into `prd-<date>-<job-slug>.md` and
//     `hld-<date>-<job-slug>.md`, one of each per job.
//
// `ADR 0018` predicted this second visit by name: its table's row for this file
// reads "T-67, and T-80 again". So this is the planned edit, not drift, and it is
// made by QA in the same commit as the prose change (`ADR 0018` option A, which
// exists to stop the person whose change went red from weakening the assertion).
// T-80's DoD item 3 is the box for this work.
//
// WHAT THOSE TWO CELLS ARE FOR — read before rewriting them, not assumed. They are
// the positive half of this case: the first two cells ask that a PRD and an HLD
// really EXIST, and these two ask that `CLAUDE.md`'s durable-documents table really
// still DESCRIBES those two kinds of document. No other case in this folder reads
// that table, so if a later edit quietly dropped a class from it, these two cells
// are the only thing in the suite that would notice. The exact sentence was never
// the subject — it was the cheapest way to ask.
//
// SO THEY NOW ASK BY CLASS, not by one sentence. Same choice and same reason as the
// first two cells above: A7 makes the document's NAME change with every job, and
// B5 shows the prose around it moves too, so a pin on a sentence expires on the
// next rewrite that means exactly the same thing. This cell expired twice inside
// one job for precisely that.
//
// THE PRICE OF THAT CHOICE, SAID OUT LOUD. This repository pins prose ON PURPOSE
// (`ADR 0004`, `ADR 0007`) so that whoever changes a word has to change the pin in
// the same commit. Asking by class gives that up for this one table row: a
// rewording that keeps both classes and both descriptions now passes with nothing
// going red. It is accepted here because the row's WORDING is not this case's
// subject — its COVERAGE is — and because the same section's sentences are pinned
// by the other cells of this folder. The reading it beat was "pin the new sentence
// word for word", and that one loses on a plain fact: the new sentence carries a
// filename shape that A7 will move again, and B5 has already shown the sentence
// around it being rewritten mid-job.
//
// AND THE HOLES BY-CLASS OPENS, CLOSED IN THE SAME BREATH. A bare
// `includes("prd-")` would stay green through three bad changes. Each is closed:
//
//   1. a prefix found somewhere ELSE in the file answering for the table. This very
//      section's prose mentions the old names, and any later job may mention a name
//      in passing. Closed by slicing the table's own `docs/design/` row and asking
//      inside that row only. A markdown table row cannot wrap, so this is one of
//      the four line-based reads `claude.mjs` allows.
//   2. the row shrinking to a bare list of file names with nothing saying what they
//      are — the same shape of nothing as the tombstone `ADR 0017` refused. Closed
//      by requiring a DESCRIPTION next to the name: the opening document must still
//      be called that, and the design document must still be said to be one per
//      job.
//   3. one class's description answering for the other's — `one per job` appears
//      twice in that row today. Closed by splitting the row body on `;`, its own
//      separator, and requiring the phrase in the SAME clause that carries the
//      name. If a later rewrite drops the semicolons the check degrades to "both
//      phrases somewhere in the row" — weaker, but never a false red.
//
// A reverted row cannot pass either, with no cell of its own for it: the old fixed
// name `prd.md` does not match `prd-<...>.md`, so going back to it is red.
//
// PINNING STYLE: FLATTENED for every sentence of `CLAUDE.md`, BY PATTERN for the
// case's own premise (never by a filename A7 makes temporary), BY CLASS inside one
// sliced table row for what that table covers, plus the count-it-twice guard on the
// phrase whose line-based grep could never fail.

import { check, claude, claudeSection, done, flat } from "./claude.mjs";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { REPO } from "../lib/qa.mjs";

const text = claude();
const flatText = flat(text);

const countFlat = (needle) => flatText.split(needle).length - 1;
const countByLine = (needle) => text.split("\n").filter((line) => line.includes(needle)).length;

// The premise first: a PRD and an HLD really are there, so the old sentence really
// is false. Without this, the case could pass in a checkout where the claim is
// true. Asked by pattern, and with a floor no tombstone can clear.
const DESIGN = join(REPO, "docs", "design");
const FLOOR = 2000;

const realDocuments = (prefix) =>
  readdirSync(DESIGN)
    .filter((name) => new RegExp(`^${prefix}-.+\\.md$`).test(name))
    .filter((name) => statSync(join(DESIGN, name)).size >= FLOOR);

for (const [prefix, what] of [["prd", "PRD"], ["hld", "HLD"]]) {
  const found = realDocuments(prefix);
  check(
    `docs/design/ holds a real ${what} (${prefix}-*.md), so a claim that this repository has none would be false`,
    found.length >= 1,
    `no file matching ${prefix}-*.md with at least ${FLOOR} bytes — this case's premise is gone, not the pin.`
      + ` docs/design/ holds: ${readdirSync(DESIGN).join(", ")}`,
  );
  if (found.length >= 1) console.log(`note  ${what}(s) found: ${found.join(", ")}`);
}

check(
  "CLAUDE.md does not claim there is no prd.md",
  countFlat("no `prd.md`") === 0,
  `the old claim is back ${countFlat("no `prd.md`")} time(s)`,
);

check(
  "CLAUDE.md does not claim there is no hld.md",
  countFlat("no `hld.md`") === 0,
  `the old claim is back ${countFlat("no `hld.md`")} time(s)`,
);

// The durable-documents table's own `docs/design/` row, sliced out, so a name that
// appears anywhere else in the file cannot answer for the table. A table row cannot
// wrap in markdown, which is why this one read is line-based.
const designRows = claudeSection("State and documents")
  .split("\n")
  .filter((line) => /^\|\s*`docs\/design\/`\s*\|/.test(line));
const rowCells = designRows.length === 1 ? designRows[0].split("|").slice(1, -1) : [];
const rowBody = rowCells.slice(1).join("|");
// Its own separator, so one class's description cannot answer for the other's.
const clauses = rowBody.split(";");
const clausesNaming = (prefix) =>
  clauses.filter((clause) => new RegExp(`\`${prefix}-[^\`]*\\.md\``).test(clause));

const rowState = designRows.length === 1
  ? `the row's clauses are: ${clauses.map((clause) => JSON.stringify(clause.trim())).join(" / ")}`
  : `the table has ${designRows.length} \`docs/design/\` rows, expected exactly 1`;

for (const [prefix, what, phrase] of [
  ["prd", "opening document", "opening document"],
  ["hld", "design document", "one per job"],
]) {
  const naming = clausesNaming(prefix);
  check(
    `the durable-documents table still describes the ${what} by pattern (a \`${prefix}-<...>.md\` name)`
      + ` and says what it is ("${phrase}")`,
    naming.length >= 1 && naming.some((clause) => clause.includes(phrase)),
    `the \`docs/design/\` row has no clause naming a \`${prefix}-<...>.md\` document and calling it "${phrase}".`
      + ` Either that class was dropped from the table, or the row went back to a fixed name. ${rowState}`,
  );
}

// The count-it-twice guard, demonstrated on the very phrase whose line-based grep
// was empty from the day it was written. `There is no` still appears in this file
// in unrelated sentences, and at least one of them wraps — which is exactly what
// makes a line-based pin on it worthless.
const flatHits = countFlat("There is no");
const lineHits = countByLine("There is no");

check(
  "count-it-twice: the flattened count is never lower than the line-based count",
  flatHits >= lineHits,
  `flattened ${flatHits} vs line-based ${lineHits} — a line-based count above the flattened one means the counter is broken`,
);

console.log(
  `note  "There is no" appears ${flatHits} time(s) flattened and ${lineHits} time(s) on a single line`
  + `${flatHits > lineHits ? " — it wraps, so a line-based grep on it would MISS a hit" : ""}`,
);

done();
