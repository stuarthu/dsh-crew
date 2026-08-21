// T-52, DoD item 7: the six ideas `CRD 0012` looked at and did not take are all
// in this file's rejected-ideas table, and every one of them carries a reason.
//
// What it proves: the search does not have to be run again. This file's own rule
// says so — "When you take an idea from outside, link the source. When you reject
// one, put it in the table above with the reason. The rejections save the next
// person from re-running the same search." A rejection with no reason is an
// invitation to re-open it, and two of these six (talking engineers, different
// models) were re-opened once already inside the interview itself.
//
// PINNING STYLE: LINE-BASED. One rejected idea is one table row, and a row
// cannot wrap.
//
// Why this case does not count "+6 rows against the previous commit", which is
// how the DoD phrases it: "the previous commit" stops meaning anything the moment
// T-52 is committed, and a case built on it would quietly turn into a comparison
// of the file with itself. The count was verified by hand once, in QA's report
// (`git diff -U0 principles.md` — a single hunk of exactly six added lines at the
// end of that table). What is left here is the half that stays true for the life
// of the project: these six ideas, each with a reason.
//
// One-way: a rejected idea stays in the table even after it is adopted — see the
// worktree row, which `CRD 0013` reversed and which case-15 checks. The table
// records history; it is never pruned.

import { check, done, principles, sectionOf, table } from "./principles.mjs";

const rejected = table(sectionOf(principles(), "What we looked at and did not take"), "| Idea |");

check(
  "the rejected-ideas table has two columns: the idea and why not",
  rejected.columns === 2 && /why not/i.test(rejected.header[1]),
  `header is ${JSON.stringify(rejected.header)}`,
);

const six = [
  ["the two engineers talking to each other", /engineers of a paired task talk to each other/i],
  ["two writing the unit tests and a third writing the code", /a third writing the code/i],
  ["comparing two prose summaries of the understanding", /prose summary of its understanding/i],
  ["two independent worktrees for real isolation", /Two independent worktrees/i],
  ["the code engineer declaring it did not read the unit tests", /declare in its report/i],
  ["different models through roleModels", /different models through `roleModels`/i],
];

for (const [name, pattern] of six) {
  const row = rejected.rows.find((cells) => pattern.test(cells[0]));
  check(`the table holds the rejected idea: ${name}`, row !== undefined, `no row matches ${pattern}`);
  check(
    `it says why: ${name}`,
    row !== undefined && row[1] !== undefined && row[1].replace(/\s/g, "").length > 40,
    row === undefined ? "the row itself is missing" : `reason cell is ${row[1]?.length ?? 0} char(s): ${JSON.stringify(row[1] ?? "")}`,
  );
}

check(
  "every row in the whole table has a reason (a row with an empty reason invites the search again)",
  rejected.rows.every((cells) => cells.length === 2 && cells[1].replace(/\s/g, "").length > 20),
  rejected.rows.filter((cells) => cells.length !== 2 || cells[1].replace(/\s/g, "").length <= 20).map((cells) => cells[0]).join(" | "),
);

done();
