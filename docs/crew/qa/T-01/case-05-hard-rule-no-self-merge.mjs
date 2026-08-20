// Task T-01 — acceptance check 7.
// Proves the Hard rules forbid merging or deleting a branch on the PM's own
// judgement, and name both --squash and git branch -D.
import { pm, section, check, done } from "../lib/qa.mjs";

const rules = section(pm(), "Hard rules");

check("a hard rule forbids merging or deleting a branch on the PM's own judgement",
  /Never merge and never delete a branch on your own judgement/.test(rules), rules);
check("the same rule requires a separate yes for merge, main push and delete",
  /The merge, the\s+push of `main` and the delete each need their own yes/.test(rules), rules);
check("--squash is forbidden in the Hard rules", /Never\s+`git merge --squash`/.test(rules), rules);
check("git branch -D is forbidden in the Hard rules", /never `git branch -D`/.test(rules), rules);

done();
