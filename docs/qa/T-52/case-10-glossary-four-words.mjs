// T-52, DoD item 10: the glossary table holds all four words — unit test, case
// (a QA case), the project's test command, contract test — and each row says what
// it means, who writes it, and where it lives.
//
// What it proves: the table is complete and shaped, not a sentence pretending to
// be a table. `ADR 0014` is blunt about what can and cannot be checked here:
// existence and completeness can, "一句散文用得对不对" cannot (see `gaps.md`).
// So this case takes the half that is checkable and takes it seriously — four
// rows, four columns, and each cell non-empty.
//
// PINNING STYLE: LINE-BASED. A markdown table row is one line and cannot wrap.
//
// One-way: a word that entered the glossary stays in it. A fifth word may be
// added later, so the row count is checked as "the four are there", and the
// exact-four assertion is separate and named, so a legitimate fifth row fails
// loudly in one place rather than everywhere.

import { check, done, principles, sectionOf, table } from "./principles.mjs";

const glossary = sectionOf(principles(), "Words we use");
const words = table(glossary, "| Word |");

check(
  "the glossary table has four columns: word, meaning, who writes it, where it lives",
  words.columns === 4,
  `header is ${JSON.stringify(words.header)}`,
);

check(
  "the columns are the ones the PRD asked for",
  words.header[0].toLowerCase().includes("word")
    && words.header[1].toLowerCase().includes("means")
    && words.header[2].toLowerCase().includes("writes")
    && words.header[3].toLowerCase().includes("lives"),
  `header is ${JSON.stringify(words.header)}`,
);

check(
  "the table has exactly four data rows",
  words.rows.length === 4,
  `found ${words.rows.length}: ${words.rows.map((row) => row[0]).join(" | ")}`,
);

const first = words.rows.map((row) => row[0]);
for (const [name, pattern] of [
  ["unit test", /unit test/i],
  ["case (a QA case)", /\bcase\b/i],
  ["the project's test command", /project's test command/i],
  ["contract test", /contract test/i],
]) {
  check(
    `the glossary defines ${name}`,
    first.some((cell) => pattern.test(cell)),
    `first column holds: ${first.join(" | ")}`,
  );
}

for (const row of words.rows) {
  check(
    `every cell of the "${row[0].replace(/\*/g, "").slice(0, 28)}" row is filled in`,
    row.length === 4 && row.every((cell) => cell.replace(/[*—\s]/g, "") !== "" || cell.includes("—")),
    `row: ${JSON.stringify(row)}`,
  );
}

// The two homes are the distinction the whole glossary exists for, so they are
// pinned as paths, not as prose.
const unit = words.rows.find((row) => /unit test/i.test(row[0])) ?? [];
const qaCase = words.rows.find((row) => /^\*\*case/i.test(row[0])) ?? [];

check(
  "the unit test row says it lives in the project's own test suite",
  /project's own test suite/i.test(unit[3] ?? ""),
  `where-it-lives cell: ${JSON.stringify(unit[3] ?? "(row missing)")}`,
);

check(
  "the case row says `docs/qa/<task-id>/` and says only there",
  /docs\/qa\/<task-id>\//.test(qaCase[3] ?? "") && /only/i.test(qaCase[3] ?? ""),
  `where-it-lives cell: ${JSON.stringify(qaCase[3] ?? "(row missing)")}`,
);

check(
  "the case row names crew_qa as the one who writes it",
  (qaCase[2] ?? "").includes("crew_qa"),
  `who-writes-it cell: ${JSON.stringify(qaCase[2] ?? "(row missing)")}`,
);

check(
  "the unit test row names both engineers that may write one",
  (unit[2] ?? "").includes("crew_engineer") && (unit[2] ?? "").includes("crew_test_engineer"),
  `who-writes-it cell: ${JSON.stringify(unit[2] ?? "(row missing)")}`,
);

done();
