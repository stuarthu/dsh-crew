// T-67 (checklist C-36) — DoD: PRD M1 item 11; T-67 item 5; T-70 item 10;
// T-71 item 8; T-72 item 12; T-73 item 8; T-75 item 8; T-77 item 9; T-79 item 4;
// T-80 item 2.
//
// ON THE T-67 CELL NUMBER, because the brief that ordered this case named a
// different one. The A7 cell of T-67 — the renaming cell, the one this case
// judges — is item 5: "`roles/pm.md` has all 16 old paths changed", verified
// with `grep -c 'docs/design/prd\.md\|docs/design/hld\.md' roles/pm.md` = 0.
// T-67 item 10 is a different subject altogether (B9: do not delete the
// write-DESTINATION paths `roles/pm.md` needs, which `tools/verify-mount.mjs`
// requires), and it is judged by `case-02-no-numbered-decision-pointers.mjs`.
// Nothing in the task table was changed for this: the header names the cell the
// document really carries, and the mismatch went into the QA report.
//
// What it proves: A7 is finished in the PRODUCT files. The two design documents
// are no longer called `docs/design/prd.md` and `docs/design/hld.md` — every job
// now gets its own `docs/design/prd-<date>-<job-slug>.md` and
// `docs/design/hld-<date>-<job-slug>.md` — and not one of the fourteen product
// files still POINTS a reader at a name that no longer exists.
//
// The fourteen: the ten role prompts under `roles/` (found by reading the folder,
// never by a hand-written list), plus `principles.md`, `CLAUDE.md`, `README.md`
// and `README-zh.md`.
//
// ---------------------------------------------------------------------------
// A POINTER IS BANNED, A MENTION IS REQUIRED. This is the whole design of the
// case, and it is not this case's invention: PRD DoD item 11 was written as "the
// path never appears in a live document" for five versions, and v6 corrected it
// because that sentence CAN NEVER GO GREEN — the PRD's own A7 row, item 11
// itself and five task rows all have to NAME the old paths to say what is being
// renamed. So:
//
//   * a POINTER sends a reader to the file — "read `docs/design/prd.md`", "the
//     DoD section in `docs/design/hld.md`". A pointer to a name that no longer
//     exists is a dead end, and every one of them is a failure here.
//   * a MENTION talks about the rename — "those two were called
//     `docs/design/prd.md` and `docs/design/hld.md` until 0.9.0". v6 says the
//     mentions MUST STAY: delete them and the repository holds no record that
//     the rename ever happened.
//
// v6 also records that this is the THIRD time this job drew the same
// distinction (DoD item 10 v3 did it for B9 — "go read this file" is a pointer,
// "write a CRD into this folder" is a destination; T-66 did it when picking the
// two ABSENT anchors — the string that CARRIES THE PERMISSION, not the string
// that merely mentions force push). So the rule this case encodes is: a check
// that forbids a string must first separate the words that TALK ABOUT the thing
// from the words that DO it.
//
// HOW THE CASE TELLS THEM APART, written down here so a red is arguable against
// a written criterion instead of against a taste. Every occurrence of an old
// path is judged by the SENTENCE it sits in. The sentence must carry a rename
// marker of its own — "was/were called", "used to be called/named", "renamed",
// "formerly", "no longer called/named/exists", or "until 0.9.x" / "up to 0.9.x".
// Carrying one makes the occurrence a mention. Carrying none makes it a pointer,
// and the case goes red naming the file, the line and the sentence.
//
// THE PRICE, said plainly. An honest record split over two sentences — "The
// design document was renamed. It used to live at `docs/design/hld.md`." —
// passes, because "used to" is in the naming sentence; but "The design document
// was renamed in 0.9.0. Its old path was `docs/design/hld.md`." goes red,
// because the naming sentence carries no marker. That is a loud failure with an
// easy fix (say it in one sentence, or add the marker), and it is the safer of
// the two mistakes: the other one is silent. The window is the SENTENCE and
// nothing outside it, because `docs/qa/T-64/case-04` measured what a wider
// window costs — a 140-character window there excused a freshly added rule as a
// mention on the strength of an unrelated neighbouring sentence.
//
// ---------------------------------------------------------------------------
// WHAT IS SCANNED FOR BARE NAMES, AND WHAT IS NOT. This is a deliberate split,
// and the reason is that the DoD cells themselves are split.
//
//   * THE TEN ROLE PROMPTS get the strict rule: ZERO occurrences of `prd.md` or
//     `hld.md` in ANY form, bare or path-qualified. That is exactly the command
//     T-70 item 10 and T-77 item 9 give — `grep -c 'hld\.md\|prd\.md'
//     roles/architect.md` = 0, same for `roles/doc-reviewer.md` — and the PM
//     approved widening those two cells to bare names on 2026-08-21 for a reason
//     that holds for all ten: after A7 the design documents' file names DIFFER
//     PER JOB, so a hard-coded bare `hld.md` contradicts the rule this same job
//     wrote into all ten prompts, which is to name a CLASS of document and never
//     a file name. A role prompt has no business recording this repository's
//     rename history, so zero is the honest number for all ten.
//   * `principles.md`, `CLAUDE.md`, `README.md` and `README-zh.md` are held only
//     to the POINTER rule, on the path-qualified name. Bare `prd.md` / `hld.md`
//     in those four is NOT asserted here, and that is a limit worth naming out
//     loud rather than hiding: `principles.md` today carries two bare `hld.md`
//     in ordinary prose (the reuse principle, and one row of the
//     rejected-ideas table), no task cell in this job asks for them — T-69 item
//     6, which owns A7 in that file, verifies with a PATH-qualified grep — and a
//     bare-name assertion there would put this case red over words no DoD item
//     requires anybody to change. A false red costs the crew a round. So the
//     finding goes to the QA report and to `docs/qa/gaps.md`, and this case
//     stays on the ground its DoD cells really stand on.
//
// Neither half is a proxy. The strict half runs the DoD cells' own command; the
// pointer half runs the PRD's own rule.
//
// ---------------------------------------------------------------------------
// THE THREE TRAPS THIS JOB KEEPS FALLING INTO, and what closes each here.
//
//   1. THE STRING WAS WRAPPED. Prose here wraps at 80 (`roles/`,
//     `principles.md`) or 100 columns (`CLAUDE.md`, the READMEs), so a sentence
//     normally spans two or three lines. Every judgement below runs on
//     `flat()`ed text (`docs/qa/gaps.md` item 21: an ABSENT pin may only be
//     judged after flattening). A path can be wrapped MID-PATH too —
//     `docs/design/` at the end of one line and `prd.md` at the start of the
//     next — which a strict pattern misses in both the raw and the flattened
//     text, so the flattened pattern tolerates one space at each place a wrap
//     can land. Check 5 counts the same thing line by line and compares, so the
//     scanning method cannot quietly lose a hit.
//   2. THE PIN WAS A PROXY. Not "how many times does the path appear" — the
//     PRD's item 10 v3 measured that trap exactly (6 occurrences of
//     `docs/decisions/crd/`, only 3 of them pointers) — but "is this occurrence
//     a pointer".
//   3. THE FILE READ WAS NOT THE FILE JUDGED. `docs/qa/T-52/case-16` judged the
//     ten role prompts while reading only `principles.md`. Here every check
//     names its own file, every read goes through `repoFile(<that file>)`, and
//     the ten prompts come from `readdirSync`, so a role added or renamed
//     tomorrow is scanned without anybody remembering to add it.
//
// WHAT THIS CASE DELIBERATELY DOES NOT READ: `docs/qa/`, `docs/decisions/`,
// `docs/research/`, `CHANGELOG.md`, `docs/design/tasks.md` rows T-01..T-62, and
// `tools/` / `host/`. The first group is out of scope by `ADR 0017` — a history
// snapshot keeps the words it was written with, because an old name rotting
// honestly inside a finished record is worth more than one edited by a later
// hand — and T-67 item 11 makes "no history snapshot changed" a condition of
// this task. (`docs/qa/T-51/case-14` line 9 holds a bare `hld.md` pointer in a
// comment, `docs/qa/gaps.md` item 23 records it, and a scan of `docs/qa/` would
// go red on it.) `tools/` and `host/` are checklist C-38's case, not this one.
//
// Other things it does not prove: that the NEW names are the right names or the
// right shape (that is C-37, `case-05-prd-filename-shape.mjs`), and that the
// prose around a mention is TRUE. No case can prove that; `docs/qa/gaps.md`
// item 1 has said so since T-51.
//
// Reads fourteen repository files. Writes nothing, anywhere. Runs offline, and
// twice in a row gives the same answer.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO, repoFile, flat, check, done } from "../lib/qa.mjs";

