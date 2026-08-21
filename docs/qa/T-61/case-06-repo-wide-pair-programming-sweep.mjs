// T-61, DoD item 8: the WHOLE-REPOSITORY final sweep. No document in this
// repository may call this shape "pair programming".
//
// WHY THIS ONE CASE SCANS EVERYTHING. Every other case in this folder, and in the
// nine folders beside it, is scoped to one file. This one is deliberately not: the
// requirement it closes was raised at M2 and could not be verified then, because the
// files able to break it — the two READMEs, `CLAUDE.md`, `CHANGELOG.md` — were not
// written until M4 and M5. T-61 is the last task of the job, so this is where it
// closes. Making it permanent means the ban holds for every file added later, not
// just for the ones this job happened to touch.
//
// WHAT THE RULE ACTUALLY IS, and why this case classifies instead of banning.
// `CRD 0012` forbids CALLING this shape pair programming. It does not forbid the
// words: the repository has to discuss the analogy in order to reject it, and it has
// to cite the literature the cost figures come from. So a hit is legitimate in
// exactly two ways, and this case requires every hit to be one of them:
//
//   1. CONTRAST — the sentence, or the sentence it wraps into, says this shape is
//      NOT that one, or forbids the name.
//   2. CITATION — the hit is a work's title in a source list: an italicised title,
//      a URL, or a dated bibliography entry. `principles.md`'s `**Source.**` list
//      holds four of these, and the XP entry there says in its own words that it is
//      "cited for the contrast above, not as the origin of this shape".
//
// A hit that is neither is a document calling this shape pair programming, which is
// the thing the ban is about. That is the only way this case goes red — and it is a
// real way: a new paragraph explaining the shape "like pair programming, but…"
// matches no contrast marker and is no citation.
//
// BOTH FORMS ARE CHECKED, because this repository's documents are in two languages:
// `结对编程` cannot be found in an English file and `pair programming` may be absent
// from a Chinese one, so pinning either alone would leave half the repository
// unguarded.
//
// PINNING STYLE: LINE-BASED with a window of two lines either side, because a
// sentence wraps and its contrast may sit in the remainder. A flattened whole-file
// search could not tell which hit a contrast belonged to.
//
// One-way: an unclassifiable hit is never allowed, anywhere, ever.

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, done } from "../lib/qa.mjs";

// The tracked markdown files, from git itself, so a file added later is swept too
// and a stray copy in a temporary folder is not.
const files = execFileSync("git", ["-C", REPO, "ls-files", "*.md"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

check(
  "there are tracked markdown files to sweep",
  files.length > 10,
  `found only ${files.length} — the sweep would prove nothing`,
);

// A sentence that rejects the analogy, or forbids the name, in either language.
const CONTRAST = [
  "is not pair programming", "not pair programming", "never pair programming",
  "opposite", "different thing", "unlike", "chat switched off",
  "converg", "may not", "forbid", "banned", "the contrast", "for the contrast",
  "不是结对编程", "不是", "不许", "没有一处", "没有任何", "禁", "收敛", "对比", "别叫", "一律叫",
];

// A bibliography entry: an italicised work title, a link, or a dated source line.
const isCitation = (line) =>
  /\*[^*]*[Pp]air [Pp]rogramming[^*]*\*/.test(line)          // *The Costs and Benefits of Pair Programming*
  || /\[[^\]]*[Pp]air [Pp]rogramming[^\]]*\]\(/.test(line)   // a markdown link whose text is the title
  || /https?:\/\//.test(line)                                // a bare URL on the line
  || /\*\*\d{4}(-\d{2})?\*\*|（\d{4}[^）]*）|\(\d{4}\b/.test(line); // a dated bibliography entry

let total = 0;
let contrast = 0;
let citation = 0;
const unclassified = [];

for (const path of files) {
  // QA's own cases talk about the banned name constantly — that is their subject —
  // so they are excluded, exactly as `docs/qa/T-52/case-17` had to exclude itself.
  // Sweeping them would make every case that guards the ban a violation of it.
  if (path.startsWith("docs/qa/")) continue;
  const lines = readFileSync(join(REPO, path), "utf8").split("\n");
  lines.forEach((line, index) => {
    if (!/pair programming|结对编程/i.test(line)) return;
    total += 1;
    const window = lines.slice(Math.max(0, index - 2), index + 3).join(" ");
    if (CONTRAST.some((marker) => window.includes(marker))) contrast += 1;
    else if (isCitation(line)) citation += 1;
    else unclassified.push(`${path}:${index + 1}  ${line.trim()}`);
  });
}

check(
  "every hit of the banned name is either a contrast or a citation",
  unclassified.length === 0,
  `${unclassified.length} hit(s) that neither reject the analogy nor cite a work:\n      ${unclassified.join("\n      ")}`,
);

check(
  "the repository really does reject the analogy somewhere",
  contrast > 0,
  "not one contrast sentence found — the ban would then rest on silence",
);

check(
  "the sweep found the hits it is supposed to classify",
  total > 0,
  "no hit at all: either the sweep is broken or the discussion of the analogy is gone",
);

console.log(
  `note  swept ${files.length} tracked markdown file(s) outside docs/qa/: ${total} hit(s)`
  + ` — ${contrast} contrast, ${citation} citation, ${unclassified.length} unclassified`,
);

done();
