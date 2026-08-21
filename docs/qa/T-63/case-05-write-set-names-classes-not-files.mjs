// T-63 DoD item 4 (and the common item 1 of T-70 to T-78; `CRD 0023` decision three).
//
// What this proves: inside the `## What you may write` section of each of the ten
// role prompts under `roles/`, there is no CONCRETE PRD or HLD file name.
//
// Why it matters. `CRD 0023` decision two makes the opening document's file name
// carry the job it belongs to — `docs/design/prd-<date>-<job-slug>.md` — so the
// name CHANGES WITH EVERY JOB. A write set that hard-codes `docs/design/prd.md`
// is therefore wrong from the next job onwards, and wrong invisibly: nothing
// errors, the role simply reads a rule about a file that does not exist. That is
// the whole reason decision three says "by class, never by file name".
//
// ---------------------------------------------------------------------------
// THE CRITERION: what counts as a "concrete file name"
// ---------------------------------------------------------------------------
// This is the one judgement this case had to make, so it is written down here
// AND made executable in group 1 below (`CRITERION`), rather than left for the
// next reader to guess.
//
// BANNED — a concrete name, one that rots when the next job starts:
//   * `prd.md`, `hld.md`, `docs/design/prd.md`, `docs/design/hld.md`
//     (the old fixed names decision two replaced);
//   * `docs/design/prd-2026-08-21-apply-req.md` — one job's real name;
//   * `prd-2026-08-21-apply-req` — the same name with the extension left off.
//
// ALLOWED:
//   * class words: "the opening document", "a PRD", "an HLD", "the design";
//   * the SHAPE with placeholders in it: `docs/design/prd-<date>-<job-slug>.md`,
//     `docs/design/hld-<date>-<job-slug>.md`.
//
// Why the placeholder shape is allowed. It is not a file name; it is the naming
// rule, which is exactly what decision two settled and what does NOT rot next
// job. What `CRD 0023` decision three bans is a write set that hard-codes
// `docs/design/prd.md`, and what the DoD cell bans is "any one CONCRETE PRD file
// name". A shape with `<...>` in it is neither of those.
//
// This is a DELIBERATE narrowing of the checklist line for C-05, which listed the
// banned strings as `prd.md`, `hld.md`, `prd-` and `hld-`. Read literally, `prd-`
// would also ban the placeholder shape. Both readings are green today (no section
// contains either), but the difference is not academic: `roles/security-reviewer.md`
// already carries `docs/design/prd-<date>-<job-slug>.md` on line 70, four lines
// below the end of its write-set section, and `roles/architect.md`,
// `roles/pm.md` carry it too. One paragraph moving up would turn the literal
// reading red on text that is correct. The narrowing is reported to the PM.
//
// KNOWN LIMIT (stated so nobody reads more into a green than is there): a
// concrete name with no extension, no digit and no second dash — `prd-apply` —
// is not detected. Detecting it needs a rule that also fires on ordinary English
// such as "a PRD-shaped document", and a check with false reds gets weakened.
//
// ---------------------------------------------------------------------------
// The traps this case was written against, and what it does about each
// ---------------------------------------------------------------------------
//   * "cut the wrong section" — group 2 checks the cut before group 3 judges it:
//     the heading occurs exactly once, on its own line, at the start of a line,
//     and the cut STOPS at a real following `## ` heading rather than running to
//     end of file (a section that became the last one would otherwise swallow
//     the whole tail of the file and judge text it does not own). Every cut's
//     length is printed, so an implausible number is visible.
//   * "the pinned string moved" — nothing here pins prose. It pins the ABSENCE of
//     a shape, and the shape is described by a rule, not by one literal string.
//   * "a proxy metric" — it does not ask whether the section says "by class". It
//     reads the section's own text and looks for the thing that rots.
//   * "read the wrong file" — the ten files come from `readdirSync("roles")`, so a
//     new eleventh role prompt is judged too, and every path is printed.
//
// Group 4 is this case's own negative control: it copies the repository, hard-codes
// a name in ONE prompt's section and a placeholder shape in another, and asserts
// the scanner reports exactly the first one. The real repository is read-only here.
//
// It owns nothing else: "exactly ten role files" is C-01's pin, the word-for-word
// rule A and rule B copies are C-02 and C-03, and the "Reading is not restricted"
// sentence is C-04. This case only asks what is NOT in the section.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { REPO, check, cleanUp, done, edit, flat, section, tempRepo } from "../lib/qa.mjs";

const HEADING = "What you may write";