// ------------------------------------------------------------------ the files

const ROLES_DIR = "roles";

/** The ten role prompts, read from the folder — never a hand-written list. */
const rolePrompts = readdirSync(join(REPO, ROLES_DIR))
  .filter((name) => name.endsWith(".md"))
  .sort()
  .map((name) => `${ROLES_DIR}/${name}`);

/**
 * The four reader-facing files. These ARE named one by one, because each is a
 * single named deliverable of this job (T-69, T-79, T-80) rather than a member
 * of a growing family the way a role prompt is.
 */
const OTHER_FILES = ["principles.md", "CLAUDE.md", "README.md", "README-zh.md"];

const ALL_FILES = [...rolePrompts, ...OTHER_FILES];

// --------------------------------------------------------------- the patterns

/** The old path, exactly as PRD DoD item 11 spells it. Line-by-line safe. */
const STRICT_PATH = /docs\/design\/(?:prd|hld)\.md/g;

/**
 * The same path, tolerating one space wherever a line wrap can land inside it.
 * `flat()` turns any run of whitespace into a single space, so a path broken
 * across two lines shows up here and nowhere else.
 */
const WRAPPED_PATH = /docs\/ ?design\/ ?(?:prd|hld)\. ?md/g;

/**
 * Any occurrence of the old file NAME, bare or path-qualified. `\b` in front
 * keeps it off longer words, and the literal `.md` right after the name keeps
 * it off every new-shape name (`prd-2026-08-21-apply-req.md` has no `prd.md`
 * in it).
 */
