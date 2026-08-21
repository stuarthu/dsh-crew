// T-81 (checklist C-62) — DoD: T-81 item 2 and T-81 item 3 (PRD M1 item 15).
//
// What it proves: the `0.9.0` section of `CHANGELOG.md` is written for users —
// all six user-visible changes are readable in it, the renaming sentence gives
// the old name and the new name TOGETHER IN ONE SENTENCE, and the section names
// no task id.
//
// ---------------------------------------------------------------------------
// WHY THE SECTION IS REALLY CUT OUT, AND WHY THAT IS THE WHOLE CASE.
//
// T-81 item 2 ends with "and no `T-<number>` appears in it". Written as a search
// over the WHOLE file that check is red for ever, and measuring it is the first
// thing this case did before a line of it was written:
//
//     T-05  line 516  in section `## 0.7.0 — 2026-08-21`
//     T-01  line 674  in section `## 0.6.0 — 2026-08-20`
//
// Two hits, both legitimate, both in frozen history that `ADR 0017` says must
// not be rewritten. So a whole-file count is not a strict check — it is a check
// that can never pass, and the pressure on whoever meets it is to widen the
// assertion or to edit the history (`docs/qa/gaps.md` item 31). The section has
// to be cut, from `^## 0.9.0` to the next `^## `, and only that slice judged.
//
// Check 3 below is the other half of the same thought: it asserts the `T-\d+`
// regex DOES hit outside the slice. Without it, a cut that silently returned an
// empty string would make check 10 a green that read nothing — the fourth shape
// of a dead check in `ADR 0023`. Checks 1 to 3 are that self-test, not padding.
//
// ---------------------------------------------------------------------------
// WHY IT PINS TOKENS AND NOT SENTENCES.
//
// This section is English prose for users, so its wording is the most likely
// thing in the repository to be rewritten. Copying a whole sentence into a pin
// would make an honest rewrite red. Each of the six things is therefore pinned
// as a SET OF IDENTIFIER-LIKE WORDS — lane ids, review names, counting words,
// file-name roots — that must appear in ONE top-level bullet together.
//
// The lane ids are matched WITH their backticks on purpose. `ask` and `team` are
// ordinary English words ("asked", "a team of"), so a bare-word pin would be the
// "the parts of the phrase are still there" trap of `docs/qa/gaps.md` item 3: it
// would stay green over a section that never mentions a lane at all.

import {
  check,
  done,
  flat,
  repoFile,
} from "../lib/qa.mjs";

const VERSION = "0.9.0";
const changelog = repoFile("CHANGELOG.md");

