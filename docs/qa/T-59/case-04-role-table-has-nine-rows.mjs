// T-59, DoD item 3: the role table in both READMEs has NINE rows, the two new
// ones among them, and the tools column of each new row says "everything except
// the crew tools".
//
// What it proves: the page that tells a user which roles exist is complete. A user
// configures `roleAllow` / `roleDeny` / `roleModels` by role name off this table;
// a role missing from it is a role they cannot configure and do not know they
// have.
//
// KNOWN AND DELIBERATE, not a defect: the version box at the top of each README
// still says eight roles while this table says nine. T-59 left it alone and the PM
// ruled it stays — that box describes the RELEASED 0.7.0, and adding to it would
// describe unreleased work as released. `case-09` of this folder pins the box
// instead. So this case counts the table and only the table.
//
// PINNING STYLE: LINE-BASED. A `| … |` table row cannot wrap.
//
// One-way: nine is a floor, not a ceiling — a tenth role is a legitimate future
// addition. Losing one is the regression.

import { check, done, readmes, tableWith } from "./readmes.mjs";

const expected = [
  ["crew_test_engineer", "roles/test-engineer.md"],
  ["crew_code_engineer", "roles/code-engineer.md"],
];

for (const readme of readmes()) {
  const rows = tableWith(readme.text, "crew_researcher");

  check(
    `${readme.path}: the role table lists at least 9 roles`,
    rows.length >= 9,
    `found ${rows.length} row(s): ${rows.map((row) => (row.match(/`crew_[a-z_]+`/) ?? ["?"])[0]).join(", ")}`,
  );

  for (const [tool, persona] of expected) {
    const row = rows.find((line) => line.includes(`\`${tool}\``));
    check(
      `${readme.path}: the table has a row for \`${tool}\``,
      row !== undefined,
      "no row names it",
    );
    if (row) {
      check(
        `${readme.path}: that row points at \`${persona}\``,
        row.includes(persona),
        `the persona path is wrong or missing: ${row.trim()}`,
      );
      check(
        `${readme.path}: that row says it gets everything except the crew tools`,
        readme.path === "README.md"
          ? row.includes("everything **except** the crew tools")
          : row.includes("除 crew 工具外**都能用**"),
        `the tools column does not say what the DoD requires: ${row.trim()}`,
      );
    }
  }

  check(
    `${readme.path}: the text says three of those roles build a task, chosen by the task's shape`,
    readme.path === "README.md"
      ? readme.flat.includes("Three of those nine roles build a task")
      : readme.flat.includes("这九个角色里有三个"),
    "nothing connects the two new rows to the shape that picks between them",
  );
}

done();