const ANY_OLD_NAME = /(?:docs\/ ?design\/ ?)?\b(?:prd|hld)\. ?md/g;

/**
 * The new shape. Its presence is the premise every ABSENT check below needs.
 *
 * TWO SPELLINGS, and the second one is not a convenience. Most files write the
 * new name with its folder — `docs/design/prd-<date>-<job-slug>.md`. `CLAUDE.md`
 * writes it WITHOUT: its "State and documents" table puts `docs/design/` in the
 * left-hand cell and `prd-<date>-<job-slug>.md` in the right-hand one, so a
 * pattern that demanded the folder went red on `CLAUDE.md` the first time this
 * case ran — a red about the pattern, not about the file. Both spellings name
 * the new shape, so both count.
 */
const NEW_SHAPE = /docs\/ ?design\/ ?(?:prd|hld)-|\b(?:prd|hld)-<[^`|]{0,40}>/;

/**
 * A sentence carrying one of these is talking about the RENAME. Anything else
 * holding an old path is sending a reader to a file that is not there.
 */
const RENAME_MARKER = /\bwas called\b|\bwere called\b|\bused to be (?:called|named)\b|\brename[ds]?\b|\bformerly\b|\bno longer (?:called|named|exists)\b|\b(?:until|up to) 0\.\d/i;

// ------------------------------------------------------- cutting out a sentence
//
// Copied in shape from `docs/qa/T-64/case-04`, which settled these two rules the
// hard way. A sentence ends at `.`, `!`, `?` or their full-width forms FOLLOWED
// BY WHITESPACE, or at a `|`. The whitespace matters: without it `0.9.0` and
// `README.md` would each cut a sentence in half. The `|` matters because a
// markdown table row puts unrelated sentences in neighbouring cells, and the
// tables in `principles.md` and `CLAUDE.md` are exactly that shape.

const BOUNDARY = /[.!?\u3002\uff01\uff1f]/;

const ends = (text, i) => text[i] === "|" || (BOUNDARY.test(text[i]) && /\s/.test(text[i + 1] ?? " "));

/** The one sentence of `text` that holds position `at`. */
function sentenceAround(text, at) {
  let start = 0;
  for (let i = at; i > 0; i -= 1) {
    if (ends(text, i)) { start = i + 1; break; }
  }
  let end = text.length;
  for (let i = at; i < text.length; i += 1) {
    if (ends(text, i)) { end = i + 1; break; }
  }
  return text.slice(start, end).trim();
}

/**
 * Every old-path occurrence in one flattened text, judged pointer or mention.
 * Keyed by position so two patterns matching the same words count once.
 *
 * @returns array of { match, sentence, mention }
 */
function pathHits(flatText) {
  const found = new Map();
  for (const regex of [STRICT_PATH, WRAPPED_PATH]) {
    for (const match of flatText.matchAll(new RegExp(regex.source, "g"))) {
      const at = match.index ?? 0;
      if (found.has(at)) continue;
      const sentence = sentenceAround(flatText, at);
      found.set(at, { match: match[0], sentence, mention: RENAME_MARKER.test(sentence) });
    }
  }
  return [...found.entries()].sort(([a], [b]) => a - b).map(([, hit]) => hit);
}

/** The raw line numbers holding an old NAME, for a failure a person can act on. */
const linesWith = (raw, regex) => raw
  .split("\n")
  .map((line, index) => [index + 1, line])
  .filter(([, line]) => new RegExp(regex.source).test(line))
  .map(([number, line]) => `line ${number}: ${line.trim().slice(0, 200)}`);

/** How a red reads. */
const show = (file, hits) => hits
  .map((hit) => `${file}: ${JSON.stringify(hit.match)} in sentence: ${JSON.stringify(hit.sentence.slice(0, 400))}`)
  .join("\n      ");

// ------------------------------------------------------------- check 1: premise
//
// A scan of nothing passes every ABSENT check ever written. Two premises stop
// that: the files are all really there and really full, and the folder holds the
// ten prompts this job is about.

check(
  `${ROLES_DIR}/ holds at least ten .md role prompts (read from the folder, not listed by hand)`,
  rolePrompts.length >= 10,
  `found ${rolePrompts.length}: ${rolePrompts.join(", ")}`,
);

const empty = ALL_FILES.filter((file) => repoFile(file).length < 500);
check(
  "all fourteen product files are present and not near-empty",
  empty.length === 0,
  `too short to be the real file: ${empty.join(", ")} — every ABSENT check below would pass on nothing`,
);

// ------------------------------------------------------------- check 2: premise
//
// The second half of the same worry, and the sharper half: "no old name" is also
// true of a file that stopped mentioning the design documents at all. So the
// five files that used to carry the old paths in bulk must now carry the NEW
// shape. A deletion instead of a rename goes red here.

for (const file of ["roles/pm.md", "roles/architect.md", "principles.md", "CLAUDE.md", "README.md", "README-zh.md"]) {
  check(
    `${file} names the new per-job shape (docs/design/prd- or hld-)`,
    NEW_SHAPE.test(flat(repoFile(file))),
    "the old path is gone from this file because the design documents are not mentioned in it at all any more — that is a deletion, not a rename",
  );
}

// ------------------------------------------- check 3: the ten prompts, zero, any form
//
// T-70 item 10 and T-77 item 9's own command, widened to all ten prompts for the
// reason those two cells give: after A7 the design documents' names differ per
// job, so a hard-coded name — bare or path-qualified — contradicts the
// name-a-class-never-a-file rule this job wrote into all ten.

for (const file of rolePrompts) {
  const raw = repoFile(file);
  const hits = [...flat(raw).matchAll(new RegExp(ANY_OLD_NAME.source, "g"))];
  check(
    `${file} holds no occurrence of \`prd.md\` or \`hld.md\` at all, bare or path-qualified`,
    hits.length === 0,
    `${hits.length} occurrence(s): ${hits.map((hit) => JSON.stringify(hit[0])).join(", ")}\n      ${linesWith(raw, ANY_OLD_NAME).join("\n      ")}`,
  );
}