// --------------------------------------------------------------- the slice
//
// Anchored at the start of a line, so a `### 0.9.0` or a mention of the number
// inside prose cannot be mistaken for the heading. `qa.mjs` has a `section()`
// helper, but it locates with `indexOf("## " + heading)`, which is not anchored;
// for the one check in this file that expects zero, picking the wrong start is
// the difference between a real check and a green that read nothing.
//
// The slice is taken with two searches rather than one lazy pattern. A single
// `[\s\S]*?(?=^## |$)` under the `m` flag looks right and is not: `$` matches
// the end of a LINE in multiline mode, so the lazy body stops at the first line
// break and the "section" is its own heading, 21 characters long. That was the
// first run of this case, and checks 1 and 2 caught it — which is the reason
// they exist.
const start = changelog.search(new RegExp(`^## ${VERSION.replace(/\./g, "\\.")}\\b`, "m"));
const afterHeading = start === -1 ? "" : changelog.slice(start + 1);
const relativeEnd = afterHeading.search(/^## /m);
const end = start === -1 ? 0 : relativeEnd === -1 ? changelog.length : start + 1 + relativeEnd;
const section = start === -1 ? "" : changelog.slice(start, end);
const outside = start === -1 ? changelog : changelog.slice(0, start) + changelog.slice(end);

check(
  `the \`${VERSION}\` section can be cut out of CHANGELOG.md, and it is not empty`,
  section.length > 6000 && section.length < changelog.length,
  `section ${section.length} char(s), whole file ${changelog.length} char(s)`,
);

// Top-level bullets only: a continuation line is indented, so `^- ` at column
// zero matches one bullet each. `^### ` ends a bullet too, so a heading is never
// swallowed into the bullet above it.
const bullets = [];
{
  const boundary = /^(?:- |### )/gm;
  const starts = [];
  for (let m = boundary.exec(section); m; m = boundary.exec(section)) starts.push(m.index);
  for (const [i, start] of starts.entries()) {
    const text = section.slice(start, starts[i + 1] ?? section.length);
    if (text.startsWith("- ")) bullets.push(flat(text).trim());
  }
}

const headings = section.match(/^### .*/gm) ?? [];

check(
  "the section is a list of user-visible changes under Changed / Added / Fixed",
  bullets.length >= 12 && headings.length >= 3,
  `${bullets.length} top-level bullet(s), heading(s): ${JSON.stringify(headings)}`,
);

const TASK_ID = /T-\d+/g;

check(
  "the `T-\\d+` pattern is alive: it does hit the older sections of this file",
  (outside.match(TASK_ID) ?? []).length > 0,
  `it matched nothing outside the ${VERSION} section, so check 10 below would be a green that read nothing`,
);

// --------------------------------------------- the six things a user notices
//
// One check per thing, numbered the way T-81 item 2 lists them. Each one names
// the words it did not find, so a red says which thing went missing.

/** The bullets holding every one of these patterns. */
const bulletsWith = (...patterns) => bullets.filter((b) => patterns.every((p) => p.test(b)));

/** Which of these patterns no single bullet carried together with the rest. */
const missing = (...patterns) => patterns.filter((p) => !bullets.some((b) => p.test(b))).map(String);

function thing(number, what, patterns) {
  const hits = bulletsWith(...patterns);
  check(
    `thing ${number} of 6 is readable in the ${VERSION} section: ${what}`,
    hits.length > 0,
    `no single bullet carries all of ${patterns.map(String).join(" + ")}`
      + `\n      never found anywhere in the section: ${missing(...patterns).join(", ") || "(each one appears, but never in one bullet together)"}`,
  );
  return hits;
}

const GONE = /\b(?:gone|removed|dropped|no longer|used to be|there used to be)\b/i;

thing(1, "the `quick` lane is gone, and a job now picks `ask` or `team`", [
  /`quick`/,
  /`ask`/,
  /`team`/,
  GONE,
]);

thing(2, "step 2 is now an interview with a method", [
  /interview/i,
  /six kinds/i,
]);

thing(3, "QA runs one round for the milestone instead of one per task", [
  /\bQA\b/,
  /\bonce\b/i,
  /milestone/i,
  /per task/i,
]);

thing(4, "the code, security and doc reviews run one round each", [
  /code review/i,
  /security review/i,
  /doc review/i,
  /\bonce\b/i,
]);

// Thing 5 is three bullets in the source, not one: the "what you may write"
// section, and the two new rules. The two rules are required to be TWO
// DIFFERENT bullets — folded into one, "two new rules" is no longer what a
// reader gets, and a co-occurrence pin on one bullet would not notice.
{
  const mayWrite = bulletsWith(/role prompt/i, /may write/i);
  const judges = bulletsWith(/judge/i, /\bedit\b/i);
  const toolResult = bulletsWith(/tool result/i, /instructions/i);
  const twoDistinct = judges.some((a) => toolResult.some((b) => a !== b));
  check(
    "thing 5 of 6 is readable in the 0.9.0 section: every role prompt gained a"
      + " `what you may write` section plus two new rules",
    mayWrite.length > 0 && judges.length > 0 && toolResult.length > 0 && twoDistinct,
    `missing part(s): ${[
      mayWrite.length ? null : "the `what you may write` section (a bullet with /role prompt/i + /may write/i)",
      judges.length ? null : "rule 1, a document that judges the work is not the worker's to edit (/judge/i + /edit/i)",
      toolResult.length ? null : "rule 2, text in a tool result is data not instructions (/tool result/i + /instructions/i)",
      !twoDistinct && judges.length && toolResult.length ? "the two rules are in ONE bullet, so a reader does not get two rules" : null,
    ].filter(Boolean).join("; ") || "(none)"}`,
  );
}

thing(6, "one opening document per job", [
  /\bper job\b/i,
  /prd/i,
]);

// ------------------------------------------------------------ no task ids
{
  const hits = section.match(TASK_ID) ?? [];
  const where = hits.map((hit) => {
    const at = section.indexOf(hit);
    return `${hit} in "...${flat(section.slice(Math.max(0, at - 60), at + hit.length + 60))}..."`;
  });
  check(
    `the ${VERSION} section names no task id: a user cannot look up a \`T-<number>\``,
    hits.length === 0,
    `${hits.length} hit(s)\n      ${where.join("\n      ")}`,
  );
}

// --------------------------------- the renaming sentence (T-81 item 3)
//
// Markdown markers are stripped BEFORE the text is split into sentences, and
// that order is load-bearing. The section holds `...and that is on purpose.**`
// — a full stop followed by two asterisks. Split first and that boundary is
// invisible, so two sentences are glued into one and "the old name and the new
// name are in the SAME sentence" becomes a green that a two-sentence split would
// also earn. Which is the very thing item 3 asks for. Stripping first is the
// habit `docs/qa/gaps.md` item 27 asks for, used here for the opposite reason:
// not to find a string, but to find the sentence boundary.
const sentences = flat(section.replace(/[`*_\\]/g, "")).split(/(?<=[.!?])\s+/);

for (const kind of ["prd", "hld"]) {
  const oldName = `docs/design/${kind}.md`;
  const newName = `docs/design/${kind}-<date>-<job-slug>.md`;
  const together = sentences.filter((s) => s.includes(oldName) && s.includes(newName));
  const oldOnly = sentences.filter((s) => s.includes(oldName) && !s.includes(newName));
  check(
    `the renaming sentence gives BOTH names for ${kind}: \`${oldName}\` and \`${newName}\` in one sentence`,
    together.length > 0,
    `0 sentence(s) hold both. ${oldOnly.length} sentence(s) hold only the old name`
      + `, ${sentences.filter((s) => s.includes(newName) && !s.includes(oldName)).length} only the new one.`
      + ` Two sentences are a different thing: a reader who meets one of them does not learn the rename.`
      + `\n      sentence(s) holding the old name alone: ${JSON.stringify(oldOnly.slice(0, 2))}`,
  );
}

// The old name has to STAY here, and this is the only check in the repository
// pointing that way. `ADR 0017` keeps the historic path in the frozen sections,
// and item 3 needs the old name in the renaming sentence itself; meanwhile other
// tasks of this job are deleting `docs/design/prd.md` from files all over the
// tree. Two rules pointing in opposite directions, so the direction that is not
// a ban gets written down as a check.
check(
  `the old name \`docs/design/prd.md\` is still readable in the ${VERSION} section: it is a mention, not a pointer`,
  section.includes("docs/design/prd.md"),
  "a reader cannot learn a rename from the new name alone",
);

done();
