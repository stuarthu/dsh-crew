// T-63, DoD items 9 and 10 (PRD M1 DoD item 13): `principles.md` really carries the
// eight kinds of document, one subsection each — and it is the EIGHT NAMED KINDS,
// not merely eight of something.
//
// WHY THE SECTION IS SLICED OUT FIRST, AND NEVER COUNTED IN THE WHOLE FILE.
// `principles.md` is 1929 lines and holds 11 `### ` headings today. Three of them
// belong to `## Wording every role prompt copies word for word` (Rule A, Rule B,
// the shape of a role's write set) and have nothing to do with document kinds. So
// `grep -c '^### ' principles.md` is 11, not 8, and any count taken over the whole
// file is measuring a different thing than the DoD item asks about. Every read
// below happens inside the slice returned by `section()`, and the slice itself is
// a check: `section()` throws when the `## What each kind of document holds`
// heading is gone, so a renamed or deleted section dies loudly instead of quietly
// counting zero.
//
// COUNTING IS NOT ENOUGH, AND THAT IS THIS CASE'S REAL SUBJECT.
// "Exactly 8 subsections" and "the eight named kinds each have one" are two
// different questions. A later edit that drops the CRD entry and adds a "runbook"
// entry keeps the count at 8 and passes a counter. That is the same hole
// `docs/qa/T-60/case-09-prd-and-hld-exist-now.mjs` closes in its own header
// comment, hole 3: one class's description answering for another's. It is closed
// here the same way — by a ROLL CALL. Each of the eight kinds is looked up by name,
// and then the check runs in the other direction too: every heading in the section
// must be claimed by exactly one kind. So a swap goes red twice (the missing kind,
// and the unclaimed heading), a merged heading covering two slots with one
// subsection goes red as ambiguous, and a ninth kind added on top goes red on the
// count.
//
// THE WRAPPING TRAP, LIVE IN THIS VERY SECTION. `docs/qa/gaps.md` item 21 and
// T-60's case-09 carry the method; this section is one of the places it bites.
// The interface-contract entry cites `IEEE Std 1016-2009` with the line break
// falling between `Std` and `1016-2009`, so the phrase appears twice in the
// flattened section and only once on a single line. A line-based hunt for the
// citation would therefore MISS the interface-contract entry and report it as
// having no source at all — a false red, which is as bad as a false green. Every
// prose read below is done on the FLATTENED text, and the count-it-twice guard at
// the end proves the difference is real rather than assuming it.
//
// WHAT THIS CASE DELIBERATELY DOES NOT ASSERT.
//   * It does not assert the section is NUMBERED. It is unnumbered on purpose
//     (`ADR 0021`, and the section says so itself), and the numbered set 1-22 is
//     pinned by `docs/qa/T-52/case-01` and `case-02`. A pin demanding a number
//     here would contradict the decision.
//   * It does not assert WHERE the section sits (after `## Words we use`, before
//     `## What we looked at and did not take`). That is DoD item 10, and
//     `docs/qa/T-52/case-09-glossary-placement.mjs` already pins the ordering.
//     Two cases pinning one ordering means two files to edit for one legitimate
//     move, and the second adds nothing.
//   * It does not judge whether a cited source really SAYS what the entry claims.
//     No script can. Tracing the citations back to
//     `docs/research/document-types.md` is C-10's job; reading the sources
//     themselves is nobody's, and `docs/qa/gaps.md` is where that stays written.
//
// HOW THE "EVERY ENTRY CARRIES A SOURCE" HALF IS READ, SAID OUT LOUD BECAUSE THE
// READING MATTERS. DoD item 9 asks that each entry carry a source: "a standard
// number or a URL plus a reading date". Taken word for word — a reading date
// inside every subsection — the PRD entry and the DoD entry would both go red for
// a formatting reason: the section states the reading date ONCE, in its preamble
// ("Every source was read on 2026-08-21"), which covers all of them. Pinning the
// date per subsection would be pinning a layout choice, not the substance, and it
// would make a correct section red. So the two halves are asked separately and at
// the level each one really lives at: every subsection must carry a citable source
// (a standard designation or an `http` URL), and the section must state a reading
// date in `20\d\d-\d\d-\d\d` shape. Both halves fail loudly and name what is
// missing.
//
// A source is a STANDARD DESIGNATION or a URL, and nothing looser. "Across
// project-management practice" names no source anybody can go and read, which is
// exactly the state this check exists to catch — an entry whose authority cannot
// be followed up. The two shapes are deliberately generous about the words
// between the body and the number (`IEEE Std 1016-2009`, `ISO/IEC/IEEE 29119`,
// `IEEE 829` all match) so that only a genuine absence goes red.
//
// PINNING STYLE: sliced section for every read; heading lines read line by line
// (a markdown heading cannot wrap); FLATTENED text for every citation; a roll call
// by name in both directions instead of a count; and no assertion about the
// section's number or its position, both of which belong to other cases.

