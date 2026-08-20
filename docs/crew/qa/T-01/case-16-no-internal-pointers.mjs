// Task T-01 — acceptance check 26.
// The PM prompt ships inside the npm package, and the repository the PM works
// in does not contain this package's source. So it may not point at internals.
import { pm, check, done } from "../lib/qa.mjs";

const text = pm();

for (const pointer of ["host/git-guard.js", "publishingWorkflow()", "branchPushTriggers()"]) {
  check(`roles/pm.md does not name ${pointer}`, !text.includes(pointer),
    `found at index ${text.indexOf(pointer)}`);
}
check("the publish rule points at the guard by behaviour instead",
  /Use the same rule the crew's git guard uses/.test(text.replace(/\s+/g, " ")));

done();
