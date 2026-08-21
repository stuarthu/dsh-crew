// T-60, DoD item 1: the "The two planes" table carries a row for each of the two
// new role tools, and the text says they take the same road as every other role.
//
// What it proves: the reader of `CLAUDE.md` — the next person changing this
// repository — can see where the two new roles live and that no new machinery was
// added for them. The table is the document's own map of the host plane against
// the agent plane; a role missing from it is a role the next change can break
// without knowing it existed.
//
// PINNING STYLE: LINE-BASED for the table rows (a `| … |` row cannot wrap),
// FLATTENED for the sentence below it.

import { check, claudeSection, done, flat, tableRows } from "./claude.mjs";

const planes = claudeSection("The two planes (the main thing to understand)");
const rows = tableRows(planes);

for (const role of ["crew_test_engineer", "crew_code_engineer"]) {
  const row = rows.find((line) => line.includes(role));
  check(
    `the two planes table has a row for \`${role}\``,
    row !== undefined,
    "no table row names it",
  );
  if (row) {
    check(
      `that row says where \`${role}\` is mounted from`,
      row.includes("host/roles.js") && row.includes("agent.cordis.yml"),
      `the row does not name both the ROLES table and the preset: ${row.trim()}`,
    );
  }
}

const flatPlanes = flat(planes);

check(
  "the text says the two paired roles take the same road as every other role",
  flatPlanes.includes("the same road as every other role"),
  "the sentence that says nothing special was added for them is missing",
);

check(
  "it names what that road is: a ROLES row, a persona file, maxDepth 1, a summary line",
  flatPlanes.includes("one `ROLES` row each")
    && flatPlanes.includes("`maxDepth: 1`")
    && flatPlanes.includes("summary"),
  "the road is claimed but not spelled out",
);

check(
  "it says only their instructions are unusual, not their plumbing",
  flatPlanes.includes("the plumbing is not"),
  "the sentence separating instructions from plumbing is missing",
);

done();
