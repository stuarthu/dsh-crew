// Task T-01 — acceptance check 43.
// A job slug containing `push-ok` makes the guard refuse with a third reason
// that is neither a protected branch nor the remote's answer. Without this
// sentence the PM can only guess.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));

check("the approval-file reason is handled on its own",
  /If the guard's reason names the push\s*approval file/.test(s17), s17);
check("it is explicitly not a permission problem",
  /your permission is not the problem/.test(s17), s17);
check("the real cause is named: a word in the command matched that file's name",
  /a word inside the command matched that file's name/.test(s17), s17);
check("the user is given the command to run",
  /let the user run the\s*command/.test(s17), s17);

done();
