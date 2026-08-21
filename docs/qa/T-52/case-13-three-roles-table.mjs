// T-52, DoD item 13 (which also collects the M5 DoD half "三角色表进
// principles.md"): the table telling the three roles apart is inside principle 21,
// it has four columns, and not one of the four differences is missing —
// granularity, timing, home, scope.
//
// What it proves: the risk the user raised has an answer in the rules file.
// `crew_test_engineer` reads like "tester", which is QA, and it is not: it is a
// programmer writing unit tests before the code exists, while QA writes
// acceptance cases in `docs/qa/` after the code is finished. The PRD calls the
// four differences "缺一不可" — not one is optional — so each one is checked on
// its own row instead of trusting that the table looks right.
//
// PINNING STYLE: LINE-BASED for the table (a row cannot wrap), FLATTENED for the
// sentence that names the four differences.
//
// Scope note: the same table also has to stand in both READMEs. That is T-59's
// task, not this one, and the sentence in principle 21 that says so is a
// REQUIREMENT, not a description of today. This case therefore checks only
// `principles.md`.
//
// One-way: the three roles exist from T-51 onwards, and the table that separates
// them cannot get smaller without one of them becoming confusable again.

import { check, done, flatten, principle, principles, table } from "./principles.mjs";

const twentyOne = principle(principles(), 21);
const roles = table(twentyOne, "crew_test_engineer");

check(
  "the table has four columns: the label column plus the three roles",
  roles.columns === 4,
  `header is ${JSON.stringify(roles.header)}`,
);

for (const role of ["crew_test_engineer", "crew_code_engineer", "crew_qa"]) {
  check(
    `${role} is one of the columns`,
    roles.header.some((cell) => cell.includes(role)),
    `header is ${JSON.stringify(roles.header)}`,
  );
}

check(
  "every row of the table has four cells",
  roles.rows.every((row) => row.length === 4),
  roles.rows.filter((row) => row.length !== 4).map((row) => JSON.stringify(row)).join(" | "),
);

// The four differences, each looked for as its own row, and each row checked for
// the two sides of the difference rather than the label alone.
const rowStartingWith = (pattern) => roles.rows.find((row) => pattern.test(row[0])) ?? [];

const granularity = rowStartingWith(/granularit/i);
check("difference 1 — granularity has a row", granularity.length === 4, `rows: ${roles.rows.map((row) => row[0]).join(" | ")}`);
check(
  "granularity: one behaviour per unit test against one DoD item per case",
  /one behaviour/i.test(granularity[1] ?? "") && /DoD item/i.test(granularity[3] ?? ""),
  `row: ${JSON.stringify(granularity)}`,
);

const when = rowStartingWith(/^when$/i);
check("difference 2 — timing has a row", when.length === 4, `rows: ${roles.rows.map((row) => row[0]).join(" | ")}`);
check(
  "timing: before the code against after the code",
  /before/i.test(when[1] ?? "") && /after/i.test(when[3] ?? ""),
  `row: ${JSON.stringify(when)}`,
);

const home = rowStartingWith(/^home$/i);
check("difference 3 — home has a row", home.length === 4, `rows: ${roles.rows.map((row) => row[0]).join(" | ")}`);
check(
  "home: the project's own test suite against `docs/qa/<task-id>/`",
  /project's own test suite/i.test(home[1] ?? "") && /docs\/qa\//.test(home[3] ?? ""),
  `row: ${JSON.stringify(home)}`,
);

const scope = rowStartingWith(/^scope$/i);
check("difference 4 — scope has a row", scope.length === 4, `rows: ${roles.rows.map((row) => row[0]).join(" | ")}`);
check(
  "scope: this task only against every earlier task's cases run again",
  /this task only/i.test(scope[1] ?? "") && /earlier task/i.test(scope[3] ?? ""),
  `row: ${JSON.stringify(scope)}`,
);

// The two halves the name invites confusion about.
const who = rowStartingWith(/who it is/i);
check(
  "the table says the test engineer is a programmer and QA is QA",
  /programmer/i.test(who[1] ?? "") && /QA/.test(who[3] ?? ""),
  `row: ${JSON.stringify(who)}`,
);

const flat = flatten(twentyOne);
check(
  "principle 21 says none of the four differences is optional",
  /Four differences, and not one of them is optional/i.test(flat),
  "the sentence that makes the four differences binding is gone",
);

for (const word of ["granularity", "timing", "home", "scope"]) {
  check(
    `the four-differences sentence names ${word}`,
    new RegExp(word, "i").test(flat),
    `the word ${word} is missing from principle 21`,
  );
}

done();
