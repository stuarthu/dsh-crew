// T-67 (checklist C-35) — DoD: PRD M1 item 10; T-71 item 7; T-77 item 7.
//
// What it proves: not one of the ten role prompts under `roles/` points at
// `principles.md` BY NUMBER. A prompt that says "see principles.md 21" is empty
// twice over in somebody else's repository: `principles.md` is not shipped in
// the npm package (the `files` list in package.json does not name it), so the
// sentence points at a numbered entry inside a file that is not there at all.
//
// WHY THE BAN IS ON A SHAPE AND NOT ON THE FILE NAME. `tools/verify-mount.mjs`
// REQUIRES the string `principles.md` in `roles/pm.md`, and T-77 item 7 requires
// it to stay in `roles/doc-reviewer.md` (it is one entry of the list of files a
// doc review reads — delete it and the doc review stops reading it). So the
// banned thing cannot be the file name. It is the pair "file name + number":
// the pointer usage, not the mention. That is the same distinction PRD DoD item
// 10 drew for B9 and item 11 drew for the renaming.
//
// PINNING STYLE: FLATTENED. `principles.md 21` can wrap — the name at the end of
// one line and the number at the start of the next — and a line-based grep finds
// nothing at all in that case. Check 3 is a self-test on exactly that: it feeds
// the matcher a folded sample and demands a hit, so a later rewrite of this file
// back to a line-based scan turns the case red instead of quietly weakening it
// (`docs/qa/gaps.md` item 21: an ABSENT pin may only be judged after flattening).
//
// SCOPE IS THE TEN PROMPTS, ON PURPOSE. Nothing here reads `CLAUDE.md`,
// `principles.md` itself, the READMEs or `docs/`. Those files talk ABOUT the
// numbered principles, and they are allowed to: they ship with the repository,
// not with the package. A version of this pin widened to the whole repository
// would be red on its first day.
//
// TWO MATCHERS, AND THE SECOND ONE IS THE ONE THAT CAN REALLY FIRE. The literal
// regex the DoD cells name — `principles\.md\s+[0-9]` — cannot see the shape as
// this project actually writes it, because the file name is nearly always inside
// backticks: in "`principles.md` 21" the character after `.md` is a backtick, so
// the literal regex misses the very pointer it was written to ban. Check 4 keeps
// the DoD's own regex, so what the cells promise is really tested. Check 5 runs a
// closing-mark-tolerant version of the same shape, so the pin still fires on the
// real formatting. A case that carried only check 4 would be another check that
// can never fire, which is the hole this whole job keeps closing.
//
// One-way: these pointers went, and they do not come back.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, done, flat, repoFile } from "../lib/qa.mjs";

const NAME = "principles.md";
const ENGINEER = "engineer.md";
const DOC_REVIEWER = "doc-reviewer.md";
const PM = "pm.md";

