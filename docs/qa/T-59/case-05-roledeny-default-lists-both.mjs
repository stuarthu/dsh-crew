// T-59, DoD item 4: in the `rolesDir` / `roleAllow` / `roleDeny` / `roleModels`
// configuration table, the `roleDeny` row's "default" cell names the two new
// roles — in both READMEs, saying the same thing.
//
// CARE REQUIRED, and the DoD says so: that table holds no list of role KEYS. The
// `roleDeny` default cell is prose, and the `roleAllow` row sits one line above it
// (583 against 582 in the English file, 468 against 467 in the Chinese one). A pin
// that matched the neighbouring row would look green while checking the wrong
// line. So this case finds the `roleDeny` row itself and asserts on that row only.
//
// What it proves: a user reading this table to write their own `roleDeny` sees all
// the roles whose shipped filter is a deny list. Miss two, and they hand-write a
// filter that is not what they think it is — which is precisely the correction
// `0.7.0` already had to publish once.
//
// PINNING STYLE: LINE-BASED. A table row cannot wrap.

import { check, done, readmes, tableWith } from "./readmes.mjs";

for (const readme of readmes()) {
  const rows = tableWith(readme.text, "roleDeny");
  const deny = rows.find((row) => row.includes("`roleDeny`"));
  const allow = rows.find((row) => row.includes("`roleAllow`"));

  check(
    `${readme.path}: the configuration table has a \`roleDeny\` row`,
    deny !== undefined,
    "no row names roleDeny",
  );

  check(
    `${readme.path}: and a separate \`roleAllow\` row, so the two are not confused`,
    allow !== undefined && allow !== deny,
    "roleAllow and roleDeny are not two distinct rows — a pin here could be reading the wrong line",
  );

  if (deny) {
    const wanted = readme.path === "README.md"
      ? ["test engineer", "code engineer"]
      : ["测试工程师", "代码工程师"];
    for (const needle of wanted) {
      check(
        `${readme.path}: the roleDeny default cell names ${JSON.stringify(needle)}`,
        deny.includes(needle),
        `the row does not name it: ${deny.trim()}`,
      );
    }
    check(
      `${readme.path}: the roleDeny row still names the roles it named before`,
      readme.path === "README.md"
        ? deny.includes("architect") && deny.includes("engineer") && deny.includes("QA")
        : deny.includes("架构师") && deny.includes("工程师") && deny.includes("QA"),
      `an older role dropped out of the cell: ${deny.trim()}`,
    );
  }

  check(
    `${readme.path}: the text says the key is the tool name without the crew_ prefix`,
    readme.path === "README.md"
      ? readme.flat.includes("The key in `roleAllow`, `roleDeny` and `roleModels` is the role's tool name")
      : readme.flat.includes("里的键，是这个角色的工具名"),
    "the sentence telling the user how to spell a key is missing",
  );
}

// The full list of role KEYS is not in either README — it lives in the crew preset
// comment, and T-51 owns it. Assert it is really there, so this case does not
// quietly become the only place that was supposed to hold it.
import { repoFile } from "../lib/qa.mjs";

const preset = repoFile("preset/crew/agent.cordis.yml");
for (const key of ["test_engineer", "code_engineer"]) {
  check(
    `preset/crew/agent.cordis.yml still lists the role key \`${key}\``,
    preset.includes(key),
    "the preset comment is where the complete key list lives; it is missing this one",
  );
}

done();
