// T-67 DoD items 9 and 10; T-70 DoD items 8 and 9; T-71 DoD item 7 (its
// decision-record half only); T-72 DoD item 11; T-77 DoD item 6; PRD M1 DoD
// item 10.
//
// What it proves: not one of the ten role prompts sends a role off to read a
// SPECIFIC NUMBERED decision record — a path like `docs/decisions/crd/0010-…`
// or `docs/decisions/adr/0018-…` — while every "write it here" path those same
// prompts need is still in place.
//
// The distinction this case is built around, and the trap it exists to avoid.
// B9 bans one USE of a string, not the string. The same characters do two
// different jobs in these prompts:
//
//   * "read `docs/decisions/crd/0010-dod-is-a-section.md`" is a POINTER. It
//     points at a file that exists only in this repository, so in the user's
//     own repository — where these prompts actually run — it points at nothing.
//     That is the thing B9 removes; the rule it used to point at has to be
//     written out on the spot instead.
//   * "write a CRD into `docs/decisions/crd/`" is a DESTINATION. It tells the
//     role where to put a file it is about to create, and it must stay.
//
// So there is NO occurrence count that can test this item, in either direction.
// `tools/verify-mount.mjs` positively REQUIRES `docs/decisions/adr/` in five of
// these prompts, `principles.md` in the PM's section, and at least three copies
// of `docs/qa/gaps.md` there — a case that asked for "zero occurrences of the
// path" would demand the exact opposite of the project's own unit tests. The
// PRD's own correction to this DoD item says it in one line: today
// `grep -c 'docs/decisions/crd/' roles/pm.md` is 6 and only 3 of those 6 were
// pointers. An architect on this job nearly implemented the counting version.
//
// How the two uses are told apart here, without reading English. A pointer has
// to name the file, and in this project a decision record's file name always
// starts with its four-digit number. A destination never can: it is a folder
// (`docs/decisions/adr/`), a glob (`docs/decisions/crd/*.md`), or the name
// TEMPLATE the prompts use for a file the role has not written yet
// (`docs/decisions/adr/NNNN-<short-name>.md`). So "a digit right after the
// folder" separates the two uses on FORM, with no guess about intent, and every
// legitimate destination shape in the ten files today passes it. Two things
// follow, and both are deliberate:
//
//   * "go and read" phrased at a folder or a glob is left alone. It has to be:
//     `roles/doc-reviewer.md` lists `docs/decisions/crd/*.md` among the files it
//     must review, and T-77 DoD item 6 says in as many words that this one stays
//     because it names a folder rather than one repository-only file. The same
//     goes for `roles/code-engineer.md`, which is told to read the interface ADR
//     whose path its BRIEFING gives it — a path decided when the job runs, not
//     baked into the shipped prompt.
//   * A number written without the path — `ADR 0018` in running prose — is the
//     same defect in a second notation, and points just as emptily in somebody
//     else's repository. It is checked too, as its own assertion, so the obvious
//     way around the path form does not pass. There are none today.
//
// Every whitespace run is also stripped before the search, and the number of
// `docs/decisions/` occurrences is counted twice — once in the raw file, once
// with whitespace removed — because these prompts are wrapped at 80 columns and
// this repository has gone red seven times on a line-by-line grep missing a
// sentence that really was there. The two counts must agree; if a path is ever
// split across a line break, the counting-once version of this case would be
// lying and it says so instead.
//
// Not covered here, on purpose: the `principles.md`-by-number pointers of the
// same DoD item live in `case-03-no-principles-by-number.mjs`, and "the rule was
// written out on the spot" is prose no case in this folder pins — both are named
// in the report that came with this file.

import { readdirSync } from "node:fs";
import { join } from "node:path";

import { REPO, repoFile, check, done } from "../lib/qa.mjs";

const ROLES_DIR = "roles";
const EXPECTED_FILES = 10;

/**
 * A path that names one decision record: the folder, then a digit. Every real
 * destination in these prompts is a folder, a `*.md` glob, or the `NNNN`
 * template, so none of them can match this.
 */
const NUMBERED_POINTER = /docs\/decisions\/(?:crd|adr)\/\d[^\s`)"'<>]*/g;

/** Any mention of the decisions folder, whatever it is used for. */
const ANY_DECISION_PATH = /docs\/decisions\//g;

/** The same pointer without its path: `ADR 0018`, `CRD-0006`. */
const NUMBERED_BY_NAME = /\b(?:ADR|CRD)[ \t-]*\d{3,4}\b/g;

/**
 * Whatever follows the folder, so a failure can show what was found. Angle
 * brackets are part of a path here — the file-name template these prompts use
 * is `NNNN-<short-name>.md` — so they are read, not treated as a boundary.
 */
const ANY_DECISION_SHAPE = /docs\/decisions\/[^\s`)"']*/g;

/**
 * The shapes a destination is allowed to take. Anything else in the ten files
 * is a name this case has never seen and must be looked at by a person, which
 * is why the default is red rather than green.
 */
const ALLOWED_SHAPES = [
  /^docs\/decisions\/(?:crd|adr)\/$/,
  /^docs\/decisions\/(?:crd|adr)\/\*\.md$/,
  /^docs\/decisions\/(?:crd|adr)\/NNNN-<short-name>\.md$/,
];