// The DoD cells' own shape: name, whitespace, digit.
const BY_NUMBER = /principles\.md\s+[0-9]/g;
// The same shape, tolerating the closing mark this project writes around the
// name: a backtick, quote, bracket or comma between the name and the number.
const BY_NUMBER_QUOTED = /principles\.md["'`)\]*,;:]*\s+[0-9]/g;

const files = readdirSync(join(REPO, "roles"))
  .filter((name) => name.endsWith(".md"))
  .sort()
  .map((name) => ({ name, text: repoFile(`roles/${name}`), flat: flat(repoFile(`roles/${name}`)) }));

/** Every hit of `pattern` in one prompt, as a reportable string with context. */
function hits(file, pattern) {
  const found = [];
  for (const match of file.flat.matchAll(pattern)) {
    const from = Math.max(0, match.index - 60);
    found.push(`roles/${file.name}: ${JSON.stringify(file.flat.slice(from, match.index + 40).trim())}`);
  }
  return found;
}

/** How many times `NAME` appears in one prompt, flattened. */
const mentions = (file) => file.flat.split(NAME).length - 1;

// ---------------------------------------------------------------- premises
//
// Both exist so a folder that lost a prompt, or holds ten empty ones, cannot be
// read as a pass: neither one holds a numbered pointer either. The floor is
// `>= 10` and not `=== 10` because an eleventh role must be scanned the day it
// arrives; C-01 is the case that pins the count at exactly ten.

const required = [PM, ENGINEER, DOC_REVIEWER];
const missing = required.filter((name) => !files.some((file) => file.name === name));
check(
  `roles/ holds at least 10 .md prompts, including ${required.join(", ")}`,
  files.length >= 10 && missing.length === 0,
  `${files.length} file(s): ${files.map((file) => file.name).join(", ") || "none"}${missing.length ? `; missing: ${missing.join(", ")}` : ""}`,
);

const unread = files.filter((file) => file.text.length < 500 || !file.text.startsWith("# Crew role: "));
check(
  "every prompt was actually read",
  unread.length === 0,
  `${unread.length} file(s): ${unread.map((file) => `roles/${file.name} (${file.text.length} bytes, starts ${JSON.stringify(file.text.slice(0, 20))})`).join("; ")}`,
);

// ------------------------------------------- the matcher really is flattened

const FOLDED = "the rule lives in `principles.md`\n21, read it there";
const perLine = (text) => text.split("\n").some((line) => new RegExp(BY_NUMBER_QUOTED.source).test(line));
check(
  "the matcher finds a pointer that wraps across two lines",
  new RegExp(BY_NUMBER_QUOTED.source).test(flat(FOLDED)) && !perLine(FOLDED),
  `sample ${JSON.stringify(FOLDED)} must match once flattened and must be invisible to a line-by-line scan, or the two scans here are the same scan and the folding case is untested`,
);

// ------------------------------- PRD M1 item 10: no numbered pointer, ten files

const literal = files.flatMap((file) => hits(file, BY_NUMBER));
check(
  `no prompt points at ${NAME} by number (the DoD cells' own regex, flattened)`,
  literal.length === 0,
  `${literal.length} hit(s):\n      ${literal.slice(0, 10).join("\n      ")}`,
);

const quoted = files.flatMap((file) => hits(file, BY_NUMBER_QUOTED));
check(
  `no prompt points at ${NAME} by number with a closing mark between them either`,
  quoted.length === 0,
  `${quoted.length} hit(s):\n      ${quoted.slice(0, 10).join("\n      ")}`,
);

// ------------------------------------------------------------- T-71 item 7

const engineer = files.find((file) => file.name === ENGINEER);
check(
  `roles/${ENGINEER} does not name ${NAME} at all`,
  engineer !== undefined && mentions(engineer) === 0,
  engineer
    ? `${mentions(engineer)} mention(s):\n      ${hits({ ...engineer }, new RegExp(NAME.replace(".", "\\."), "g")).slice(0, 10).join("\n      ")}`
    : `roles/${ENGINEER} is missing`,
);

// ------------------------------------------------------------- T-77 item 7
//
// This is also the presence anchor of the two ABSENT checks above. Without it,
// deleting the name from every prompt would leave them green while the doc
// review quietly stopped reading the file it is told to review.

const reviewer = files.find((file) => file.name === DOC_REVIEWER);
check(
  `roles/${DOC_REVIEWER} still names ${NAME} as one of the files it reviews`,
  reviewer !== undefined && mentions(reviewer) >= 1,
  reviewer ? `${mentions(reviewer)} mention(s), so the entry in the review list is gone` : `roles/${DOC_REVIEWER} is missing`,
);

console.log(`note  ${NAME} is mentioned ${files.reduce((sum, file) => sum + mentions(file), 0)} time(s) across ${files.length} prompt(s): ${files.filter((file) => mentions(file) > 0).map((file) => `${file.name} ${mentions(file)}`).join(", ") || "none"}`);

done();
