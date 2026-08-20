// Task T-01 — acceptance check 5.
// Proves the state-file example carries a `merge` block with all four keys, and
// that a job which was never merged leaves the whole key out.
import { pm, section, check, done } from "../lib/qa.mjs";

const state = section(pm(), "The state file");
const line = state.split("\n").find(text => text.includes('"merge"')) ?? "";

check("the state example has a merge block", line.length > 0, state.slice(0, 200));
for (const key of ["into", "merged", "pushed", "branchDeleted"]) {
  check(`merge.${key} is in the example`, line.includes(`"${key}"`), line);
}
check("a job that was never merged leaves the whole merge key out",
  /Leave the whole `merge` key out for a job that was never merged/.test(state), state);

done();
