// T-63 DoD item 4 and item 8; T-70–T-78 common DoD item 1; PRD M1 DoD item 7.
//
// What it proves: all TEN role prompts really grew the write-set section —
// `roles/` holds exactly ten `.md` files, and every one of them carries, exactly
// once, the H2 heading that `principles.md` names as the authoritative shape,
// with a real section body under it.
//
// Why this case exists at all. Nine of those ten files were written by nine
// engineers that could not see each other, and no unit test reads them: the only
// file in this project that could hold such a pin is `tools/verify-mount.mjs`,
// and T-70–T-78's common note says why it was not used ("nine parallel tasks
// traded for one pin — not worth it"). `docs/qa/T-56/case-07-no-new-h2.mjs`
// counts H2 headings in `roles/pm.md` only, and only counts them. So "all ten
// have the section" is guarded by nothing else. One file missing it must go red.
//
// Three ways this case is deliberately NOT a proxy check:
//
//  1. The heading string is not typed in here. It is cut out of the authoritative
//     sentence in `principles.md` ("Every role prompt carries a section headed
//     `…`"), so the case tests the ten prompts against the source they were
//     copied from, not against a string a QA agent guessed. Reword the heading in
//     `principles.md` alone and the ten files go red — which is the deliberately
//     brittle trade T-63 DoD item 1 asks for.
//  2. That sentence is matched AFTER `flat()`. `principles.md` wraps at 80
//     columns, so a line-by-line grep for a sentence can miss one that is really
//     there. This repository has gone red seven times on exactly that.
//  3. A heading with nothing under it would satisfy a heading count and still not
//     be a write set, so each section's body is measured too. The floor is far
//     below every real body (2.6k–6.0k characters today), so it fails only on an
//     empty or near-empty section, never on a short one that is honest.
//
// Heading lines are the one thing this project reads line by line: a markdown
// heading cannot wrap, and `roles/engineer.md` and `roles/pm.md` both mention
// **What you may write** in running prose. A flattened count of the string would
// therefore be 2 in those two files and 1 in the rest — which is why the count
// here is over heading LINES, and why a flat count is not used for it.

import { readdirSync } from "node:fs";
import { join } from "node:path";

import { REPO, repoFile, flat, check, done } from "../lib/qa.mjs";

const ROLES_DIR = "roles";
const EXPECTED_FILES = 10;
/** Far under the smallest real body (2689 characters today): this is an empty-section guard. */
const MIN_BODY = 400;

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------------------------------------------------------------- the ten files

const files = readdirSync(join(REPO, ROLES_DIR), { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name)
  .sort();

check(
  `${ROLES_DIR}/ holds exactly ${EXPECTED_FILES} .md role prompts`,
  files.length === EXPECTED_FILES,
  `found ${files.length}: ${files.join(", ")}`,
);
check(
  `${ROLES_DIR}/pm.md is one of them`,
  files.includes("pm.md"),
  `found: ${files.join(", ")}`,
);

// -------------------------------------------- the heading, from principles.md

const AUTHORITY = "principles.md";
const named = /Every role prompt carries a section headed `([^`]+)`/.exec(flat(repoFile(AUTHORITY)));

check(
  `${AUTHORITY} names the write-set section heading word for word`,
  named !== null,
  `no sentence of the form "Every role prompt carries a section headed \`…\`" in ${AUTHORITY} — the authoritative wording moved, and every role prompt below is measured against it`,
);
if (named === null) done();

const heading = named[1];
check(
  `the heading ${AUTHORITY} names is an H2 heading`,
  /^## \S/.test(heading),
  `it names ${JSON.stringify(heading)}, which is not a "## " heading`,
);

// -------------------------------------------------- every prompt carries it

const headingLine = new RegExp(`^${escape(heading)}[ \\t]*$`, "gm");
const nextH2 = /\n## /;

for (const name of files) {
  const relative = `${ROLES_DIR}/${name}`;
  const text = repoFile(relative);
  const hits = [...text.matchAll(headingLine)];

  check(
    `${relative} carries exactly one "${heading}" heading line`,
    hits.length === 1,
    hits.length === 0
      ? `the section is missing from ${relative} — this is the red PRD M1 DoD item 7 asks for ("one file short and it goes red")`
      : `${hits.length} heading lines, at characters ${hits.map((hit) => hit.index).join(", ")}`,
  );

  // The body is cut from the matched heading line to the next H2, rather than
  // through `section()`: that helper locates its heading with `indexOf("## …")`,
  // which also matches inside a `### …` line of the same title, and here the
  // whole point is that the H2 is the one being measured.
  if (hits.length !== 1) continue;
  const after = text.slice(hits[0].index + heading.length);
  const end = after.search(nextH2);
  const body = (end === -1 ? after : after.slice(0, end)).trim();

  check(
    `${relative}'s write-set section has a body, not just a heading`,
    body.length >= MIN_BODY,
    `${body.length} characters between the heading and the next "## " heading, floor is ${MIN_BODY}: ${JSON.stringify(body.slice(0, 120))}`,
  );
}

done();
