// T-51, DoD item 11: the delegation summaries are the final wording, and the
// four engineer/QA lines can be told apart.
//
// What it proves: the PM's own prompt is built from these one-line summaries, so
// two roles whose summaries read the same are two roles the PM will pick between
// by guessing. Nothing in the project reads the `summary` field at all — I
// grepped `tools/` — so this whole DoD row rested on a human reading four lines
// next to each other.
//
// This also collects M3's DoD item 6: the summaries land in M1 and are checked
// here.

import { check, done, REPO } from "../lib/qa.mjs";
import { join } from "node:path";

const { ROLES } = await import(join(REPO, "host", "roles.js"));
const summary = (key) => ROLES.find((role) => role.key === key)?.summary ?? "";

// --- the three lines this task rewrote, plus the solo line they are read against
check("crew_test_engineer's summary says `unit test`", summary("test_engineer").includes("unit test"), summary("test_engineer"));
check("crew_test_engineer's summary says `before`", summary("test_engineer").includes("before"), summary("test_engineer"));
check("crew_code_engineer's summary says `product code`", summary("code_engineer").includes("product code"), summary("code_engineer"));
check("crew_qa's summary says `docs/qa/`", summary("qa").includes("docs/qa/"), summary("qa"));
// The solo shape has to be readable AS the solo shape, because it now sits two
// lines from the pair: "write the code for a task" would be the same offer twice.
check("crew_engineer's summary names the solo shape", /solo/i.test(summary("engineer")), summary("engineer"));

// --- and none of the four reads like another
const four = ["engineer", "test_engineer", "code_engineer", "qa"];
for (const key of four) {
  for (const other of four) {
    if (key >= other) continue;
    check(`${key} and ${other} do not share a summary`, summary(key) !== summary(other), `both say: ${summary(key)}`);
  }
}

// --- every role still HAS a summary, and no two roles anywhere share one
for (const role of ROLES) {
  check(`${role.toolName} has a non-empty summary`, typeof role.summary === "string" && role.summary.trim().length > 0, JSON.stringify(role.summary));
}
const all = ROLES.map((role) => role.summary);
check(`all ${all.length} role summaries are different`, new Set(all).size === all.length, all.join(" | "));

done();