/** A `<...>` placeholder makes a token a shape, not a name. */
const hasPlaceholder = (token) => /<[^<>\s]*>/.test(token);

/**
 * Rule 1 — a token shaped like a file name, ending in `.md`, whose name mentions
 * PRD or HLD. `docs/design/prd.md`, `PRD.md`, `prd-2026-08-21-apply-req.md`.
 * Token characters exclude whitespace and punctuation such as `,`, so ordinary
 * prose ("a PRD, and docs/design/tasks.md") cannot be joined into a match.
 */
const NAMED_FILE = /[\w./@-]*(?:prd|hld)[\w.<>@-]*\.md/gi;

/**
 * Rule 2 — the same name with the `.md` left off: `prd-` or `hld-` followed by a
 * run that looks like a name, meaning it starts with a digit (a date) or carries
 * a further `-` or `.` (more name parts). "a PRD-shaped document" does neither.
 */
const NAMED_STEM = /(?:prd|hld)-[\w.<>-]*/gi;

/** Every concrete PRD/HLD file name in a piece of text, in order, deduplicated. */
export function concreteNames(text) {
  const found = [];
  for (const match of text.matchAll(NAMED_FILE)) {
    if (!hasPlaceholder(match[0])) found.push(match[0]);
  }
  for (const match of text.matchAll(NAMED_STEM)) {
    const token = match[0];
    if (hasPlaceholder(token)) continue;
    const rest = token.slice(4);
    if (!/^\d/.test(rest) && !/[-.]/.test(rest)) continue;
    if (found.some((already) => already.includes(token))) continue;
    found.push(token);
  }
  return [...new Set(found)];
}

// --------------------------------------------------------------- group 1
// The criterion itself, executable. Change the rule and these go red.

const CRITERION = [
  // [text, must a concrete name be found?, why it is in the table]
  ["the opening document at `docs/design/prd.md`", true, "the old fixed PRD name"],
  ["read `prd.md` first", true, "the fixed name, bare"],
  ["read `PRD.md` first", true, "the fixed name, upper case"],
  ["the design in `docs/design/hld.md`", true, "the old fixed HLD name"],
  ["`hld.md`", true, "the fixed HLD name, bare"],
  ["this job's `docs/design/prd-2026-08-21-apply-req.md`", true, "one job's real name"],
  ["see prd-2026-08-21-apply-req for the scope", true, "a real name with no extension"],
  ["`docs/design/hld-2026-08-21-apply-req.md`", true, "one job's real HLD name"],
  ["the **opening document** of a job, and nobody else writes it", false, "class words only"],
  ["The opening document of a job (a PRD, one per job)", false, "the acronym as a class name"],
  ["The design (an HLD, one per job)", false, "the acronym as a class name"],
  ["its name is `docs/design/prd-<date>-<job-slug>.md`", false, "the SHAPE, which does not rot"],
  ["the same shape (`docs/design/hld-<date>-<job-slug>.md`)", false, "the HLD shape"],
  ["the task table at `docs/design/tasks.md`", false, "a durable name, and not a PRD or HLD"],
  ["the standing gap list `docs/qa/gaps.md`", false, "a durable name"],
  ["a PRD-shaped document is not a design", false, "English hyphenation, not a file name"],
];

for (const [text, banned, why] of CRITERION) {
  const found = concreteNames(text);
  check(
    `criterion: ${banned ? "banned" : "allowed"} — ${why}: ${JSON.stringify(text)}`,
    banned ? found.length > 0 : found.length === 0,
    banned
      ? "the rule found no concrete name in text that holds one"
      : `the rule wrongly called this a concrete name: ${JSON.stringify(found)}`,
  );
}

// --------------------------------------------------------------- group 2 & 3
// The cut, then what is inside it.

/**
 * Cut the write-set section out of every role prompt under `roles/` of one
 * repository root, checking the cut is the one it claims to be.
 *
 * @returns [{ file, text, length, headings, startsAtLineStart, stopsAtNextHeading }]
 */
function writeSets(root) {
  const dir = join(root, "roles");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const relative = `roles/${name}`;
      const whole = readFileSync(join(dir, name), "utf8");
      const headings = (whole.match(/^## What you may write[ \t]*$/gm) ?? []).length;
      let text = "";
      let startsAtLineStart = false;
      let stopsAtNextHeading = false;
      try {
        text = section(whole, HEADING);
        const at = whole.indexOf(text);
        startsAtLineStart = at === 0 || whole[at - 1] === "\n";
        stopsAtNextHeading = whole.slice(at + text.length).startsWith("\n## ");
      } catch { /* headings === 0 is the finding; text stays empty */ }
      return { file: relative, text, length: text.length, headings, startsAtLineStart, stopsAtNextHeading };
    });
}

