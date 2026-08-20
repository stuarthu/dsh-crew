// Task T-06 — acceptance check 44 (CRD 0002).
// The job slug is pasted into a file path and into nearly every git command of
// steps 7 and 17, and the PM's own session is the one the git guard trusts. So
// step 6 has to fix the slug's shape, and say why.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s6 = flat(step(pm(), 6));

check("only lowercase letters, digits and - are allowed",
  /lowercase letters, digits and `-`, nothing else/.test(s6), s6);
check("it may not start or end with -", /may not start or end with `-`/.test(s6), s6);
check("the shape is given as a pattern",
  s6.includes("^[a-z0-9]([a-z0-9-]*[a-z0-9])?$"), s6);
check("a one-character slug is covered by the pattern", /one-character slug like `x` is legal/.test(s6), s6);
check("there is a length limit, and it is a real number",
  /At most (\d+) characters/.test(s6), s6);
check("`..` is refused", /It may never contain `\.\.`/.test(s6), s6);
check("the pattern is said to refuse `/`, a space and `;` as well",
  /the pattern already refuses that, together with `\/`, a space, `;`/.test(s6), s6);
check("why: the slug is pasted into a file path", /the slug is pasted into a file path/.test(s6), s6);
check("why: and into the git commands of steps 7 and 17",
  /into almost every git command of step 7 and step 17/.test(s6), s6);
check("why: a space or `;` turns one command into two",
  /A slug with a space or a `;` turns one command into two/.test(s6), s6);
check("why: the PM's own session is the trusted root agent",
  /Your own session is the root agent, and the git guard trusts the root agent/.test(s6), s6);

done();
