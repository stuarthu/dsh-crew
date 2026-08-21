// T-63 DoD items 3 and 8, and the common item 3 of T-70 to T-78 (PRD M1 DoD
// item 7): rule B — a document that judges your work is not something you may
// edit — is written once in `principles.md` as the authoritative wording, and
// all ten role prompts carry that block WORD FOR WORD.
//
// The two meanings that must both live inside that one block, because rule B is
// useless with either half missing:
//   1. a briefing handing the role such a document does NOT make it editable;
//   2. the role has to say so in its report.
// A block that kept only the first half would leave a role quietly refusing an
// edit nobody ever hears about, and the PM would never learn its own briefing
// was wrong. That is the exact failure the rule was written from.
//
// How this case decides what "word for word" means:
//
// The expected text is CUT OUT OF `principles.md` at run time and is never typed
// into this file. `principles.md` holds the authoritative copy; the nine
// engineers who wrote the other nine prompts could not see each other, so any
// one of them mis-copying it has to go red. A hand-typed string would make this
// case an eleventh copy that drifts the same way — red against ten correct
// files, green against ten wrong ones.
//
// In `principles.md` the block is a markdown blockquote (every line starts with
// `> `); in a role prompt it is an ordinary paragraph. So the comparison strips
// the `> ` prefix and flattens whitespace on both sides: prose wraps at 80
// columns and the wrap points differ between files — `roles/test-engineer.md`
// wraps this block over seven lines where the other nine use six. A line-by-line
// or unflattened comparison would call nine of ten correct files wrong.
//
// The comparison is string EQUALITY on the whole block, not "the file contains
// an anchor". An anchor check passes on a paragraph that dropped a sentence,
// added one, or paraphrased everything around the anchor — which is the drift
// the "copy, do not paraphrase" rule exists to stop. The blockquote markers are
// part of that: a role prompt that pasted the block as a quote instead of a
// paragraph keeps its `>` characters after flattening and cannot compare equal.
//
// ONE THING THIS FILE DOES ON PURPOSE, so nobody "tidies" it back.
// The rule B anchor phrase is assembled from separate words at run time
// (see ANCHOR below) and the contiguous phrase appears nowhere in this file, not
// even in a comment or a failure message. Several pins — a DoD cell of this very
// task among them — count that phrase and require exactly ONE occurrence per
// file. Writing it out here would add a copy to the repository for any pin that
// widens its search, and this job already had one engineer trip over exactly
// that. Every message below therefore names it as "the rule B anchor phrase"
// rather than quoting it.
//
// PINNING STYLE: FLATTENED. Prose wraps; nothing here is read line by line
// except the heading and the blockquote markers, which cannot wrap.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO, repoFile, flat, check, done } from "../lib/qa.mjs";

const HEADING = "### Rule B, on the documents that judge your work";

// Built from parts on purpose — see the note above.
const ANCHOR = ["not", "yours", "to", "edit"].join(" ");

// ---------------------------------------------------------------- the source

const lines = repoFile("principles.md").split("\n");
const headings = lines.filter((line) => line.trim() === HEADING).length;
check(
  `principles.md has exactly one "${HEADING}" heading`,
  headings === 1,
  `found ${headings}`,
);
if (headings !== 1) done();

let index = lines.findIndex((line) => line.trim() === HEADING) + 1;
while (index < lines.length && !lines[index].startsWith(">")) {
  // A blank line may sit between the heading and the blockquote, nothing else.
  if (lines[index].trim() !== "") break;
  index += 1;
}
const first = index;
while (index < lines.length && lines[index].startsWith(">")) index += 1;
const quoted = lines.slice(first, index);

check(
  "the rule B heading is followed by a blockquote (the authoritative wording)",
  quoted.length > 0,
  `line ${first + 1} of principles.md is not a blockquote line: ${JSON.stringify(lines[first] ?? "")}`,
);
if (quoted.length === 0) done();

// Strip the `> ` prefix, then flatten. This is the expected text every role
// prompt must carry.
const ruleB = flat(quoted.map((line) => line.replace(/^>\s?/, "")).join("\n"));

