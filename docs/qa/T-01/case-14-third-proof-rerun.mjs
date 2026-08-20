// Task T-01 — acceptance check 24.
// Proves the third proof is run again in the same turn as the delete, after the
// yes and before the branch is removed.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));

check("the third proof runs once more in the same turn",
  /On a clear yes, run the third proof once more in the same turn/.test(s17), s17);
check("the delete happens only when it again ran cleanly and printed nothing",
  /only when it again runs without an error and prints nothing/.test(s17), s17);
check("something new on the remote branch stops the delete",
  /If something appeared on the remote branch while you waited, do not delete/.test(s17), s17);
check("the re-run comes before git branch -d in the text",
  s17.indexOf("run the third proof once more") < s17.indexOf("git branch -d crew/<job-slug>"), s17);

done();
