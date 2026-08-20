// Task T-01 — acceptance check 35.
// A non-fast-forward push is recovered with a merge on main, and that merge can
// conflict. Without git merge --abort the PM would be stuck on main with an
// unresolved conflict, where git refuses to switch away.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));
const from = s17.indexOf("If the push is refused because `main` moved");
const to = s17.indexOf("After the push, watch the CI");
const recovery = s17.slice(from, to);

check("the non-fast-forward recovery section was found", from !== -1 && to > from, `${from} .. ${to}`);
check("the recovery never forces", /never force/.test(recovery), recovery);
check("a conflict in that merge is aborted with git merge --abort",
  /If\s*that merge conflicts, run `git merge --abort` first/.test(recovery), recovery);
check("and only then does it switch back to the work branch",
  recovery.indexOf("git merge --abort") < recovery.indexOf("git switch crew/<job-slug>"), recovery);

done();