// Guards on the cut itself. Without them a mis-cut — one stray `>` line, a
// blockquote that moved out from under the heading — would leave a short or
// wrong `ruleB`, and the ten comparisons below would all agree on the wrong
// text, or all fail for a reason that has nothing to do with the ten files.
const anchorsInCut = ruleB.split(ANCHOR).length - 1;
check(
  "the cut block carries the rule B anchor phrase exactly once",
  anchorsInCut === 1,
  `found ${anchorsInCut} in the ${ruleB.length}-character block cut from principles.md`,
);
check(
  "the cut block is a whole paragraph, not a single line",
  ruleB.length >= 300,
  `cut ${quoted.length} blockquote line(s), ${ruleB.length} characters after flattening: ${JSON.stringify(ruleB)}`,
);

// T-63 DoD item 3, first half of its check column: the phrase appears exactly
// once in the whole of `principles.md`, so there is one authoritative wording
// and not a second one further down the file.
const anchorsInFile = flat(lines.join("\n")).split(ANCHOR).length - 1;
check(
  "principles.md holds the rule B anchor phrase exactly once",
  anchorsInFile === 1,
  `found ${anchorsInFile}`,
);

// T-63 DoD item 3 names the three classes of judging document by hand. They are
// checked on the cut block, so a block that names only one of them goes red even
// while all ten copies agree with each other.
for (const named of ["opening document", "DoD items", "milestone list"]) {
  check(
    `rule B names the judging document class "${named}"`,
    ruleB.includes(named),
    `not in the block cut from principles.md: ${JSON.stringify(ruleB)}`,
  );
}

// Meaning 1: a briefing handing the document over changes nothing.
const briefings = ruleB.toLowerCase().split("briefing").length - 1;
check(
  'rule B answers the briefing that hands the document over ("briefing")',
  briefings >= 1,
  `the word appears ${briefings} time(s) in the block cut from principles.md: ${JSON.stringify(ruleB)}`,
);
check(
  "rule B says such a briefing is the mistake, not the licence",
  ruleB.includes("a mistake in the briefing") && ruleB.includes("make the change nowhere"),
  `the block cut from principles.md carries one or neither of those clauses: ${JSON.stringify(ruleB)}`,
);

// Meaning 2: the role has to report it. Matched case-insensitively because the
// clause opens a sentence in `principles.md` ("Say so in your report, …").
check(
  'rule B tells the role to report it ("say so in your report")',
  ruleB.toLowerCase().includes("say so in your report"),
  `not in the block cut from principles.md: ${JSON.stringify(ruleB)}`,
);

// ------------------------------------------------------------- the ten copies

// Read the folder rather than listing ten names, so a renamed or deleted prompt
// cannot leave this case silently checking nine files. C-01 owns the count as a
// claim of its own; here it is the premise the loop below rests on.
const roles = readdirSync(join(REPO, "roles")).filter((name) => name.endsWith(".md")).sort();
check(
  "roles/ holds exactly 10 prompt files",
  roles.length === 10,
  `found ${roles.length}: ${roles.join(", ")}`,
);

for (const name of roles) {
  const text = readFileSync(join(REPO, "roles", name), "utf8");

  // The paragraph the anchor sits in, so the comparison is equality on a block
  // rather than a substring search over the whole file. A paragraph is a run of
  // lines between blank lines.
  //
  // Each paragraph is FLATTENED before the anchor is looked for. Today the four
  // words of the anchor sit on one line in all ten files — so a raw search would
  // work by luck. Re-wrap any of these files at another width and the anchor
  // lands across a line break: a raw search would then find nothing and this
  // case would report "no paragraph carries rule B" about a file that carries it
  // perfectly. That is the very trap `gaps.md` item 21 is about.
  const carrying = text.split(/\n\s*\n/).filter((paragraph) => flat(paragraph).includes(ANCHOR));
  check(
    `roles/${name} has exactly one paragraph carrying the rule B anchor phrase`,
    carrying.length === 1,
    `found ${carrying.length}`,
  );

  const paragraph = carrying.length === 1 ? flat(carrying[0]) : "";
  check(
    `roles/${name} carries rule B word for word, as principles.md writes it`,
    paragraph === ruleB,
    carrying.length === 1
      ? `principles.md: ${JSON.stringify(ruleB)}\n      roles/${name}: ${JSON.stringify(paragraph)}`
      : "no single paragraph to compare",
  );

  // And exactly one copy of the whole block, so a second, drifted copy elsewhere
  // in the file cannot hide behind the first one.
  const copies = flat(text).split(ruleB).length - 1;
  check(
    `roles/${name} holds exactly one verbatim copy of rule B`,
    copies === 1,
    `found ${copies}`,
  );
}

done();
