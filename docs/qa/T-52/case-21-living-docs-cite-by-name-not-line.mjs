// T-52, principle 20's new pointer rule, applied to this repository. Not a DoD
// item: the DoD asks only that the rule be written down. This case asks whether
// the repository obeys it, in the documents where breaking it does damage.
//
// What it proves: no living document in this repository points at `principles.md`
// by line number, except where it is quoting the old broken pointers as history.
//
// Why it is worth a permanent case. This is the failure the rule was written for,
// and it already happened: principle 6 was rewritten in place, grew by thirty-four
// lines, and ten pointers written as a line number pointed at the wrong words in
// the same moment. Nothing went red — a drifted line number still lands on a real
// line, so a reader who does not already know the answer cannot tell. Five of the
// ten were in living documents (`hld.md` three times, `prd.md`, `tasks.md`) and
// were rewritten to point by principle number and quoted words. This case is what
// stops the sixth from appearing.
//
// WHAT IS NOT SCANNED, and why it is not an oversight:
//
//   * `docs/decisions/` — CRDs and ADRs. Principle 20 allows a line number there
//     on purpose: those files are a snapshot of one decision at one moment and are
//     never rewritten, so a number that rots inside one rots honestly. Four of
//     them keep theirs today (`CRD 0014` twice, `ADR 0011`, `ADR 0009`) and
//     rewriting them to satisfy a check would be the larger mistake.
//   * pointers at code (`tools/…:837` and the like). The rule is about pointing at
//     a document; a pointer into a source file is a different question and this
//     case does not judge it.
//
// HOW A HISTORICAL QUOTE IS TOLD APART, and the limit of it. Three places in the
// living documents name an old pointer in order to say it broke: `prd.md` ("这里
// 原来写的是四个行号"), `tasks.md`'s T-52 row (the incident itself), and
// `case-01`'s header comment (the argument it borrows from `ADR 0011`). A ban has
// to be able to show what it bans — the same shape as case-12's banned phrase and
// case-19's fourth check. So each occurrence is judged by its surroundings: it
// passes when the text around it says the pointer is old or broken, and fails when
// it reads as a live pointer.
//
// That judgement is a heuristic, and it can be wrong in one direction: a NEW
// sentence about this history, written in words none of the markers below catch,
// goes red without a defect behind it. The fix then is to widen the marker list in
// this file — never to weaken the rule, and never to edit the document. This case
// was written knowing that cost, because the other direction is worse: a live
// line-number pointer that nobody notices for twenty tasks is exactly what
// happened.
//
// PINNING STYLE: substring scan on the raw file text, then a FLATTENED window
// around each hit for the judgement. The window is flattened because the sentence
// carrying the marker wraps at 80 columns in every one of these files.
//
// One-way: living documents may never point by line number. The scanned list may
// only grow.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { REPO, check, done, flatten } from "./principles.mjs";

/** Living documents: revised again and again, so a line number in them rots. */
const LIVING = ["docs/design", "docs/qa", "roles", "CLAUDE.md", "README.md", "README-zh.md"];

/** Words that mark an occurrence as history being reported rather than a pointer being used. */
const HISTORY = /became wrong|wrong at once|went stale|no longer|used to|stale|rot|原来|曾经|变成|指错|已经改|不要行号/i;

/** Every file under one path, or the file itself. Nothing here follows a symlink into the outside world. */
function filesUnder(entry) {
  const absolute = join(REPO, entry);
  let info;
  try {
    info = statSync(absolute);
  } catch {
    return [];
  }
  if (!info.isDirectory()) return [absolute];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((child) =>
    child.isDirectory() || child.isFile() ? filesUnder(join(entry, child.name)) : [],
  );
}

const scanned = LIVING.flatMap(filesUnder);

check(
  "there are living documents to scan",
  scanned.length > 10,
  `only ${scanned.length} file(s) found under ${LIVING.join(", ")} — the repository's shape moved`,
);

// `principles.md`, a colon, a line number. Written as a pattern rather than as a
// literal string so this case's own source is not a hit of itself.
const POINTER = /principles\.md:(\d+)/g;

const found = [];
for (const absolute of scanned) {
  let body;
  try {
    body = readFileSync(absolute, "utf8");
  } catch {
    continue; // not a text file we can read; nothing to judge
  }
  for (const match of body.matchAll(POINTER)) {
    const window = flatten(body.slice(Math.max(0, match.index - 250), match.index + 250));
    found.push({
      file: relative(REPO, absolute),
      pointer: match[0],
      historical: HISTORY.test(window),
      window,
    });
  }
}

const live = found.filter((hit) => !hit.historical);

check(
  "no living document points at `principles.md` by line number",
  live.length === 0,
  live.length === 0
    ? ""
    : `${live.length} live pointer(s) — principle 20 says to name the section heading or quote the sentence instead:\n      ${live
        .map((hit) => `${hit.file}: ${hit.pointer}\n        …${hit.window.slice(0, 200)}…`)
        .join("\n      ")}`,
);

// Reported, not asserted: the historical quotes are allowed, and printing them
// keeps the count visible. If this number grows fast, the marker list is doing
// too much work and this case needs rethinking rather than widening.
for (const hit of found.filter((entry) => entry.historical)) {
  console.log(`note  ${hit.file} names ${hit.pointer} while reporting it as old or broken — allowed`);
}

done();
