// T-51, DoD item 1: the two new names are in `ROLE_TOOL_NAMES` and `ROLES`
// holds one entry each, with exactly one of allow / deny.
//
// What it proves: the walking skeleton's two names really exist in the role
// table, as deny-list roles, with the persona file names the rest of the checks
// read. `verify-mount.mjs` checks the SHAPE of whatever entries it finds
// (exactly one of allow / deny, no duplicate tool names); nothing there says
// these two names have to be present at all, so a revert that dropped one of
// them would leave every check in this repository green.

import { check, done, REPO } from "../lib/qa.mjs";
import { join } from "node:path";

const { ROLE_TOOL_NAMES, ROLES } = await import(join(REPO, "host", "roles.js"));

const expected = [
  { key: "test_engineer", toolName: "crew_test_engineer", personaFile: "test-engineer.md" },
  { key: "code_engineer", toolName: "crew_code_engineer", personaFile: "code-engineer.md" },
];

for (const want of expected) {
  check(
    `ROLE_TOOL_NAMES names ${want.toolName}`,
    ROLE_TOOL_NAMES.includes(want.toolName),
    `ROLE_TOOL_NAMES: ${ROLE_TOOL_NAMES.join(", ")}`,
  );

  const role = ROLES.find((candidate) => candidate.key === want.key);
  check(`ROLES holds one entry with key "${want.key}"`, role !== undefined, `keys: ${ROLES.map((each) => each.key).join(", ")}`);
  if (role === undefined) continue;

  check(`${want.key}: toolName is ${want.toolName}`, role.toolName === want.toolName, `it is ${role.toolName}`);
  check(`${want.key}: personaFile is ${want.personaFile}`, role.personaFile === want.personaFile, `it is ${role.personaFile}`);
  // Exactly one of the two, and it has to be `deny`: an allow list may not name
  // `bash` (CLAUDE.md design rule 2), and both of these roles have to run what
  // they write.
  check(`${want.key}: has a deny list`, Array.isArray(role.deny), `deny is ${JSON.stringify(role.deny)}`);
  check(`${want.key}: has no allow list`, role.allow === undefined, `allow is ${JSON.stringify(role.allow)}`);
}

// One entry each, not two: a copy-pasted duplicate would give dsh two tools with
// the same name and the loser would be silently unreachable.
for (const want of expected) {
  const copies = ROLES.filter((candidate) => candidate.key === want.key).length;
  check(`ROLES holds exactly one "${want.key}" entry (it holds ${copies})`, copies === 1);
}

done();
