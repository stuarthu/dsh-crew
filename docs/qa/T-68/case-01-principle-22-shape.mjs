// T-68 DoD items 1, 2 and 3 (PRD M1 DoD item 4): principle 22 of
// `principles.md` exists, its heading is about asking questions, and the four
// parts every principle in this file carries — the rule, why it exists with
// this repository's own evidence, the files that carry it, and the outside
// sources — are all present INSIDE that one section, with the "lives in" part
// naming step 2 of `roles/pm.md` rather than the whole file.
//
// Why it is written this way (three deliberate choices):
//
//   1. It judges by SHAPE, not by copying whole sentences. Prose gets reworded;
//      the four bold paragraph markers are this file's own structure and every
//      other principle uses them (checked against principles 6, 13, 18, 20 and
//      21 before this case was written). A case that pinned a sentence of the
//      rule would go red the next time somebody improves the wording, which is
//      not what this DoD asks about.
//   2. It really CUTS the section. The slice runs from the `## 22.` heading to
//      the next line starting with `## `, and one check proves the slice holds
//      exactly one `## ` line. Searching the whole file instead would let the
//      four parts be satisfied by any other principle's paragraphs — and one of
//      the mutations below (a `## ` heading pushed into the middle of principle
//      22) is green in a whole-file search and red here.
//   3. Every anchor was verified against the source file first, not copied from
//      the DoD wording (`docs/qa/gaps.md` items 27 and 31). Note what that
//      turned up: the heading does NOT contain the word "Socratic", so
//      "the heading says Socratic interview" is checked as "the heading is about
//      asking questions" plus a separate check that the section itself names the
//      method. See the report line about the checklist wording.
//
// Not this case's job, on purpose: the six kinds of question, the funnel, the
// two failure modes, the stop rule and the "at least 10 links" count are
// T-68 DoD items 4, 5 and 6 and belong to `case-02` in this folder. This case
// asserts the Source part carries at least one external link, which is what
// makes it a "sources" part at all, and leaves the number to `case-02`.
//
// Read-only: it reads `principles.md` and writes nothing anywhere.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("principles.md");
const lines = text.split("\n");

