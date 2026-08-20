// Task T-01 — acceptance check 14.
// Proves --ff-only is how local main is caught up, and that force pushing main
// is refused whatever the guard would allow.
import { pm, step, check, done } from "../lib/qa.mjs";

const s17 = step(pm(), 17);

check("--ff-only is in step 17", s17.includes("git merge --ff-only origin/main"), s17);
check("a failed fast-forward stops the step and never force pushes",
  /do\s+not merge and never force push `main`/.test(s17), s17);
check("--force and --force-with-lease are never part of the step",
  /`git push --force`\s+and `--force-with-lease` on `main` are never part of this step/.test(s17), s17);
check("the guard allowing it is explicitly not a reason to do it",
  /whatever the\s+guard allows you to do/.test(s17), s17);

done();
