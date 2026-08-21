// Shared helpers for the T-60 cases. This file is NOT a case: the runners only
// execute files named `case-*.mjs`.
//
// Everything here is read-only against the repository.
//
// WRAPPING — the reason this file exists at all. `CLAUDE.md` is prose wrapped at
// about 100 columns, and this job proved eight times over that a line-based grep
// on a wrapped sentence reports "not there" for a sentence that IS there. The
// seventh of those eight is in this very task's DoD: the verification cell reads
// `grep -n 'no \`prd.md\`' CLAUDE.md` must be empty, and it was empty from the
// moment it was written — the original sentence wrapped between `There is no` and
// `` `prd.md` ``, so that grep could never have found anything either way. A cell
// that cannot fail is not a check. So:
//
//   * FLATTENED (`flat`) for every sentence;
//   * LINE-BASED only for a `## ` heading, a `| … |` table row, a numbered
//     design-rule marker, one path.
//
// `case-09` of this folder carries the count-it-twice method that catches the
// trap, and `docs/qa/gaps.md` item 21 now writes that method down.

import { flat, repoFile, section } from "../lib/qa.mjs";

export { check, done, flat, section } from "../lib/qa.mjs";

/** `CLAUDE.md`, the repository's own instructions file. */
export const claude = () => repoFile("CLAUDE.md");

/** `CLAUDE.md`, flattened — the only safe way to pin one of its sentences. */
export const flatClaude = () => flat(claude());

/** One `## heading` section of CLAUDE.md. */
export const claudeSection = (heading) => section(claude(), heading);

/**
 * One numbered design rule of the "Design rules a change must not break"
 * section, from `N. **` at the start of a line to the next such marker.
 *
 * Sliced rather than searched, so a check about rule 4 cannot pass on text that
 * only appears in rule 2.
 *
 * @throws when the rule is not there
 */
export function designRule(number) {
  const text = claudeSection("Design rules a change must not break");
  const start = text.search(new RegExp(`^${number}\\. \\*\\*`, "m"));
  if (start === -1) throw new Error(`CLAUDE.md has no design rule ${number}`);
  const rest = text.slice(start + 1);
  const end = rest.search(/\n\d+\. \*\*/);
  return end === -1 ? text.slice(start) : text.slice(start, start + 1 + end);
}

/** Every design rule number, in the order they appear. */
export function designRuleNumbers() {
  const text = claudeSection("Design rules a change must not break");
  return [...text.matchAll(/^(\d+)\. \*\*/gm)].map((hit) => Number(hit[1]));
}

/** The `| … |` rows of the first markdown table inside a slice of text. */
export function tableRows(text) {
  const rows = text.split("\n").filter((line) => line.trimStart().startsWith("|"));
  // Drop the header and the `| --- |` separator.
  return rows.filter((row) => !/^\s*\|[\s|:-]+\|\s*$/.test(row)).slice(1);
}
