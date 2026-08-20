// Task T-01 — acceptance check 4.
// Proves step 7 (create the work branch) points forward to step 17 and says the
// clean-up happens only when the user asks for it.
import { pm, step, check, done } from "../lib/qa.mjs";

const s7 = step(pm(), 7);

check("step 7 names step 17 as where the branch is merged and cleaned up",
  /merged and cleaned up in\s+step 17/.test(s7), s7);
check("step 7 says it happens only when the user asks", /only when the user asks/.test(s7), s7);

done();
