// T-52, DoD item 2 (`ADR 0011`): principles 1 to 20 still carry the same
// headings they carried before this task, so nothing was renumbered.
//
// What it proves: the numbers other files cite are still on the same rules.
// case-01 proves the SET of numbers is 1..21; that alone would stay green if
// somebody inserted a new principle in the middle and pushed every later rule
// down one number, because the set would still be 1..21 after the last one was
// dropped or renamed. The snapshot below is what makes that impossible: number
// 13 has to still be "Every test lands on disk and runs again", and if it is
// not, seven citations by number are silently wrong.
//
// The snapshot was taken from the version of the file that existed before T-52
// started (`git show HEAD:principles.md` at 2a9d211, 2026-08-21). It is written
// out literally rather than read from git on the fly, on purpose: a case that
// compared against `HEAD` would become a tautology the moment the PM commits
// T-52 — `HEAD` would then hold the new file and the comparison would compare
// the file with itself. A literal snapshot keeps working for the life of the
// project, which is what a regression case is for.
//
// PINNING STYLE: LINE-BASED (headings cannot wrap).
//
// If a heading is reworded on purpose, that is a real change to a rule's name
// and it belongs in the same commit as this line — the trade `ADR 0004` and
// `ADR 0007` describe for a prose pin. Do not "fix" the case first and then look.

import { check, done, headings, principles } from "./principles.mjs";

const BEFORE_T52 = {
  1: "The crew is flat, so the documents have to carry everything",
  2: "Between two modules there is a written contract, and nothing else",
  3: "Every boundary has a test on each side",
  4: "The first task is a walking skeleton",
  5: "Big work stops at milestones, and the user judges each one",
  6: "Tests come before code, and the report has to prove it",
  7: "Reuse before you invent, and judge a module by how easy it is to use",
  8: "The stack is settled once and confirmed, then shape and library split",
  9: "Data ownership and consistency belong in the contract",
  10: "A contract change mid-flight should be additive",
  11: "The spec and the code must not drift apart quietly",
  12: "A reviewer that can write files is not a reviewer",
  13: "Every test lands on disk and runs again",
  14: "Documents are the only channel, and a change gets a CRD",
  15: "A milestone that ships needs two written plans, and their shape is researched",
  16: "A branch is merged and deleted only on the user's word, and only when it is proven",
  17: "The one who finds the choice does not make it alone",
  18: "Agents run in parallel by default, and serializing needs a real reason",
  19: "Documents are split by how long they live, not by who was in the room",
  20: "Every change leaves a record in the repository, and one table holds the whole flow",
};

const now = new Map(headings(principles()).filter((heading) => heading.number !== null).map((heading) => [heading.number, heading.title]));

for (const [number, title] of Object.entries(BEFORE_T52)) {
  check(
    `principle ${number} is still "${title.slice(0, 40)}…"`,
    now.get(Number(number)) === title,
    `number ${number} now reads: ${JSON.stringify(now.get(Number(number)) ?? "(missing)")}`,
  );
}

check(
  "principle 6's heading was kept, so the rewrite happened in place (ADR 0011 option A)",
  now.get(6) === BEFORE_T52[6],
  `principle 6 now reads: ${JSON.stringify(now.get(6) ?? "(missing)")}`,
);

done();
