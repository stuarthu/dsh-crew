// T-52, DoD item 3: principle 21 follows this file's four-part shape — the rule,
// why it exists, the files that carry it (**Lives in**), and the outside sources.
//
// What it proves: a number in this file is a promise (`ADR 0014` option B says so
// in as many words: "一个号在这个文件里是一句承诺"). A numbered principle without
// its four parts breaks that promise, and it is the shape every other numbered
// principle here keeps.
//
// PINNING STYLE: LINE-BASED for the four part markers — each one starts a
// paragraph as `**Rule.**`, `**Why …`, `**Lives in**`, `**Source.**`, so it
// cannot wrap away from the start of a line. The count of source bullets is
// line-based too (a `- ` bullet starts a line).
//
// One-way: every numbered principle in this file has these four parts; a
// principle that loses one has stopped being a rule with a reason.

import { check, done, flatten, principle, principles } from "./principles.mjs";

const twentyOne = principle(principles(), 21);

check("principle 21 has a **Rule.** part", /^\*\*Rule\.\*\*/m.test(twentyOne), "no `**Rule.**` paragraph");
check("principle 21 has a **Why …** part", /^\*\*Why\b/m.test(twentyOne), "no `**Why …**` paragraph");
check("principle 21 has a **Lives in** part", /^\*\*Lives in\*\*/m.test(twentyOne), "no `**Lives in**` paragraph");
check("principle 21 has a **Source.** part", /^\*\*Source\.\*\*/m.test(twentyOne), "no `**Source.**` paragraph");

// **Lives in** has to name the two personas the rule is actually carried by,
// otherwise the part is present but empty of the thing it is for.
for (const file of ["roles/test-engineer.md", "roles/code-engineer.md", "roles/pm.md", "roles/architect.md"]) {
  check(
    `**Lives in** names ${file}`,
    twentyOne.includes(file),
    `principle 21 does not say the rule lives in ${file}`,
  );
}

// FLATTENED for this one sentence: it wraps.
check(
  "principle 21's rule says the PM merges the halves and runs them (CRD 0013 item 4)",
  /The PM merges the two halves and runs the project's test command itself/.test(flatten(twentyOne)),
  "the merged run is not in the rule — CRD 0013 item 4 moved that run to the PM, after the merge",
);

done();
