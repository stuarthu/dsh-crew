// T-52, DoD item 16: every occurrence of "pair programming" in `principles.md`
// is either a contrast ("it is NOT pair programming") or a citation of the pair
// programming literature. Nowhere does the file call this shape pair programming.
//
// What it proves: the name stayed off the shape. `CRD 0012` is blunt about it —
// "文档里不许把它叫结对编程。叫它双 engineer 形状" — because the analogy is wrong
// in a way that costs money: pair programming works by CONVERGING through constant
// talk, and this shape works by not converging and by not talking. A document that
// calls it pair programming invites the next reader to fix the "missing"
// communication channel, which is the one thing the design deliberately removed.
//
// THE TRAP THIS CASE IS WRITTEN AROUND: the naive pin — "the phrase may only
// appear in a negative sentence" — is wrong here. Of the eight occurrences, four
// are a paper title or a citation (Cockburn & Williams, *The Costs and Benefits of
// Pair Programming*; Kent Beck's twelve XP practices; the Wikipedia link), and a
// citation is not a negative sentence. A pin that demanded a negation would go red
// on the sources, and the honest way to make it green again would be to delete
// them. So each occurrence is classified: contrast, or citation.
//
// PINNING STYLE: FLATTENED, and per SENTENCE. The file wraps at 80 columns, so
// "It is not pair programming" and "pair programming works by converging" both
// straddle line breaks; and a window measured in characters would let a citation
// three lines away vouch for a sentence that claims the opposite. A sentence is
// the smallest unit that carries the claim.
//
// One-way: the ban never expires. If the shape were ever renamed, that is a CRD.

import { check, countFlat, done, flatten, principle, principles, sentencesWith } from "./principles.mjs";

const text = principles();
const hits = countFlat(text, "pair programming");
const sentences = sentencesWith(text, "pair programming");

const CONTRAST = /\bnot pair programming\b|not call it|instead of pair programming|independent verification|converg|different thing|the contrast/i;
const CITATION = /Cockburn|Williams|Kent Beck|Extreme Programming|arXiv|wikipedia|https?:\/\//i;

check("the phrase does occur (otherwise this case proves nothing)", hits > 0, "no occurrence at all");

check(
  "every sentence holding the phrase was found",
  sentences.length > 0 && sentences.length <= hits,
  `${hits} occurrence(s), ${sentences.length} sentence(s)`,
);

for (const sentence of sentences) {
  const contrast = CONTRAST.test(sentence);
  const citation = CITATION.test(sentence);
  check(
    `"${sentence.replace(/\s+/g, " ").slice(0, 64)}…" is a contrast or a citation`,
    contrast || citation,
    `neither: no contrast marker (${CONTRAST}) and no citation marker (${CITATION}) in:\n      ${sentence.slice(0, 300)}`,
  );
}

// The ban itself, and the name to use instead, both live in principle 21.
const twentyOne = flatten(principle(text, 21));

check(
  "principle 21 forbids the name outright",
  /Do not call it pair programming in any document here/.test(twentyOne),
  "the ban sentence is gone from principle 21",
);

check(
  "principle 21 gives the name to use instead",
  /Call it the paired shape/.test(twentyOne),
  "a ban with no replacement name leaves the next writer to invent one",
);

check(
  "principle 21 says what the shape is instead: independent verification",
  /independent\s*verification/i.test(twentyOne) && /safety-critical/i.test(twentyOne),
  "the family the shape really belongs to is not named",
);

done();
