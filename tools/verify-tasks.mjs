// Checks the Verdicts gate in docs/design/tasks.md: every task section carries
// one Verdicts line, and every `not run` or `skipped` value carries its own
// reason. Run it with:  node tools/verify-tasks.mjs
//
// CRD 0011. The PM skipped code review on about twenty tasks of this job and
// doc review on most of it, and nothing went red — it came out only because the
// user asked. The rule the user chose (option B) guards honesty and visibility,
// not "the review must happen": a skip is allowed, a silent skip is not.
//
// What this proves, and what it cannot: the Verdicts line is written by the PM,
// and reviewers cannot write files by design (principles.md 12). So this check
// proves the line was written and every skip carries a sentence. It does not
// prove a review happened — a PM that types `code: pass` passes. No automated
// check can close that hole.

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL  ${message}`); };
const ok = (message) => console.log(`ok    ${message}`);

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TASKS = "docs/design/tasks.md";
const tasksFile = join(packageRoot, TASKS);

// Only headings of the form `## T-<number>` are task sections. `## T-23 / T-24`
// — one heading, two task ids — is one section and needs one Verdicts line.
// Every other heading is ignored, so the appendix sections need no special-case
// skip rule: they simply are not task sections.
const HEADING = /^##\s+(T-\d+(?:\s*\/\s*T-\d+)*)\b/;
// The line, not a table column: `- **Verdicts**：code: … ｜ security: … ｜ …`.
const VERDICTS = /^\s*-\s*\*\*Verdicts\*\*[：:]\s*(.*)$/;

if (!existsSync(tasksFile)) {
  fail(`${TASKS} is missing, so nothing records whether a task's four reviews ran (CRD 0011)`);
  console.log(`\n${failures} Verdicts check(s) failed`);
  process.exit(1);
}

const lines = readFileSync(tasksFile, "utf8").split("\n");
const sections = [];
let current = null;
let fenced = false;
for (const [index, line] of lines.entries()) {
  // Inside a fenced code block everything is illustration: this file shows
  // commands, and a markdown example of the Verdicts line would otherwise be
  // read as a real task's record.
  if (line.startsWith("```")) {
    fenced = !fenced;
    continue;
  }
  if (fenced) continue;

  // A `# ` or `## ` heading closes the section before it. The appendix parts
  // late in the file are level-1 headings, so a line under one of them belongs
  // to no task — not to the last task section above it.
  if (/^#{1,2}\s/.test(line)) {
    const heading = HEADING.exec(line);
    current = heading ? { id: heading[1], line: index + 1, verdicts: [] } : null;
    if (current) sections.push(current);
    continue;
  }
  // A Verdicts line outside any task section — the appendix that explains the
  // shape, for one — belongs to no task and is not read.
  if (current) {
    const verdicts = VERDICTS.exec(line);
    if (verdicts) current.verdicts.push({ line: index + 1, content: verdicts[1] });
  }
}

// A green with nothing found is the worst outcome: it reads exactly like a green
// with everything found. If the file's shape moved, say so instead.
if (sections.length === 0) {
  fail(`${TASKS} has no \`## T-<number>\` section, so this check would pass without reading a single Verdicts line — the file's shape moved (CRD 0011)`);
} else {
  ok(`${TASKS}: ${sections.length} task sections read`);
}

// Fail condition 1 of CRD 0011: exactly one Verdicts line per task section. None, and
// nothing records whether the four reviews ran; two, and a reader cannot tell
// which one counts.
for (const section of sections) {
  if (section.verdicts.length === 0) {
    fail(`${TASKS} section "${section.id}" (line ${section.line}) has no \`- **Verdicts**：\` line, so nothing records whether its four reviews ran (CRD 0011)`);
  } else if (section.verdicts.length > 1) {
    fail(`${TASKS} section "${section.id}" (line ${section.line}) has ${section.verdicts.length} Verdicts lines, so no reader can tell which one counts. Keep exactly one (CRD 0011)`);
  }
}

// The four values, in the shape the file uses: `code: … ｜ security: … ｜ qa: …
// ｜ doc: …`. Anything on the line that is not one of the four keys — a trailing
// parenthetical, for one — is not a value and is not read as one.
const KEYS = ["code", "security", "qa", "doc"];
const VALUE = /^\s*(code|security|qa|doc)\s*[：:]\s*([\s\S]*)$/i;

/** The four values of one Verdicts line, by key. A key can be missing. */
function valuesOf(content) {
  const found = new Map();
  for (const segment of content.split(/[｜|]/)) {
    const value = VALUE.exec(segment);
    if (value) found.set(value[1].toLowerCase(), value[2].trim());
  }
  return found;
}

// Fail condition 2 of CRD 0011: all four values, or the line says nothing about
// the review it left out.
let notRun = 0;
let skipped = 0;
for (const section of sections) {
  if (section.verdicts.length !== 1) continue; // already failed above
  const { line, content } = section.verdicts[0];
  const values = valuesOf(content);
  const missing = KEYS.filter((key) => !values.has(key));
  if (missing.length > 0) {
    fail(`${TASKS} section "${section.id}" (line ${line}) Verdicts line has no \`${missing.join("`, `")}\` value, so it says nothing about that review. All four are required: ${KEYS.join(", ")} (CRD 0011)`);
  }

  for (const [key, value] of values) {
    // T-40's DoD, item 5 (the CRD's own list stops at three): `changes needed`
    // is only half a record until it says which task fixes it. Without a task
    // id the finding has no owner.
    if (/^changes needed\b/i.test(value) && !/T-\d+/.test(value)) {
      fail(`${TASKS} section "${section.id}" (line ${line}) \`${key}: changes needed\` names no task id, so the fix has no owner. Say which T-<number> carries it (CRD 0011)`);
    }

    const skip = /^(not run|skipped)\b([\s\S]*)$/i.exec(value);
    if (!skip) continue;
    if (/^not run\b/i.test(value)) notRun += 1;
    else skipped += 1;

    // Fail condition 3 of CRD 0011: `not run — <why>` or `skipped — <why>`, and the dash
    // must be followed by real text. A general parenthetical at the end of the
    // line does not count: it cannot say which of the four values it covers,
    // and the record of this job was exactly that shape — a parenthetical about
    // code review and doc review, on a line whose `security: not run` and
    // `qa: not run` it never mentioned.
    const word = skip[1].toLowerCase();
    if (/^\s*[—–-]+\s*$/.test(skip[2])) {
      fail(`${TASKS} section "${section.id}" (line ${line}) \`${key}: ${word}\` has a dash with nothing after it. Write the reason: a skip is allowed, a silent skip is not (CRD 0011)`);
    } else if (!/^\s*[—–-]+\s*\S/.test(skip[2])) {
      fail(`${TASKS} section "${section.id}" (line ${line}) \`${key}: ${word}\` carries no reason of its own. Write \`${word} — <why>\`: a skip is allowed, a silent skip is not (CRD 0011)`);
    }
  }
}

if (failures === 0) {
  ok("every task section carries one Verdicts line, all four values, a reason for every `not run` and `skipped`, and a task id for every `changes needed`");
}

console.log(`\nVerdicts totals across ${sections.length} task sections: ${notRun} not run, ${skipped} skipped.`);
console.log("Passing is not the same as clean. This check proves the line was written and every skip carries a reason; it cannot prove a review happened — a `code: pass` typed by the PM passes it (CRD 0011).");
console.log(failures === 0 ? "\nall Verdicts checks passed" : `\n${failures} Verdicts check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