import { check, done, flat, repoFile, section } from "../lib/qa.mjs";

const HEADING = "What each kind of document holds";
const text = repoFile("principles.md");

// The section heading itself, read line by line: a heading never wraps, and this
// is the one place the shape of the heading is the subject. It must be an H2 and
// it must be unnumbered — `## 23. What each ...` would be the numbered set
// growing, which `ADR 0021` refused.
const headingLines = text.split("\n").filter((line) => /^#{1,6} /.test(line) && line.includes(HEADING));
check(
  `principles.md has exactly one heading naming "${HEADING}", as an unnumbered \`## \` heading`,
  headingLines.length === 1 && headingLines[0] === `## ${HEADING}`,
  `found ${headingLines.length}: ${JSON.stringify(headingLines)}.`
    + ` It must be \`## ${HEADING}\` — unnumbered, because the numbered principles 1-22 are a closed`
    + ` set (ADR 0021), and an H2, because that is what the slice below reads.`,
);

// Everything from here on is inside the slice. `section()` throws when the heading
// is gone, so this case can never quietly count zero subsections in a file that
// lost the section altogether.
const slice = section(text, HEADING);
const sliceLines = slice.split("\n");
console.log(`note  the "${HEADING}" section is ${slice.length} characters over ${sliceLines.length} lines`);

// The whole file's `### ` count, printed as evidence that slicing is not optional.
const allSubHeadings = text.split("\n").filter((line) => line.startsWith("### ")).length;

// Collect the section's own subsection headings, skipping fenced blocks so a code
// sample can never be counted as a document kind.
const headings = [];
let fenced = false;
for (const line of sliceLines) {
  if (line.startsWith("```")) { fenced = !fenced; continue; }
  if (!fenced && line.startsWith("### ")) headings.push(line.slice(4).trim());
}
console.log(`note  ${headings.length} subsection(s) in the section, ${allSubHeadings} \`### \` heading(s) in the whole file`);
console.log(`note  subsections: ${headings.map((h) => JSON.stringify(h)).join(", ")}`);

check(
  "the section holds exactly 8 subsections, one per kind of document",
  headings.length === 8,
  `it holds ${headings.length}: ${headings.map((h) => JSON.stringify(h)).join(", ")}.`
    + ` The whole file has ${allSubHeadings} \`### \` headings, which is why this is counted inside the slice only.`,
);

// The roll call. One matcher per kind, each specific enough that no two kinds can
// both claim the same heading today. A count alone would pass a section that
// dropped one kind and added another; this is what makes the swap red.
const KINDS = [
  ["PRD", /\bPRD\b/],
  ["HLD", /\bHLD\b/],
  ["ADR", /\bADR\b/],
  ["CRD", /\bCRD\b/],
  ["an interface contract", /interface contract/i],
  ["a test plan and a test case", /\btest (?:plan|case)s?\b/i],
  ["a release plan and an upgrade guide", /release plan|upgrade (?:guide|plan)/i],
  ["DoD", /\bDoD\b|definition of done/i],
];

const claimedBy = new Map(headings.map((heading) => [heading, []]));
for (const [kind, pattern] of KINDS) {
  const found = headings.filter((heading) => pattern.test(heading));
  for (const heading of found) claimedBy.get(heading).push(kind);
  check(
    `exactly one subsection is about ${kind}`,
    found.length === 1,
    found.length === 0
      ? `no subsection heading matches ${pattern}. The kind is missing — and note that the count above can`
        + ` still be 8 when one kind is swapped for another, which is why this roll call exists.`
        + ` Headings present: ${headings.map((h) => JSON.stringify(h)).join(", ")}`
      : `${found.length} subsections match ${pattern}: ${found.map((h) => JSON.stringify(h)).join(", ")}.`
        + ` One kind, one subsection — two entries for one kind means another kind has lost its own.`,
  );
}

// The other direction: nothing in the section may be a kind this list does not
// know, and no single heading may answer for two kinds.
const unclaimed = headings.filter((heading) => claimedBy.get(heading).length === 0);
check(
  "every subsection in the section is one of the eight kinds, and nothing else",
  unclaimed.length === 0,
  `${unclaimed.length} subsection(s) are about none of the eight kinds: ${unclaimed.map((h) => JSON.stringify(h)).join(", ")}.`
    + ` A ninth kind added, or one of the eight replaced by something else, lands here.`,
);

const ambiguous = headings.filter((heading) => claimedBy.get(heading).length > 1);
check(
  "no single subsection is counted for two kinds at once",
  ambiguous.length === 0,
  `${ambiguous.map((h) => `${JSON.stringify(h)} claimed by ${claimedBy.get(h).join(" + ")}`).join("; ")}.`
    + ` Two kinds folded into one subsection is not "one subsection each", and it would let the roll call`
    + ` pass while a kind has no entry of its own.`,
);

// Split the slice into its preamble and one body per subsection, so a citation in
// the preamble — or in a neighbouring entry — cannot answer for an entry that has
// none of its own.
const bodies = slice.split(/\n(?=### )/);
const preamble = bodies.shift();

// The reading date: stated once for all the sources, in the preamble, which is why
// it is asked at section level and not per subsection.
const dateShape = /20\d\d-\d\d-\d\d/;
const preambleDate = dateShape.exec(flat(preamble));
check(
  "the section states when the sources were read, in a 20NN-NN-NN shape",
  preambleDate !== null,
  `no \`20\\d\\d-\\d\\d-\\d\\d\` date in the section's preamble. DoD item 9 asks for a reading date beside the`
    + ` sources; the section carries one date covering all of them, so losing it loses it for all eight entries.`,
);
if (preambleDate) console.log(`note  sources read on ${preambleDate[0]}`);

// A citable source: a standard designation, or an http(s) URL. Matched on the
// FLATTENED body — `IEEE Std 1016-2009` wraps in this very section.
const STANDARD = /\b(?:ISO|IEC|IEEE|ANSI)\b[^.;]{0,40}?\d{3,5}\b/;
const URL = /https?:\/\/[^\s)]+/;
const cite = (body) => STANDARD.exec(body) ?? URL.exec(body);

let flatBearers = 0;
let lineBearers = 0;
const onlyFlat = [];

for (const body of bodies) {
  const heading = body.split("\n")[0].slice(4).trim();
  const found = cite(flat(body));
  if (found) flatBearers += 1;
  // The same question asked line by line, only to prove the wrap is real. It is
  // never the assertion.
  const byLine = body.split("\n").some((line) => cite(line) !== null);
  if (byLine) lineBearers += 1;
  else if (found) onlyFlat.push(heading);

  check(
    `the "${heading}" entry cites a source anyone can go and read`,
    found !== null,
    `no standard designation and no http URL in that entry. Naming a practice or a field ("across`
      + ` project-management practice") is not a source: nobody can follow it up. DoD item 9 asks every one`
      + ` of the eight entries to carry one.`,
  );
  if (found) console.log(`note  ${heading} -> ${found[0].slice(0, 60)}`);
}

// count-it-twice, on the very reads above. A line-based count above the flattened
// one would mean the counter is broken; a flattened count that is HIGHER is the
// wrap, and it is the reason none of the assertions above are line-based.
check(
  "count-it-twice: the flattened citation count is never lower than the line-based one",
  flatBearers >= lineBearers,
  `flattened ${flatBearers} vs line-based ${lineBearers} — a line-based count above the flattened one means`
    + ` this case's own counter is wrong, not the file`,
);
console.log(
  `note  ${flatBearers} of ${bodies.length} entries cite a source when flattened, ${lineBearers} when read line by line`
  + `${onlyFlat.length ? ` — ${onlyFlat.map((h) => JSON.stringify(h)).join(", ")} would be MISSED by a line-based pin, because the citation wraps` : ""}`,
);

done();
