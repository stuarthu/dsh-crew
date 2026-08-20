// Task T-01 — acceptance check 23.
// Proves the catch-all sentence covers every way of stopping after the PM has
// switched to main, naming the failed fast-forward and the user's no.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));

check("the catch-all is about stopping anywhere after switching to main",
  /Whenever you stop anywhere in this step after you have switched to `main`/.test(s17), s17);
check("it names a failed fast-forward", /a fast-forward that failed/.test(s17), s17);
check("it names the user saying no", /a `no` from the user/.test(s17), s17);
check("it also names a conflict, a refused push and a refused delete",
  /a conflict, a refused push, or a refused delete/.test(s17), s17);
check("it runs git switch crew/<job-slug> before anything else is said",
  /run `git switch crew\/<job-slug>` before you say anything else/.test(s17), s17);

done();
