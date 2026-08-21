// T-59, DoD item 5 — and the third of the three holes this final QA round was
// asked to close first.
//
// What it proves: the table that tells the three test-writing roles apart really
// does stand in BOTH READMEs, with all four differences. `principles.md` 21
// promises this table is in both files; `docs/qa/T-52/case-13` only ever checked
// `principles.md`, and said so on purpose, because at that point the promise was
// still a requirement about the future. T-59 made it true. This case is the only
// thing standing between that and it going quietly false again.
//
// Why the table earns its own case: one of the three names invites the confusion
// it exists to remove. `crew_test_engineer` reads like "tester", which is QA, and
// it is not — it is a programmer writing unit tests before the code exists, while
// QA writes acceptance cases in `docs/qa/` after the code is finished. The user
// raised exactly that risk. The PRD calls the four differences "缺一不可" — not one
// is optional — so each one is checked on its own.
//
// PINNING STYLE: LINE-BASED for the table rows (a `| … |` row cannot wrap),
// FLATTENED for the sentence that names the four differences.

import { check, done, readmes, tableWith } from "./readmes.mjs";

for (const readme of readmes()) {
  // The needle is a cell that ONLY the three-role table has. `crew_test_engineer`
  // alone would find the role table further up the page — which also names it —
  // and the case would then assert on the wrong table and go red for the wrong
  // reason. That is what happened on the first run of this case.
  const rows = tableWith(readme.text, readme.path === "README.md" ? "| Who it is |" : "| 它是谁 |");

  check(
    `${readme.path}: the three-role table is there`,
    rows.length > 0,
    "no table row names crew_test_engineer",
  );

  check(
    `${readme.path}: the table has a column for each of the three roles`,
    readme.text.includes("| `crew_test_engineer` | `crew_code_engineer` | `crew_qa` |"),
    "the header row does not carry all three roles side by side",
  );

  // The four differences the PRD calls not-one-optional. Each is a row of the
  // table, and each is checked for the words that make it a difference rather
  // than for the row label alone.
  const wanted = readme.path === "README.md"
    ? [
      ["granularity", "one behaviour per unit test", "one DoD item per case"],
      ["timing", "**before** the code exists", "**after** the code is finished"],
      ["home", "your project's own test suite", "`docs/qa/<task-id>/`, nowhere else"],
      ["scope", "this task only", "plus every earlier task's cases run again"],
    ]
    : [
      ["granularity", "一个单元测试管一个行为", "一条用例管一条 DoD 条目"],
      ["timing", "代码存在**之前**", "代码写完**之后**"],
      ["home", "你项目自己的测试目录", "`docs/qa/<task-id>/`"],
      ["scope", "只有这一个任务", "之前每个任务的用例再跑一遍"],
    ];

  for (const [name, ...needles] of wanted) {
    check(
      `${readme.path}: the table carries the difference of ${name}`,
      needles.every((needle) => rows.some((row) => row.includes(needle))),
      `missing from every row: ${needles.filter((needle) => !rows.some((row) => row.includes(needle))).map((needle) => JSON.stringify(needle)).join(", ")}`,
    );
  }

  check(
    `${readme.path}: it says out loud that not one of the four is optional`,
    readme.path === "README.md"
      ? readme.flat.includes("Four differences, and not one of them is optional")
      : readme.flat.includes("四条区别，没有一条是可选的"),
    "the sentence that stops the table being read as decoration is missing",
  );

  check(
    `${readme.path}: it names the confusion the table removes`,
    readme.flat.includes("`crew_test_engineer`")
      && (readme.path === "README.md"
        ? readme.flat.includes("is a programmer, not QA")
        : readme.flat.includes("是程序员，不是 QA")),
    "the warning that the name invites the wrong reading is missing",
  );
}

done();
