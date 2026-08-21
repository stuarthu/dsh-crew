// T-60, DoD item 7: the "State and documents" section no longer claims this
// repository has no `prd.md` and no `hld.md`. Both files exist.
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
// PINNING STYLE: FLATTENED, plus the count-it-twice guard on the case's own
// premise.

import { check, claude, done, flat } from "./claude.mjs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { REPO } from "../lib/qa.mjs";

const text = claude();
const flatText = flat(text);

const countFlat = (needle) => flatText.split(needle).length - 1;
const countByLine = (needle) => text.split("\n").filter((line) => line.includes(needle)).length;

// The premise first: both files really are there, so the old sentence really is
// false. Without this, the case could pass in a checkout where the claim is true.
for (const path of ["docs/design/prd.md", "docs/design/hld.md"]) {
  check(
    `${path} exists, so a claim that it does not would be false`,
    existsSync(join(REPO, path)),
    "the file is not in this checkout — this case's premise is gone, not the pin",
  );
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