const sections = writeSets(REPO);

console.log(`\nthe cut, one line per role prompt (${sections.length} file(s) under roles/):`);
for (const s of sections) {
  console.log(
    `  ${s.file.padEnd(28)} chars=${String(s.length).padStart(5)}  lines=${String(s.text ? s.text.split("\n").length : 0).padStart(3)}` +
    `  headings=${s.headings}  line-start=${s.startsAtLineStart}  stops-at-next-##=${s.stopsAtNextHeading}`,
  );
}
console.log("");

check(
  "roles/ holds at least the ten role prompts this case must read",
  sections.length >= 10,
  `readdirSync found ${sections.length} .md file(s): ${sections.map((s) => s.file).join(", ")} — C-01 owns the exact count`,
);

for (const s of sections) {
  check(
    `${s.file}: exactly one "## ${HEADING}" heading, on its own line`,
    s.headings === 1,
    `found ${s.headings} — with none there is nothing to judge, with two the cut is ambiguous`,
  );
  check(
    `${s.file}: the cut starts at the beginning of a line`,
    s.startsAtLineStart,
    "the section was found mid-line, so it may be a deeper heading such as `### What you may write`",
  );
  check(
    `${s.file}: the cut stops at the next "## " heading, not at end of file`,
    s.stopsAtNextHeading,
    `the write-set section is now the last section of the file, so the cut (${s.length} chars) runs to the end and this case would judge text it does not own — give the file a following "## " heading, or teach this case the new shape on purpose`,
  );
}

for (const s of sections) {
  const found = concreteNames(s.text);
  check(
    `${s.file}: no concrete PRD or HLD file name inside the "${HEADING}" section`,
    found.length === 0,
    `found ${found.length}: ${JSON.stringify(found)}\n      ` +
    `write the class, or the shape \`docs/design/prd-<date>-<job-slug>.md\` — a fixed name is wrong from the next job on (CRD 0023 decision two)\n      ` +
    found.map((name) => {
      const line = flat(s.text.split("\n").find((l) => l.includes(name)) ?? "").slice(0, 160);
      return `in: ${line}`;
    }).join("\n      "),
  );
}

// --------------------------------------------------------------- group 4
// Negative control: break a copy, and the scanner must say so.

const copy = tempRepo();
try {
  const before = readdirSync(join(REPO, "roles")).length;

  edit(
    copy,
    "roles/qa.md",
    `## ${HEADING}\n`,
    `## ${HEADING}\n\n- the opening document at \`docs/design/prd.md\`;\n`,
  );
  edit(
    copy,
    "roles/architect.md",
    `## ${HEADING}\n`,
    `## ${HEADING}\n\n- the design, named \`docs/design/hld-<date>-<job-slug>.md\`;\n`,
  );

  // Measured against the repository's own result, not against zero, so this
  // control says one thing only — "the two edits changed exactly these verdicts"
  // — and does not go red a second time over a real finding group 3 already
  // reported.
  const already = new Set(sections.filter((s) => concreteNames(s.text).length > 0).map((s) => s.file));
  const guilty = writeSets(copy)
    .map((s) => ({ file: s.file, found: concreteNames(s.text) }))
    .filter((s) => s.found.length > 0 && !already.has(s.file));

  check(
    "negative control: a hard-coded `docs/design/prd.md` in one section is found",
    guilty.length === 1 && guilty[0].file === "roles/qa.md" && guilty[0].found.includes("docs/design/prd.md"),
    `the two edits should make roles/qa.md and nothing else newly guilty, got ${JSON.stringify(guilty)}`,
  );
  check(
    "negative control: the placeholder shape in another section is NOT called a file name",
    !guilty.some((s) => s.file === "roles/architect.md"),
    `roles/architect.md was flagged for the shape: ${JSON.stringify(guilty.find((s) => s.file === "roles/architect.md"))}`,
  );
  check(
    "negative control: the copy was edited, the repository was not",
    readdirSync(join(REPO, "roles")).length === before &&
      !readFileSync(join(REPO, "roles", "qa.md"), "utf8").includes("docs/design/prd.md"),
    "the real roles/qa.md now holds `docs/design/prd.md` — the mutation escaped the copy",
  );
} finally {
  cleanUp(copy);
}

done();