// --------------------------------- check 4: no pointer anywhere in the fourteen
//
// The PRD's own rule, on the path-qualified name PRD DoD item 11 spells out. A
// mention is allowed and is checked for separately below; a pointer is a dead
// end and fails.

for (const file of ALL_FILES) {
  const raw = repoFile(file);
  const hits = pathHits(flat(raw));
  const pointers = hits.filter((hit) => !hit.mention);
  check(
    `${file} points nobody at an old design-document path`,
    pointers.length === 0,
    `${hits.length} occurrence(s) of the old path, ${pointers.length} of them a pointer rather than a mention of the rename:\n      ${show(file, pointers)}\n      raw lines:\n      ${linesWith(raw, STRICT_PATH).join("\n      ")}`,
  );
}

// ------------------------------------------ check 5: the mention has to survive
//
// The other direction of PRD DoD item 11 v6, and the reason the check above is
// not a plain ban: "the mentions must stay, or the repository holds no record
// that the rename happened". So at least one of the four reader-facing files
// must still record it. It is asked of the four as a group, not of one named
// file, so moving the record from `CLAUDE.md` to a README is not a failure.

const withMention = OTHER_FILES.filter((file) => pathHits(flat(repoFile(file))).some((hit) => hit.mention));
check(
  "at least one reader-facing file still records the rename by naming the old path in a rename sentence",
  withMention.length >= 1,
  `none of ${OTHER_FILES.join(", ")} mentions the old names any more — PRD DoD item 11 v6 requires the record to stay, or the rename is invisible in the repository`,
);

