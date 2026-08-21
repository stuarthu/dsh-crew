// T-52, DoD item 12 (and the PRD's "它可以被检查" item 2): the phrase "QA test"
// appears in `principles.md` only inside the sentence that bans it, and it
// appears nowhere in `roles/`.
//
// What it proves: the ban is real and the file obeys it. The point of the ban is
// small and easy to lose: "QA test" puts the word "test" back into the name and
// glues together the two things the glossary just separated. A file that bans the
// phrase on one line and uses it on another has taught the phrase, not banned it.
//
// PINNING STYLE: FLATTENED for judging the context of each hit (the ban sentence
// wraps), and a plain substring count for `roles/*.md`, where the phrase must
// simply not occur.
//
// Scope note: this case does not scan `docs/`. The Chinese design documents (the
// PRD, `ADR 0014`, the task table) quote the phrase in order to ban it, and a
// repository-wide count would fail on the documents that created the rule.
//
// One-way: "do not write QA test" can only ever get stronger. `roles/` holding
// zero copies is one-way in the same sense — the phrase is banned for good, so a
// future 1 is a defect, never a milestone.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, countFlat, done, principles, repoFile, sentencesWith } from "./principles.mjs";

const text = principles();
const hits = countFlat(text, "QA test");

check(
  "the phrase appears at least once — the ban is written down",
  hits >= 1,
  "principles.md never mentions the banned phrase, so nothing bans it",
);

const sentences = sentencesWith(text, "QA test");

check(
  "every occurrence in principles.md sits in a sentence that bans it",
  sentences.length === hits && sentences.every((sentence) => /banned phrase|do not write/i.test(sentence)),
  `${hits} occurrence(s), ${sentences.length} sentence(s):\n      ${sentences.map((sentence) => sentence.slice(0, 140)).join("\n      ")}`,
);

check(
  "the ban says why (it puts the word \"test\" back)",
  sentences.some((sentence) => /puts the word "test" back/i.test(sentence)) || /puts the word "test" back/i.test(sentences.join(" ")),
  "the phrase is banned with no reason given, which is the shape this file's own rules reject",
);

// `roles/` is where the phrase would do damage: a persona that says "QA test"
// undoes the separation for every future agent that reads it.
const roles = readdirSync(join(REPO, "roles")).filter((name) => name.endsWith(".md"));
check("there are role files to check", roles.length > 0, "roles/ holds no .md files — the repository's shape moved");

for (const name of roles) {
  const body = repoFile(join("roles", name));
  check(
    `roles/${name} never says "QA test"`,
    !body.includes("QA test"),
    `${body.split("QA test").length - 1} occurrence(s)`,
  );
}

done();
