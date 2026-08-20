// Task T-01 — acceptance check 3.
// Proves roles/pm.md really has step 17 "Merge and clean up" and that all six
// settled design decisions are spelled out in it, one by one.
import { pm, step, check, done } from "../lib/qa.mjs";

const s17 = step(pm(), 17);

check("step 17 is the merge and clean-up step", /^17\. \*\*Merge and clean up/.test(s17), s17.slice(0, 80));
check("decision 1: the PM merges, it is not handed back to the user",
  s17.includes("You do the merge yourself") && /Do not hand it back to the user/.test(s17));
check("decision 2: three separate yeses, one never covers the next",
  s17.includes("Three separate yeses") && s17.includes("one yes never covers the next thing"));
check("decision 3: a publishing main push is warned about loudly but still pushed on a yes",
  s17.includes("loudly") && s17.includes("Do not refuse"));
check("decision 4: always --no-ff, never --squash",
  s17.includes("git merge --no-ff") && s17.includes("Never `--squash`"));
check("decision 5: the merged-and-pushed proofs come before the delete",
  s17.includes("git branch --merged main") && s17.includes("git log --oneline origin/main..main"));
check("decision 6: trustRootAgent: false is reported in one line with the user's own command, no retry",
  s17.includes("trustRootAgent: false") && s17.includes("Do not retry"));
check("git branch -D is refused in the step itself", /never `-D`/.test(s17));

done();