// ---------------------------------------------------------------- the slice
//
// From the `## 22.` heading line to the line before the next `## ` heading.
const headingIndex = lines.findIndex((line) => /^## 22\. /.test(line));
const headingCount = lines.filter((line) => /^## 22\./.test(line)).length;

check(
  "principles.md has exactly one `## 22.` heading (T-68 DoD item 1)",
  headingIndex !== -1 && headingCount === 1,
  `found ${headingCount} line(s) matching /^## 22\\./`,
);

if (headingIndex === -1) {
  // Nothing below can say anything true without the section. Fail loudly here
  // rather than report a pile of misleading reds about missing paragraphs.
  check("principle 22 section can be sliced", false, "no `## 22.` heading, so there is no section to read");
  done();
}

const heading = lines[headingIndex];
const after = lines.slice(headingIndex + 1);
const nextHeading = after.findIndex((line) => /^## /.test(line));
const sectionLines = nextHeading === -1 ? after : after.slice(0, nextHeading);
const section = [heading, ...sectionLines].join("\n");
const flatSection = flat(section);

// This is not a self-check on the slicing code above — that code cannot leave a
// `## ` line in the body, so asserting it does not is a check that can never
// fail (`docs/qa/gaps.md` items 21 and 28). What can really break is the far
// end: if no `## ` heading follows principle 22, the slice swallows the rest of
// the file, and then every part below could be satisfied by text that does not
// belong to principle 22 at all. `## Words we use` follows it today (T-68 DoD
// item 9), so the bound exists and this pins that it does.
check(
  "section 22 is bounded by a following `## ` heading, so the slice is not the file tail",
  nextHeading !== -1 && section.length < text.length,
  nextHeading === -1
    ? "no `## ` heading follows principle 22, so the slice runs to the end of the file and every check below reads text that may not be principle 22's"
    : `slice is ${section.length} of ${text.length} characters`,
);

console.log(`note  section 22 sliced: ${section.length} characters, ${section.split("\n").length} lines (heading at line ${headingIndex + 1})`);

// -------------------------------------------------------------- the heading
//
// The DoD asks that the heading be about the interview. Judged as: it asks, and
// it is about questions. Both words, so a heading renamed to something else
// entirely goes red, while a reworded heading about asking questions stays green.
check(
  "the `## 22.` heading is about asking questions (T-68 DoD item 1)",
  /\bask/i.test(heading) && /\bquestion/i.test(heading),
  `heading is: ${JSON.stringify(heading)}`,
);

check(
  "the section itself names the method it comes from (Socratic)",
  /socratic/i.test(flatSection),
  "no case-insensitive match for \"socratic\" anywhere inside section 22",
);

// ------------------------------------------------------- the four parts
//
// The markers this file uses for the four parts of a principle. `Rule` and `Why`
// both allow the "(ours)" suffix other principles use, so a later editor moving
// to that form does not turn this red for no reason.
const MARKERS = [
  { key: "rule", label: "the rule", pattern: /^\*\*Rule( \(ours\))?\./ },
  { key: "why", label: "why it exists, with our own evidence", pattern: /^\*\*Why \(ours\)\./ },
  { key: "livesIn", label: "the files that carry it", pattern: /^\*\*Lives in\*\*/ },
  { key: "source", label: "the outside sources", pattern: /^\*\*Source(s)?\./ },
];

/**
 * The block of the section that belongs to one marker: from its own line up to
 * the next line that starts any of the four markers, or the end of the section.
 * Returns null when the marker is not in the section at all.
 */
function block(marker) {
  const start = sectionLines.findIndex((line) => marker.pattern.test(line));
  if (start === -1) return null;
  const rest = sectionLines.slice(start + 1);
  const end = rest.findIndex((line) => MARKERS.some((other) => other.pattern.test(line)));
  return (end === -1 ? [sectionLines[start], ...rest] : [sectionLines[start], ...rest.slice(0, end)]).join("\n");
}

const blocks = {};
for (const marker of MARKERS) {
  const found = block(marker);
  blocks[marker.key] = found;
  // A bare marker with nothing after it would satisfy "the part is there" while
  // saying nothing, so the check has a floor. 60 characters is far below every
  // real block in this file today (the smallest, "Lives in", is over 300) and
  // far above an empty one.
  const body = found === null ? "" : flat(found).trim();
  check(
    `section 22 carries ${marker.label} (T-68 DoD item 2)`,
    found !== null && body.length >= 60,
    found === null
      ? `no line inside section 22 matches ${marker.pattern} — this is the missing part`
      : `the block is only ${body.length} character(s) long: ${JSON.stringify(body.slice(0, 80))}`,
  );
}

// The "(ours)" in the marker is this file's way of saying the evidence is our
// own, and the check makes that concrete: the block has to point at a record in
// this repository. Judged by folder shape, not by a full path, so renaming a
// record does not turn this red (`docs/qa/gaps.md` item 26, second note).
check(
  "the \"why\" part cites this repository's own record(s) (T-68 DoD item 2)",
  blocks.why !== null && /docs\/decisions\/(adr|crd)\//.test(blocks.why),
  blocks.why === null
    ? "there is no \"Why (ours)\" block to read"
    : "the \"Why (ours)\" block names no docs/decisions/adr/ or docs/decisions/crd/ record",
);

const links = blocks.source === null ? [] : (blocks.source.match(/https?:\/\//g) ?? []);
check(
  "the \"source\" part really holds outside links (T-68 DoD item 2)",
  links.length >= 1,
  `${links.length} http(s) link(s) in the source block — the count of 10 is case-02's job, but zero means this is not a sources part`,
);

// ------------------------------------------- lives in: step 2 of roles/pm.md
//
// T-68 DoD item 3: the pointer has to reach step 2, not the whole file.
const livesIn = blocks.livesIn === null ? "" : flat(blocks.livesIn);

check(
  "the \"lives in\" part names `roles/pm.md` (T-68 DoD item 3)",
  livesIn.includes("roles/pm.md"),
  blocks.livesIn === null ? "there is no \"Lives in\" block to read" : `block reads: ${JSON.stringify(livesIn.slice(0, 120))}`,
);

// `\b2\b` and not `2`, so "step 22" or "step 2000" cannot pass for step 2.
const STEP_2 = /\bstep 2\b/i;
check(
  "the \"lives in\" part writes \"step 2\", not just the file (T-68 DoD item 3)",
  STEP_2.test(livesIn),
  blocks.livesIn === null
    ? "there is no \"Lives in\" block to read"
    : `no /\\bstep 2\\b/i in the block, so it points at the whole file: ${JSON.stringify(livesIn.slice(0, 160))}`,
);

// Both in the block is not enough: "lives in roles/pm.md" in one sentence and
// "step 2 was renamed" three sentences later would pass that. They have to be
// the same statement.
const sentences = livesIn.split(/(?<=[.!?])\s+/);
const together = sentences.filter((one) => one.includes("roles/pm.md") && STEP_2.test(one));
check(
  "one sentence of the \"lives in\" part names `roles/pm.md` AND step 2 (T-68 DoD item 3)",
  together.length >= 1,
  `${sentences.length} sentence(s) in the block, ${together.length} naming both`,
);

done();
