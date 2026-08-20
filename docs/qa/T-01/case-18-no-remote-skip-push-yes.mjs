// Task T-01 — acceptance check 36.
// In a repository with no remote the push of main can only ever fail, so the
// second yes must not be asked for at all.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));

check("with no remote there is nothing to push",
  /With no remote there is nothing to push/.test(s17), s17);
check("that yes is skipped", /skip this yes/.test(s17), s17);
check("and `pushed` is left out of the merge block",
  /leave `pushed` out of `merge`/.test(s17), s17);
check("the pre-check about a moved main also has a no-remote exit",
  /With no remote both commands fail — say that in one line and go on/.test(s17), s17);
check("proofs 2 and 3 failing in a local-only repository is called normal, and no question is asked",
  /In a repository with no remote, or when the work branch was never pushed, proofs 2 and 3 cannot pass/.test(s17)
  && /do not\s*ask/.test(s17), s17);

done();
