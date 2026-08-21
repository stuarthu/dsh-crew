// Task T-01 — acceptance check 14. Turned around 2026-08-22 for T-95 DoD item 2
// (CRD 0024 decision 1).
// Proves --ff-only is how local `main` is caught up, and that step 17 force
// pushes nothing by itself: a force push is not how a failed fast-forward or a
// moved `main` is got past, and the only way one happens at all is the user
// approving that one command for that one push.
//
// WHY THIS FILE CHANGED. Three of its four checks pinned, word for word, the
// sentences that scoped the ban to `main` alone -- `do not merge and never force
// push `main`` and ``git push --force` and `--force-with-lease` on `main` are
// never part of this step`. CRD 0024 decision 1 replaced both: the user was
// asked twice, because it loosens a safety rule, and answered `main is ok if
// user approve`. So the rule is now wider (every branch, `main` included) and
// carries one exception (the user's approval, per push), and the three checks
// were left judging the rule that had been superseded -- `docs/qa/gaps.md` item
// 33. They were turned around rather than deleted: the count is still four, and
// each one now pins the old wording ABSENT together with the sentence that does
// that job in the new rule.
//
// HOW IT READS THE FILE. Everything is judged on the FLATTENED step (this prose
// wraps at 80 columns and wraps inside these very sentences) and WITHOUT case
// (`docs/qa/gaps.md` items 21 and 30). The present halves are phrase families:
// any one member satisfies the check, so a legitimate reword does not turn this
// red on a file that is correct. The old wordings are pinned by exact string,
// because that is the one thing that must never come back.
//
// WHAT THIS CASE DOES NOT DO. It reads step 17 as a whole, the way a T-01 check
// about that step's git commands should.
// `docs/qa/T-66/case-04-no-force-push-permission.mjs` slices the merge and the
// push paragraphs apart and prints four counts per absent wording, and
// `docs/qa/T-94/case-01-force-push-needs-user-approval.mjs` checks the four
// parts of the new rule per place. The overlap between the three is the overlap
// `docs/qa/gaps.md` item 3 describes: the check names the strings, so the inputs
// cannot help but meet.

import { pm, step, check, done, flat } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));
const low = s17.toLowerCase();

/** The members of `family` step 17 states, ignoring case. */
const says = (family) => family.filter((wording) => low.includes(wording.toLowerCase()));

/** Copies of `phrase` in the flattened step, ignoring case. */
const copies = (phrase) => low.split(phrase.toLowerCase()).length - 1;

check("--ff-only is in step 17", s17.includes("git merge --ff-only origin/main"), s17);

{
  const old = "do not merge and never force push `main`";
  const stops = says(["tell the user and stop"]);
  const notPast = says(["do not force push `main` to get past it", "force pushes nothing by itself", "do not force push", "never force push"]);
  check(
    `a failed fast-forward stops the step, and no force push gets past it (${copies(old)} copy/copies of the pre-T-94 wording, ${stops.length} stop wording(s), ${notPast.length} refusal wording(s))`,
    copies(old) === 0 && stops.length > 0 && notPast.length > 0,
    `the step has to end when the fast-forward fails, and rewriting \`main\` is not the way through it. The rule CRD 0024 wrote is wider than the old one, not softer: the approval it added is for a push the user asked for, not for getting past a merge. ${s17}`,
  );
}

{
  const old = "on `main` are never part of this step";
  const named = ["`git push --force`", "`--force-with-lease`"].filter((command) => s17.includes(command));
  const byDefault = says(["force pushes nothing", "not part of it", "never part of this step", "nothing by default"]);
  const onlyWay = says(["unless the user has approved", "the user has approved", "the user's approval", "the user approves"]);
  check(
    `--force and --force-with-lease are not part of the step unless the user approved that one push (${copies(old)} copy/copies of the pre-T-94 wording, ${named.length} of 2 commands named, ${byDefault.length} default-off wording(s), ${onlyWay.length} approval wording(s))`,
    copies(old) === 0 && named.length === 2 && byDefault.length > 0 && onlyWay.length > 0,
    `both commands have to be named, the default has to be off, and the user's approval for that one command has to be the only way in -- one approval, one push. ${s17}`,
  );
}

{
  const lets = says(["trusts you", "trusts your own session", "straight through", "lets a force push"]);
  const onlyRule = says(["the only thing standing in front of it", "nothing else holds you", "nothing but this rule", "this rule is the only"]);
  check(
    `the guard allowing it is explicitly not a reason to do it (${lets.length} wording(s) saying the guard lets the root session through, ${onlyRule.length} saying this rule is all there is)`,
    s17.includes("whatever the guard allows") && lets.length > 0 && onlyRule.length > 0,
    `\`host/git-guard.js\` returns early for the root agent, and the root agent is the PM: a force push of the PM's is refused by nothing. Step 17 has to say that out loud, or the rule reads like something else is enforcing it. ${s17}`,
  );
}

done();
