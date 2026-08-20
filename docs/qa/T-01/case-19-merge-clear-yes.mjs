// Task T-01 — acceptance check 37.
// The merge section must end the step on anything that is not a clear yes, the
// same way the delete section does.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));
const merge = s17.slice(s17.indexOf("**The merge.**"), s17.indexOf("**The push of `main`.**"));
const del = s17.slice(s17.indexOf("**The delete.**"));

check("the merge section was found", merge.length > 100, merge);
check("anything that is not a clear yes ends the step",
  /Anything that is not a clear yes ends this step/.test(merge), merge);
check("it says where the PM is left standing",
  /you are still on `crew\/<job-slug>`/.test(merge), merge);
check("the delete section has the same sentence",
  /Anything that is not a clear yes leaves the branch/.test(del), del);

done();
