// T-52, DoD item 20 — the "where" half of it: the rule that a pointer names the
// thing it means, not its number, lives INSIDE principle 20, no new number was
// opened for it, and the file obeys its own new ban.
//
// What it proves: three separate things the DoD's own check column names.
//
//   1. `grep -nE '^## 22\.' principles.md` is empty, and the numbered headings
//      are still exactly 1 to 21. A number in this file is a promise of four
//      parts (rule, why, Lives in, outside sources) and this rule has no outside
//      source, so it had to land in an existing principle — the same reason
//      `ADR 0014` refused to number the glossary. It also matters for the reason
//      `ADR 0011` gives: other files address this one by number, and a new
//      heading in the wrong place makes every one of them wrong at once.
//   2. The rule is really in principle 20's section — not in some other
//      principle, and not only in the CRD it came from.
//   3. The literal fingerprint the DoD names: `not its number` or
//      `not a line number`.
//
// And the fourth check, which is the awkward one. These paragraphs had to WRITE
// the form they ban, twice, to say which pointers went wrong. That is the same
// shape as the glossary's banned phrase in case-12: a ban has to show what it
// bans. So this case does NOT assert "the form never appears" — that assertion
// would fail on the ban itself. It asserts the case-12 shape instead: every
// occurrence of a `.md` path plus a colon plus a line number sits inside
// principle 20 and inside a sentence that bans it or reports it as broken.
//
// PINNING STYLE: LINE-BASED for the headings (a `## ` heading cannot wrap),
// FLATTENED for everything else — every sentence here wraps at 80 columns.
//
// One-way: the ban can only get stronger. The file may grow a principle 22 one
// day for some other rule, and then check 1's "no 22" half is what changes, in
// the same commit as the document that allows it — but this rule may never move
// out of principle 20 into a number of its own without `ADR 0014`'s reasoning
// being overturned first.

import { check, countFlat, done, flatten, headings, principle, principles, sentencesWith } from "./principles.mjs";

const text = principles();
const twenty = principle(text, 20);
const flatTwenty = flatten(twenty);

// ---------------------------------------------------------------- 1. no new number

const numbered = headings(text).filter((heading) => heading.number !== null).map((heading) => heading.number);

check(
  "no `## 22.` heading — the rule did not open a number of its own",
  !numbered.includes(22),
  `numbered headings: ${numbered.join(", ")}`,
);

check(
  "the numbered headings are still exactly 1 to 21",
  numbered.length === 21 && numbered.every((number, index) => number === index + 1),
  `got ${numbered.length} heading(s): ${numbered.join(", ")}`,
);

// ---------------------------------------------------------------- 2. it lives in principle 20

const banSentences = sentencesWith(twenty, "line number").filter(
  (sentence) => /\bnever\b|\bnot\b|\bno\b/i.test(sentence),
);

check(
  "principle 20 carries the rule: a pointer does not point with a line number",
  banSentences.length >= 1,
  `principle 20 has ${sentencesWith(twenty, "line number").length} sentence(s) mentioning a line number, none of them a ban`,
);

check(
  "principle 20 says a pointer names the section heading, or quotes the sentence",
  /section heading/i.test(flatTwenty) && /quote/i.test(flatTwenty),
  "principle 20 bans the line number without saying what to write instead",
);

// The rule must not have landed somewhere else instead. Every ban sentence in the
// whole file has to be one of principle 20's own.
const banSentencesInFile = sentencesWith(text, "line number").filter(
  (sentence) => /\bnever\b|\bnot\b|\bno\b/i.test(sentence),
);

check(
  "every ban sentence in the file is one of principle 20's",
  banSentencesInFile.length === banSentences.length,
  `${banSentencesInFile.length} in the file, ${banSentences.length} in principle 20 — the rule is split across sections:\n      ${banSentencesInFile.map((sentence) => sentence.slice(0, 120)).join("\n      ")}`,
);

// ---------------------------------------------------------------- 3. the DoD's literal fingerprint

const fingerprints = countFlat(text, "not its number") + countFlat(text, "not a line number");

check(
  "the fingerprint the DoD greps for is there (`not its number` or `not a line number`)",
  fingerprints >= 1,
  "T-52's DoD item 20 checks this with `grep -c 'not its number\\|not a line number' principles.md` >= 1; the rule's meaning can be there while this exact wording is not, and that grep is what the task row promises",
);

// ---------------------------------------------------------------- 4. the ban may use the banned form; nothing else may

// A `.md` path, a colon, a line number — plus the short form that drops the path
// and keeps a backtick, colon and digits. Built as a pattern on purpose: the
// literal strings are not written out here, so a scan of this folder for
// line-number pointers does not trip over this case's own source.
const pointerForms = [/[A-Za-z0-9_/.-]+\.md:\d+/g, /`:\d+`/g];
const hits = pointerForms.flatMap((form) => flatten(text).match(form) ?? []);

check(
  "the ban shows the form it bans (otherwise it bans nothing readable)",
  hits.length >= 1,
  "principles.md never shows a file-and-line pointer, so the ban has no example",
);

const inTheBan = (hit) => {
  const sentences = sentencesWith(text, hit);
  return (
    sentences.length >= 1 &&
    sentences.every((sentence) => flatTwenty.includes(sentence.slice(0, 60))) &&
    sentences.every((sentence) => /never points|not any other file|became wrong|still allowed|rots/i.test(sentence))
  );
};

for (const hit of [...new Set(hits)]) {
  check(
    `the pointer form ${JSON.stringify(hit)} appears only where it is banned or reported broken`,
    inTheBan(hit),
    "this occurrence sits outside principle 20, or in a sentence that uses the form as a real pointer instead of banning it — which is the failure the rule exists to stop",
  );
}

done();
