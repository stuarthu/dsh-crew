// Task T-01 — acceptance check 41.
// Step 17 promises a tag push gets its own loud warning and its own yes, but the
// tag push itself happens in step 16 — so the promise has to be kept there.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const text = pm();
const s16 = flat(step(text, 16));
const s17 = flat(step(text, 17));

check("step 16 says loudly which workflow a tag push starts and whether it publishes",
  /Before a tag push, say loudly which workflow the tag push starts and\s*whether it publishes/.test(s16), s16);
check("the tag push needs a yes of its own",
  /get a yes for the tag push on its own/.test(s16), s16);
check("a yes for a branch or for main never covers a tag",
  /a yes\s*for a work branch or for `main` never covers a tag/.test(s16), s16);
check("step 17 makes the same promise about a tag push",
  /a tag push gets its own loud warning and its own yes/.test(s17), s17);

done();