/**
 * Files that `tools/verify-mount.mjs` requires to name `docs/decisions/adr/`.
 * The list is written out because that check writes it out too: it is the same
 * five personas, and a prompt not on it has nothing watching this half of it.
 *
 * `roles/qa.md` is NOT on it, and must not be added: the QA prompt's single
 * mention of the decisions folder was a numbered pointer, T-72 DoD item 11 had
 * it removed, and nothing asks for a destination to replace it. Requiring one
 * here would go red on work the task table ordered.
 */
const ADR_DESTINATION_FILES = ["architect.md", "engineer.md", "test-engineer.md", "code-engineer.md", "doc-reviewer.md"];

const squeeze = (text) => text.replace(/\s+/g, "");
const countOf = (text, pattern) => [...text.matchAll(pattern)].length;

/** Line numbers a match sits on, so a failure sends the reader to the spot. */
const withLines = (text, pattern) => [...text.matchAll(pattern)].map((match) => {
  const line = text.slice(0, match.index).split("\n").length;
  return `${JSON.stringify(match[0])} (line ${line})`;
});

// ---------------------------------------------------------------- the ten files

const files = readdirSync(join(REPO, ROLES_DIR), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name)
  .sort();

check(
  `${ROLES_DIR}/ holds exactly ${EXPECTED_FILES} .md role prompts`,
  files.length === EXPECTED_FILES,
  `found ${files.length}: ${files.join(", ")}`,
);
check(
  `${ROLES_DIR}/pm.md is one of them`,
  files.includes("pm.md"),
  `found: ${files.join(", ")}`,
);

const text = new Map(files.map((name) => [name, repoFile(`${ROLES_DIR}/${name}`)]));

// ------------------------------------------- no pointer at a numbered record

let split = [];

for (const name of files) {
  const raw = text.get(name);
  const tight = squeeze(raw);

  const pointers = withLines(raw, NUMBERED_POINTER);
  const hiddenPointers = countOf(tight, NUMBERED_POINTER);
  check(
    `${ROLES_DIR}/${name}: no pointer at a numbered decision record`,
    pointers.length === 0 && hiddenPointers === 0,
    pointers.length
      ? `${pointers.length} found: ${pointers.join(", ")} — a numbered record exists only in this repository, so it points at nothing in the user's own. Write the rule out on the spot; a folder or the NNNN template is a destination and stays`
      : `${hiddenPointers} found only after whitespace was stripped, so the path is split across a line break in ${ROLES_DIR}/${name} and a line-by-line grep cannot see it`,
  );

  // Every remaining mention has to be one of the destination shapes.
  const odd = [...raw.matchAll(ANY_DECISION_SHAPE)]
    .map((match) => match[0])
    .filter((found) => !ALLOWED_SHAPES.some((shape) => shape.test(found)));
  check(
    `${ROLES_DIR}/${name}: every docs/decisions/ mention is a folder, a glob or the NNNN template`,
    odd.length === 0,
    `${odd.length} unrecognised: ${odd.map((found) => JSON.stringify(found)).join(", ")} — a person has to decide whether that is a destination or a pointer`,
  );

  if (countOf(raw, ANY_DECISION_PATH) !== countOf(tight, ANY_DECISION_PATH)) split.push(name);
}

check(
  "counted twice: no docs/decisions/ path is broken across a line break in any of the ten prompts",
  split.length === 0,
  `raw and whitespace-stripped counts disagree in: ${split.join(", ")} — every per-file count above is then reading less than the file says`,
);

// ------------------------------------ nor the same pointer written as a name

const byName = files
  .map((name) => ({ name, found: withLines(text.get(name), NUMBERED_BY_NAME) }))
  .filter((entry) => entry.found.length > 0);

check(
  "no role prompt names a decision record by its number either",
  byName.length === 0,
  `${byName.map((entry) => `${ROLES_DIR}/${entry.name}: ${entry.found.join(", ")}`).join("; ")} — dropping the path does not make the pointer land: that record exists only in this repository`,
);

// -------------------------------------------- and the destinations are still there

for (const name of ADR_DESTINATION_FILES) {
  const copies = countOf(text.get(name) ?? "", /docs\/decisions\/adr\//g);
  check(
    `${ROLES_DIR}/${name}: still names docs/decisions/adr/ as a destination`,
    copies >= 1,
    `${copies} found — tools/verify-mount.mjs requires this path in this file: removing a pointer must not take the write destination with it`,
  );
}

for (const [name, pattern, why] of [
  ["pm.md", /docs\/decisions\/adr\//g, "the PM writes an ADR for every decision about how, whatever the size of the job"],
  ["pm.md", /docs\/decisions\/crd\//g, "the PM writes a CRD for a scope or contract change"],
  ["architect.md", /docs\/decisions\/crd\//g, "T-70 DoD item 8: this one is a path to write to, not a file to read"],
  ["doc-reviewer.md", /docs\/decisions\/crd\/\*\.md/g, "T-77 DoD item 6: the review list names the folder, so this glob stays"],
]) {
  const copies = countOf(text.get(name) ?? "", pattern);
  check(
    `${ROLES_DIR}/${name}: still names ${String(pattern).slice(1, -2).replace(/\\/g, "")} as a destination`,
    copies >= 1,
    `${copies} found — ${why}`,
  );
}

done();
