// Task T-01 — acceptance check 39.
// dsh shows the guard's refusal as `Error: dsh-crew git guard blocked this
// command: <reason>`, so a PM told to look for a message that STARTS WITH that
// text would decide the guard was not involved.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));

check("the test is `contains`", /An error that contains `dsh-crew git guard blocked this command`/.test(s17), s17);
check("it is not `starts with`", !/starts with `dsh-crew/.test(s17), s17);
check("the real shape with the Error: prefix is written out",
  /dsh shows it as `Error: dsh-crew git guard blocked this command: <reason>`/.test(s17), s17);
check("the reason after the colon is what gets read", /read the reason after the colon/.test(s17), s17);

done();
