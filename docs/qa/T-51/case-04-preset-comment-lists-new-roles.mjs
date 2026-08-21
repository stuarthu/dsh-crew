// T-51, DoD item 5: the two documentation lists in
// `preset/crew/agent.cordis.yml` — the role-key comment and the `roleDeny`
// example — name the two new roles.
//
// What it proves: the only documentation these config options have is up to
// date. No check in the project reads these comment lines, and they are what a
// user copies: a `roleDeny` example that is short by one name hands that role a
// hole, and a role-key list that is short by one name tells the user a role key
// does not exist. Both lists are derived from the role table here, so this case
// keeps working when a tenth role is added instead of pinning today's nine names.

import { check, done, repoFile, REPO } from "../lib/qa.mjs";
import { join } from "node:path";

const { ROLE_TOOL_NAMES, ROLES } = await import(join(REPO, "host", "roles.js"));
const yaml = repoFile("preset/crew/agent.cordis.yml");

// --- the role-key comment: from "The key is the role key" to the next option.
const keysStart = yaml.indexOf("The key is the role key");
check("the role-key comment is still there", keysStart !== -1, "preset/crew/agent.cordis.yml no longer explains what the key is");
if (keysStart !== -1) {
  const keysBlock = yaml.slice(keysStart, yaml.indexOf("roleAllow:", keysStart));
  for (const role of ROLES) {
    check(
      `the role-key comment names \`${role.key}\``,
      keysBlock.includes(`\`${role.key}\``),
      `the comment block is:\n      ${keysBlock.trim().split("\n").join("\n      ")}`,
    );
  }
  check(
    "the role-key comment still says these are keys, not tool names",
    keysBlock.includes("not the tool"),
    "the sentence that stops a user writing `crew_engineer:` as the key is gone",
  );
}

// --- the roleDeny example line: it must list every crew tool the preset registers.
const example = yaml.split("\n").find((line) => line.includes("roleDeny: {"));
check("the roleDeny example line is still there", example !== undefined, "preset/crew/agent.cordis.yml has no roleDeny example");
if (example !== undefined) {
  for (const name of ROLE_TOOL_NAMES) {
    check(`the roleDeny example lists '${name}'`, example.includes(`'${name}'`), example.trim());
  }
  // Nothing extra, and nothing missing: the count is the half that catches a
  // name that was renamed rather than dropped.
  const listed = example.match(/'crew_[a-z_]+'/g) ?? [];
  check(
    `the roleDeny example lists exactly ${ROLE_TOOL_NAMES.length} crew tools (it lists ${listed.length})`,
    listed.length === ROLE_TOOL_NAMES.length,
    listed.join(", "),
  );
}

done();
