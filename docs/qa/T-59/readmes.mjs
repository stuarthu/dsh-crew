// Shared helpers for the T-59 cases. This file is NOT a case: the runners only
// execute files named `case-*.mjs`.
//
// Everything here is read-only against the repository.
//
// WHY THIS FOLDER MATTERS MOST. `principles.md` 21 says the table telling the
// three roles apart "also has to stand in both READMEs". That sentence was a
// REQUIREMENT when T-52 wrote it, not a description — and `docs/qa/T-52/case-13`
// says so in its own header and deliberately scans `principles.md` only. T-59 is
// what made the sentence true. Nothing guards it against going false again:
// delete the table from either README and every check in `npm test` stays green.
// That is what these cases are for.
//
// BOTH FILES, ALWAYS. `CLAUDE.md` requires the two READMEs to be updated together
// in the same commit, English first. So every check here that is about content
// runs against BOTH files, and a case fails when either one has drifted. Checking
// only `README.md` would let the Chinese reader's page rot quietly, which is
// exactly the failure the rule exists to stop.
//
// WRAPPING. Both files are wrapped prose. Sentences are checked FLATTENED; only
// table rows and headings, which cannot wrap, are checked LINE-BASED.

import { flat, repoFile } from "../lib/qa.mjs";

export { check, done, flat } from "../lib/qa.mjs";

/** The two READMEs, as `{ path, text, flat }`, English first — the order the rule requires. */
export function readmes() {
  return ["README.md", "README-zh.md"].map((path) => {
    const text = repoFile(path);
    return { path, text, flat: flat(text) };
  });
}

/** Every `##`/`###` heading line of a file, in order. */
export const headings = (text) =>
  text.split("\n").filter((line) => /^#{2,3} /.test(line));

/**
 * The markdown table that contains `needle`, as its `| … |` rows with the header
 * and the `| --- |` separator removed.
 *
 * @throws when no table in the text holds the needle — a case must die loudly
 * rather than pass on an empty table.
 */
export function tableWith(text, needle) {
  const lines = text.split("\n");
  const blocks = [];
  let current = null;
  for (const line of lines) {
    if (line.trimStart().startsWith("|")) {
      current ??= [];
      current.push(line);
    } else if (current) {
      blocks.push(current);
      current = null;
    }
  }
  if (current) blocks.push(current);
  const block = blocks.find((rows) => rows.some((row) => row.includes(needle)));
  if (!block) throw new Error(`no markdown table containing ${JSON.stringify(needle)}`);
  return block.filter((row) => !/^\s*\|[\s|:-]+\|\s*$/.test(row)).slice(1);
}
