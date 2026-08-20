// Task T-01 — acceptance check 16.
// Proves a Hard rule makes reading the CI files a precondition of asking to
// push main, with the answer inside that same question.
import { pm, section, check, done } from "../lib/qa.mjs";

const rules = section(pm(), "Hard rules");

check("the hard rule requires reading the CI files before asking to push main",
  /Before you ask to push `main`, read the CI files/.test(rules), rules);
check("the answer goes into that same question",
  /put the answer in that\s+same question/.test(rules), rules);
check("no main push may be asked for without that line",
  /Never ask for a `main` push without that line/.test(rules), rules);
check("the answer is recorded under merge.publishCheck",
  /merge\.publishCheck/.test(rules), rules);

done();
