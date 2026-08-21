// T-68 DoD items 4, 5 and 6 — and the PRD's M1 DoD item 4, which is the upstream
// of all three: the body of `## 22.` in `principles.md` must really carry the
// method, not just a heading that promises one.
//
// What it proves, in one line: inside the principle 22 section and nowhere else,
// the six kinds of question are all there and there are EXACTLY six of them, the
// funnel, both failure modes and the stop rule are each present, and the source
// list holds at least ten external links.
//
// WHY "INSIDE THE SECTION" IS HALF THE POINT.
// Every assertion below runs against a slice of the file, from `^## 22.` to the
// next `^## `. A whole-file search would pass on text that lives in principle 21,
// in the glossary, or in the rejected-ideas table — and this repository has
// already shipped one pin that searched too wide and reported a pass for a rule
// written somewhere else (`docs/qa/gaps.md` item 26). So the slice is built
// twice, by two independent methods, and the case dies if the two disagree.
//
// WHY THE SIX KINDS ARE COUNTED BOTH WAYS.
// DoD item 4 says "exactly 6". A check that only counted them would stay green
// when a kind was swapped for something else, and a check that only looked each
// name up would stay green when a seventh was bolted on. That "counted a number
// and read nothing" shape is the exact family of dead check this whole job was
// spent finding (`docs/qa/gaps.md` items 16, 28). So both directions are pinned:
// each of the six by name, AND the set of kinds the section actually claims. Swap
// one kind and two assertions go red, not one.
//
// PINNING STYLE: FLATTENED for every prose anchor, LINE-BASED only for the
// section boundaries. `principles.md` is prose wrapped at 80 columns, so a
// sentence normally spans two or three lines and a line-based pin on one reports
// "not there" for a sentence that is there (`docs/qa/gaps.md` item 21, which
// counts eight bites of that trap in this job alone). Headings cannot wrap, so
// the boundaries are safe line-based.
//
// EVERY ANCHOR BELOW WAS CHECKED AGAINST THE SOURCE FILE FIRST, never copied
// from the DoD cell as rendered. `docs/qa/gaps.md` items 27 and 31 are the two
// reasons: an anchor can be the rendered form rather than the source form (which
// makes a pin that can never fire), and an anchor can be a paraphrase that was
// written as if it were a quotation (which makes a pin that can never pass). The
// six names in EXPECTED_KINDS are the strings `principles.md` really uses.
//
// WHICH FILE THIS CASE JUDGES IS NOT AN INPUT, AND THAT IS DELIBERATE.
// The file is read through `repoFile()`, whose root is `docs/qa/lib/qa.mjs` up
// three levels. Nothing outside the process can move that. An earlier version of
// this case took the path from the environment instead, and that was a hole
// rather than a convenience: anything exported in a shell or in CI moved the
// judgement onto another file — anywhere on disk, inside this repository or not —
// and the run stayed green, because the path it had switched to was only printed
// and never asserted. It was the one case of the whole suite that let an outsider
// choose the file under test.
//
// TO BREAK IT ON PURPOSE, THEN, THE TREE IS COPIED AND NOT THE PATH REDIRECTED.
// `tempRepo()` in `docs/qa/lib/qa.mjs` copies neither `principles.md` nor
// `docs/qa/lib/`, so the shared mutation helpers cannot reach this file. The
// mutation is done by hand instead, KEEPING THE DIRECTORY LAYOUT, so that
// `repoFile()` resolves inside the copy:
//
//   <throwaway>/principles.md
//   <throwaway>/docs/qa/lib/qa.mjs
//   <throwaway>/docs/qa/T-68/case-02-principle-22-content.mjs
//
// Edit the copy's `principles.md`, run the copy's case file, and the root it read
// is on the first `note` line of the output — so which tree was judged is never a
// guess. The repository itself is untouched: this case only ever reads.

import { join } from "node:path";
import { check, done, flat, repoFile, REPO } from "../lib/qa.mjs";

// ------------------------------------------------------------------ the file

const text = repoFile("principles.md");
console.log(`note  reading ${join(REPO, "principles.md")}`);

