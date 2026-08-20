// Task T-01 — acceptance check 6.
// Proves the Finish step no longer promises "nothing was pushed" whatever
// happened, and instead reports what was really merged, pushed and deleted.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s18 = flat(step(pm(), 18));

check("the summary reports what was merged, pushed and deleted",
  /what was merged, what was pushed and what was deleted/.test(s18), s18);
check('"nothing was pushed" is now conditional, not the fixed ending',
  /nothing was pushed, when nothing was/.test(s18), s18);
check("the old unconditional sentence is gone",
  !/plain statement that nothing was pushed\./.test(s18), s18);

done();
