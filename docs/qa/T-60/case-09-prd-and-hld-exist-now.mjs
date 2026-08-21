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
// PINNING STYLE: FLATTENED for every sentence of `CLAUDE.md`, BY PATTERN for the
// case's own premise (never by a filename A7 makes temporary), plus the
// count-it-twice guard on the phrase whose line-based grep could never fail.

import { check, claude, done, flat } from "./claude.mjs";
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

check(
  "the durable-documents table names prd.md as the opening document of both lanes",
  flatText.includes("`prd.md` — the opening document of **both** lanes"),
  "prd.md has no row describing what it is",
);

check(
  "the same table names hld.md",
  flatText.includes("`hld.md`"),
  "hld.md is not named in the durable-documents table",
);

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
