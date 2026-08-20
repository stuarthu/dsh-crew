// Task T-01 — acceptance check 22.
// Proves the four pre-checks of step 17 change nothing in the working tree, and
// that --ff-only lives in the section that runs after the merge yes.
import { pm, step, check, done } from "../lib/qa.mjs";

const s17 = step(pm(), 17);
const from = s17.indexOf("Check all four things before you ask anything");
const to = s17.indexOf("Three separate yeses");
const precheck = s17.slice(from, to);
const afterYes = s17.slice(s17.indexOf("**The merge.**"));

check("the pre-check block was found", from !== -1 && to > from, `${from} .. ${to}`);
check("the pre-checks run no git switch", !precheck.includes("git switch"), precheck);
check("the pre-checks run no git merge", !precheck.includes("git merge"), precheck);
check("--ff-only is inside the section that follows the merge yes",
  afterYes.includes("git merge --ff-only origin/main"), afterYes.slice(0, 300));
check("the merge section starts by switching to main only after a clear yes",
  /on a clear yes: `git switch main`/.test(afterYes.replace(/\s+/g, " ")), afterYes.slice(0, 300));

done();
