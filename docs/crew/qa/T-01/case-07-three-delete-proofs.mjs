// Task T-01 — acceptance check 13.
// Proves the delete has three proofs — the third one reading the REMOTE work
// branch — and that a proof only counts when the command really ran.
import { pm, step, check, done } from "../lib/qa.mjs";

const s17 = step(pm(), 17);

check("proof 1: the branch is listed by git branch --merged main",
  /`git branch --merged main` runs without an error and lists/.test(s17), s17);
check("proof 2: main is really on the remote",
  /`git log --oneline origin\/main\.\.main` runs without an error and prints\s+nothing/.test(s17), s17);
check("proof 3: the REMOTE work branch holds nothing main does not",
  /main\.\.origin\/crew\/<job-slug>` runs without an error and prints nothing/.test(s17), s17);
check("a proof counts only when the command itself ran without an error",
  /a proof counts only when the command itself ran without an error/.test(s17), s17);
check("an empty output from a failed command is called out as not a proof",
  /An empty output from a\s+command that failed is not a proof/.test(s17), s17);
check("all three must hold, and a failure means not even asking",
  /All three of these must hold/.test(s17) && /If any of these three checks fails, do not even ask/.test(s17), s17);

done();
