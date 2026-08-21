// T-52, DoD item 4: principle 21's four outside sources are all there and every
// one of them carries a year.
//
// What it proves: this file's rule for a borrowed idea is "link the source"
// (`Keeping this file honest`), and a source without a date cannot be found again
// or aged. Three of these four are evidence for what the shape does NOT prove, so
// an undated one weakens the only part of principle 21 that argues against the
// shape.
//
// PINNING STYLE: LINE-BASED for the bullets (each source is one `- ` bullet, and
// a bullet starts at the start of a line), FLATTENED for the text of each bullet,
// because the bullet's prose wraps over three or four lines. The four are matched
// by author or title, never by their position in the list.
//
// One-way: a source that is in the file stays in the file; the file's own rule is
// that a rejected or replaced source is recorded, not deleted.

import { check, done, flatten, principle, principles } from "./principles.mjs";

const twentyOne = principle(principles(), 21);
const sourceBlock = twentyOne.slice(twentyOne.search(/^\*\*Source\.\*\*/m));

// Split the block into bullets: a bullet starts at a line beginning with "- ".
const bullets = sourceBlock
  .split(/\n(?=- )/)
  .slice(1)
  .map((bullet) => flatten(bullet));

check(
  "principle 21 lists four sources",
  bullets.length === 4,
  `found ${bullets.length} bullet(s): ${bullets.map((bullet) => bullet.slice(0, 50)).join(" | ")}`,
);

const wanted = [
  ["Cockburn & Williams (the Utah pairing experiment)", /Cockburn & Williams/],
  ["Knight & Leveson (multiversion programming)", /Knight & Leveson/],
  ["N-Version Programming with Coding Agents (arXiv)", /N-Version Programming with Coding Agents/],
  ["pair programming as an original XP practice", /Extreme Programming/],
];

for (const [name, pattern] of wanted) {
  const bullet = bullets.find((text) => pattern.test(text));
  check(`source present: ${name}`, bullet !== undefined, `no source bullet matches ${pattern}`);
  check(
    `source carries a year: ${name}`,
    bullet !== undefined && /\b(19|20)\d\d\b/.test(bullet),
    bullet === undefined ? "the source itself is missing" : `no four-digit year in: ${bullet.slice(0, 120)}`,
  );
}

check(
  "every source bullet carries a year, including any added later",
  bullets.every((bullet) => /\b(19|20)\d\d\b/.test(bullet)),
  `undated: ${bullets.filter((bullet) => !/\b(19|20)\d\d\b/.test(bullet)).map((bullet) => bullet.slice(0, 60)).join(" | ")}`,
);

// The arXiv paper is the one that carries the numbers principle 21 leans on for
// "a green merge is not evidence of a clear document". A year alone would let the
// month drop, and 2026-06 is how the PRD and the CRD both cite it.
check(
  "the arXiv source keeps its month (2026-06)",
  bullets.some((bullet) => bullet.includes("2026-06")),
  "the N-Version paper's date lost its month",
);

done();