// ------------------------------------------------------- slicing the section
//
// Method A: regex anchored at the start of a line. `indexOf("## 22.")` would be
// wrong here — it also matches inside `### 22.`, because that string contains
// `## 22.` starting at its second character.
function sliceByRegex(whole) {
  const start = /^## 22\./m.exec(whole);
  if (!start) return null;
  const rest = whole.slice(start.index + 3);
  const end = rest.search(/\n## /);
  return end === -1 ? whole.slice(start.index) : whole.slice(start.index, start.index + 3 + end);
}

// Method B: walk the lines. Deliberately a different implementation, so a bug in
// one does not quietly become the definition of "the section".
function sliceByLines(whole) {
  const lines = whole.split("\n");
  const start = lines.findIndex((line) => /^## 22\./.test(line));
  if (start === -1) return null;
  const after = lines.slice(start + 1).findIndex((line) => line.startsWith("## "));
  return (after === -1 ? lines.slice(start) : lines.slice(start, start + 1 + after)).join("\n");
}

const byRegex = sliceByRegex(text);
const byLines = sliceByLines(text);

check(
  "principles.md has a `## 22.` section to read",
  byRegex !== null && byLines !== null,
  "no line starts with `## 22.` — either principle 22 is missing (T-68 not done) or the heading shape moved",
);
if (byRegex === null || byLines === null) done();

check(
  "the two slicers agree on where principle 22 ends",
  byRegex === byLines,
  `regex slice ${byRegex.length} chars, line slice ${byLines.length} chars — one of the two is wrong, so no assertion below can be trusted`,
);

const section = byLines;
const flatSection = flat(section);
console.log(`principle 22 section: ${section.length} chars, ${section.split("\n").length} lines`);

// The floor below is not styling. A slice that came back tiny means the next
// heading is immediately underneath, and every "is this string present" check
// would then be reporting on an empty section. A slice that came back as the
// whole file means the boundary search failed, and every check would be a
// whole-file search wearing a section's name. Both are caught here.
check(
  "the section is a real section, not an empty one and not the whole file",
  section.length > 2000 && section.length < text.length * 0.5,
  `section is ${section.length} chars of a ${text.length} char file`,
);

// ------------------------------------------------- DoD item 4: the six kinds
//
// The names as `principles.md` writes them. Read out of the file, not out of
// memory, and not out of the DoD cell.
const EXPECTED_KINDS = [
  "clarify",
  "probe the assumptions",
  "reasons and evidence",
  "other viewpoints",
  "implications",
  "question the question itself",
];

// Direction one: each kind is there, by name. Six separate assertions, so a
// swapped kind names itself in the failure output instead of hiding in a total.
for (const kind of EXPECTED_KINDS) {
  const copies = flatSection.split(`**${kind}**`).length - 1;
  check(
    `kind of question present, in bold: "${kind}"`,
    copies >= 1,
    `\`**${kind}**\` appears ${copies} time(s) inside principle 22`,
  );
}

// Direction two: what does the section CLAIM its kinds are? The shape this
// section uses for a kind is a bold name followed by a parenthesis holding
// example questions — `**clarify** ("what do you mean by X?", …)`. Reading the
// claim off that shape, rather than trusting a count, is what makes a swap go red
// twice and an addition go red at all.
const KIND_SHAPE = /\*\*([^*]+)\*\* ?\(/g;

const paragraphs = section.split(/\n\s*\n/);
const paragraphsWithKinds = paragraphs
  .map((paragraph) => [...flat(paragraph).matchAll(KIND_SHAPE)].map((match) => match[1]))
  .filter((claimed) => claimed.length > 0);

check(
  "the kinds are one list in one paragraph, not scattered",
  paragraphsWithKinds.length === 1,
  `${paragraphsWithKinds.length} paragraph(s) of principle 22 hold a bolded-name-plus-examples item: ${JSON.stringify(paragraphsWithKinds)}`,
);

const claimedInList = paragraphsWithKinds[0] ?? [];
check(
  "that list claims exactly 6 kinds of question",
  claimedInList.length === 6,
  `it claims ${claimedInList.length}: ${JSON.stringify(claimedInList)}`,
);

// The whole-section count too, so a seventh kind written into a paragraph of its
// own is caught even though it would leave the list above at six.
const claimedInSection = [...flatSection.matchAll(KIND_SHAPE)].map((match) => match[1]);
check(
  "the whole section claims exactly 6 kinds of question, no seventh anywhere",
  claimedInSection.length === 6,
  `${claimedInSection.length} found: ${JSON.stringify(claimedInSection)}`,
);

// And the set equality: same six names, no substitution. This is the assertion a
// pure count cannot make.
const sorted = (list) => [...list].sort().join(" | ");
check(
  "the 6 kinds claimed are the 6 the method is made of, none swapped",
  sorted(claimedInSection) === sorted(EXPECTED_KINDS),
  `claimed: ${sorted(claimedInSection)}\n      expected: ${sorted(EXPECTED_KINDS)}`,
);

// The sixth kind is singled out on purpose: `CRD 0019` and this principle both
// say it is the one most often skipped and the one that saves the most work. A
// list of six where the sixth is just another bullet has lost that.
check(
  "the sixth kind is called out as the one most often skipped",
  flatSection.includes("The sixth kind") && flatSection.includes("most often skipped"),
  "principle 22 lists six kinds but no longer says which one gets skipped",
);

// -------------------------------- DoD item 5: funnel, failure modes, stop rule

check(
  "the funnel is there: wide first, then narrow",
  flatSection.includes("Wide first, then narrow"),
  "no `Wide first, then narrow` inside principle 22",
);

// The funnel needs its direction spelled out, or the heading is a label with
// nothing under it. Both halves of the order are pinned.
check(
  "the funnel says which end is which, not only that there is one",
  flatSection.includes("Open questions at the start") && flatSection.includes("starting narrow"),
  "the funnel heading is there but the wide end and the narrow end are no longer named",
);

check(
  "the two failure modes are announced as two",
  flatSection.includes("Two failure modes"),
  "no `Two failure modes` inside principle 22",
);

check(
  "failure mode one is there: the leading question",
  flatSection.includes("leading question"),
  "no `leading question` inside principle 22",
);

check(
  "failure mode two is there: making someone feel examined",
  flatSection.includes("making someone feel examined"),
  "no `making someone feel examined` inside principle 22",
);

check(
  "the stop rule is there, and named as the load-bearing part",
  flatSection.includes("The stop rule") && flatSection.includes("load-bearing"),
  "no `The stop rule` inside principle 22",
);

// The stop rule's whole value is that it names a condition somebody can check.
// The wording it replaced — "Stop when the answers are settled" — named none, and
// the PRD's M1 DoD item 3 is the box for its removal. Here the positive half is
// pinned: the condition, and the refusal to give a number of questions.
check(
  "the stop rule names a condition, not a feeling",
  flatSection.includes("no guess left") && flatSection.includes("There is no correct number of questions"),
  "the stop rule is present but no longer says when to stop in checkable words",
);

// ---------------------------------- DoD item 6: ten external links, in Source

check(
  "principle 22 has a `Source.` part to hold the links",
  flatSection.includes("**Source.**"),
  "no `**Source.**` inside principle 22, so there is no source list to count",
);

const urls = [...section.matchAll(/https?:\/\/[^\s)]+/g)].map((match) => match[0]);
const unique = new Set(urls);

// A floor, never an equality. Principle 22 may gain an eleventh source, and a
// case that demanded exactly ten would go red on an improvement — the mistake
// `docs/qa/gaps.md` items 13 and 16 are both about.
check(
  "the source list holds at least 10 external links",
  urls.length >= 10,
  `${urls.length} link(s) found inside principle 22`,
);

// Ten copies of one link are not ten sources.
check(
  "at least 10 of those links are different from each other",
  unique.size >= 10,
  `${urls.length} link(s), ${unique.size} distinct`,
);

// They must be sources, which means they sit under `Source.` — not citations
// sprinkled through the evidence prose and counted as if they were a list.
const sourcePart = section.slice(section.indexOf("**Source.**"));
const sourceUrls = [...sourcePart.matchAll(/https?:\/\/[^\s)]+/g)].map((match) => match[0]);
check(
  "at least 10 links are in the source part, not scattered as citations",
  sourceUrls.length >= 10,
  `${sourceUrls.length} of the ${urls.length} link(s) come after \`**Source.**\``,
);

// A bare URL tells the reader nothing about what they are opening, and the ten
// this principle was distilled from are all titled. Pinned as a floor for the
// same reason as the count.
const titled = [...sourcePart.matchAll(/\[[^\]]+\]\(https?:\/\/[^)]+\)/g)];
check(
  "at least 10 of the source links carry a title, not a bare URL",
  titled.length >= 10,
  `${titled.length} titled link(s) of ${sourceUrls.length} in the source part`,
);

done();