// -------------------------------------------------- check 6: the wrapping guard
//
// Everything above runs on flattened text. This asks the same question line by
// line and compares. The flattened scan must find at least as much as the
// line-based one, or the method used above is losing hits.

const wrapTrouble = ALL_FILES.filter((file) => {
  const raw = repoFile(file);
  const perLine = raw.split("\n").reduce(
    (total, line) => total + [...line.matchAll(new RegExp(ANY_OLD_NAME.source, "g"))].length,
    0,
  );
  const flattened = [...flat(raw).matchAll(new RegExp(ANY_OLD_NAME.source, "g"))].length;
  return flattened < perLine;
});
check(
  "the flattened scan finds every old-name occurrence the line-by-line scan finds",
  wrapTrouble.length === 0,
  `flattening lost an occurrence in: ${wrapTrouble.join(", ")} — the scan method is wrong, not the files`,
);

// ---------------------------------------- check 7: the matcher tested on samples
//
// The self-test, and the reason it is here: every assertion above is an ABSENT
// pin, and an ABSENT pin on a pattern that can no longer match anything is a
// green that looked at nothing. This job has closed that hole eight times. The
// samples below are folded exactly the way this repository's prose folds, so a
// later rewrite of this file back to a line-based scan, a narrowed pattern or a
// dropped marker turns the case RED instead of quietly weakening it.

const POINTER_SAMPLES = [
  ["a plain pointer", "Read the DoD section in docs/design/prd.md before you start."],
  ["a wrapped pointer", "Read the DoD section in docs/design/\nprd.md before you start."],
  ["a pointer at the design document", "The boundary is pinned in docs/design/hld.md, section four."],
];

for (const [what, sample] of POINTER_SAMPLES) {
  const hits = pathHits(flat(sample));
  check(
    `the matcher sees ${what} and calls it a pointer`,
    hits.length === 1 && !hits[0].mention,
    `${hits.length} hit(s), mention=${hits.map((hit) => hit.mention).join(",")} on ${JSON.stringify(sample)}`,
  );
}

const MENTION_SAMPLES = [
  ["a rename record", "Those two were called docs/design/prd.md and docs/design/hld.md until 0.9.0; the job renamed them."],
  ["a wrapped rename record", "It was called docs/design/prd.md\nuntil 0.9.0, and the apply-req job renamed it."],
  ["a past-tense record", "The design document used to be named docs/design/hld.md, one per repository."],
];

for (const [what, sample] of MENTION_SAMPLES) {
  const hits = pathHits(flat(sample));
  check(
    `the matcher sees ${what} and calls it a mention`,
    hits.length >= 1 && hits.every((hit) => hit.mention),
    `${hits.length} hit(s), mention=${hits.map((hit) => hit.mention).join(",")} on ${JSON.stringify(sample)}`,
  );
}

// The new shape must not read as an old name, or every check above would be red
// on the very names this job introduced.
check(
  "the matcher does not mistake a new per-job name for an old one",
  [...flat("docs/design/prd-2026-08-21-apply-req.md and docs/design/hld-2026-08-21-apply-req.md").matchAll(new RegExp(ANY_OLD_NAME.source, "g"))].length === 0,
  "the pattern matches inside the new names, so the whole case is testing the wrong thing",
);

// And the marker must not be borrowed from the sentence next door: the window is
// one sentence, nothing wider. This is the false green `docs/qa/T-64/case-04`
// measured and wrote down.
const NEIGHBOUR = "The opening document was renamed in 0.9.0. Read docs/design/prd.md first.";
const neighbourHits = pathHits(flat(NEIGHBOUR));
check(
  "a rename word in the sentence NEXT DOOR does not excuse a pointer",
  neighbourHits.length === 1 && !neighbourHits[0].mention,
  `${neighbourHits.length} hit(s), mention=${neighbourHits.map((hit) => hit.mention).join(",")} — the judgement window has grown past one sentence`,
);

done();
