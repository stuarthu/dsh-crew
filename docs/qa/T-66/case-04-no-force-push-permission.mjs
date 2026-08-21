// T-66 DoD item 5 and item 6 (PRD M1 DoD item 9, requirement B8), and T-95 DoD
// item 1 (CRD 0024 decision 1).
// Proves `roles/pm.md` never lets the ORDINARY push yes cover a force push --
// the two wordings that carried that permission are gone -- and that the three
// sentences which used to scope the ban to `main` alone have been replaced, at
// each of the three places they lived, by the wider rule the user approved.
//
// ------------------------------------------------ 2026-08-22: turned around, not deleted
//
// Three checks in this case were pinning the OLD wording word for word:
//   `do not merge and never force push \`main\``
//   `\`git push --force\` and \`--force-with-lease\` on \`main\` are never part of this step, …`
//   `No yes covers a force push of \`main\``
// The third of those said a force push of `main` is refused even WITH the
// user's yes. CRD 0024 decision 1 replaced all three: the user was asked twice,
// because it loosens a safety rule, and answered `main is ok if user approve`.
// So a force push is now forbidden on EVERY branch, `main` included, unless the
// user approves that one command for that one push.
//
// The three checks therefore went red the day T-94 landed -- not because the
// file broke a rule, but because they were the old rule's judge. That is
// `docs/qa/gaps.md` item 33: a superseded check does not retire itself, it is
// green right up to the moment the new rule lands, and the cheapest thing to do
// on that day is delete it. Each one was TURNED AROUND instead, the way
// `crew-qa-C64` turned around T-64's numbered-pointer check: each is now a pair
// -- the old narrow wording pinned ABSENT, and the sentence that took its place
// at that same spot pinned PRESENT. Nothing was weakened and no check was lost;
// the count went from 16 to 21, and the two checks that prove step 17's
// sub-headings still divide it are part of that: an anchor that matched nothing
// would leave the three PRESENT halves reading an empty string.
//
// The PRESENT halves are deliberately about each SPOT's own job -- the merge
// stops rather than forcing past a failed fast-forward, the push paragraph is
// force-push-free by default, the hard rules keep a force push outside the
// ordinary push yes -- and not about the four parts of the new rule. Those are
// checked, per part and per place, by
// `docs/qa/T-94/case-01-force-push-needs-user-approval.mjs`, so the two cases
// do not restate each other.
//
// Why this one matters more than most: reading the old file the wrong way was
// not a documentation problem. The **Hard rules** push bullet said the PM may
// push `main`, a tag, `or with force` once the user has just said yes, and step
// 16 said the guard trusts the root session for any branch, any tag `and even a
// force push`. Step 17 said the opposite: `git push --force` and
// `--force-with-lease` on `main` are never part of that step, whatever the
// guard allows. One file, two rules, and the reader picks -- and the reader who
// picks the first one force pushes on a single yes, which is the one git
// operation that destroys somebody else's commits.
//
// ---------------------------------------------------- method, and why it is this
//
// 1. THE TRAP. Step 17 is also read by
//    `docs/qa/T-01/case-08-ff-only-never-force.mjs` (turned around on the same
//    day and for the same reason), and it legitimately
//    contains `force`, `force push`, `--force`, `--force-with-lease` and
//    `whatever the guard allows`. So ANY pin on "the file mentions a force
//    push" goes red on the sentence that forbids it. The two strings pinned
//    here were chosen by T-66 for the opposite property: they carry the
//    PERMISSION and not the mention. `or with force` needs the list of things
//    one yes covers to be a sentence at all, and `and even a force push` needs
//    the guard-trusts-you clause. A prohibition is written "never force push",
//    or "not even a force push", and matches neither. The same two strings are
//    pinned ABSENT inside `tools/verify-mount.mjs` against the assembled PM
//    prompt; this case reads the source file `roles/pm.md`, which is the other
//    half of the same rule and the half a reader edits.
//
// 2. BOTH STRINGS WERE CHECKED AGAINST THE SOURCE, NOT AGAINST THE RENDERED
//    DoD (`docs/qa/gaps.md` item 27). In the file as it stood before T-66 they
//    read, byte for byte and on one line each:
//      `  publishing a package. Push \`main\`, a tag, or with force only when the user has`
//      `    for any branch, any tag, and even a force push -- but the ask is still the`
//    Neither pinned string contains a backtick or any markdown, so there is no
//    escaped-backtick form to also match, and nothing here was copied out of a
//    table cell.
//
// 3. EVERY count is taken on the FLATTENED text. For a string that must NOT be
//    there, the flattened count and the per-line count are both 0 today, and
//    two zeros agreeing prove nothing: the day the permission comes back it can
//    come back wrapped across two lines, and a per-line search stays 0 while
//    the grant is plainly in the file. An ABSENT pin can only be judged after
//    flattening (`docs/qa/gaps.md` item 21). Both mutants below put the
//    permission back ACROSS a line break on purpose, and each one asserts the
//    per-line count is still 0, so the flattening is proved and not assumed.
//
// 4. MENTION AGAINST RULE (`docs/qa/gaps.md` item 26), and this is the reason
//    the case is not a plain `count === 0`. A grant is text the prompt states
//    in its own voice; a copy inside quotes or backticks is the prompt talking
//    ABOUT the old rule, which is exactly how a later edit records that the
//    rule was deleted -- `Never write "or with force" in the hard rules again.`
//    A plain count would go red on that honest sentence, and the fix somebody
//    reached for would be to weaken or delete this case. So an occurrence
//    counts as a grant unless it is wrapped in quotes or backticks on both
//    sides, which is decided after flattening so that a quoted phrase broken
//    over two lines still reads as quoted. What this does NOT decide is whether
//    the quoting sentence really forbids the rule: a grant hidden inside
//    backticks would pass. That is reported as a gap, not patched with a list
//    of negation words -- a word list is a proxy, and item 26 records that
//    widening the window buys a false green.
//
// 5. Scope: the whole file first, because nothing fixes where a grant may
//    appear, and then the two places each wording actually lived -- the **Hard
//    rules** section and step 16 -- so a grant that came back cannot be
//    reported by one number that names no place.
//
// 6. This case is read-only. It reads `roles/pm.md` once, does every mutation
//    on a string in memory, writes no file, needs no network and no git
//    history, and gives the same result run twice.

import { check, done, flat, pm, section, step } from "../lib/qa.mjs";

const text = pm();

// The two wordings that carried the permission, and where each one lived.
const HARD_RULES_GRANT = "or with force";
const STEP_16_GRANT = "and even a force push";

// Quote characters that turn a copy of the wording into the prompt talking
// about it: the ASCII pair, the backtick, and the curly quotes a copy-paste
// out of a document brings with it.
const QUOTE = /["'`“”‘’]/;

/**
 * Every occurrence of `phrase` in the flattened text, each marked `quoted`
 * when it is wrapped in a quote character on both sides.
 */
function occurrences(someText, phrase) {
  const flattened = flat(someText);
  const hits = [];
  for (let at = flattened.indexOf(phrase); at !== -1; at = flattened.indexOf(phrase, at + 1)) {
    const before = flattened[at - 1] ?? " ";
    const after = flattened[at + phrase.length] ?? " ";
    hits.push({
      quoted: QUOTE.test(before) && QUOTE.test(after),
      context: flattened.slice(Math.max(0, at - 80), at + phrase.length + 80),
    });
  }
  return hits;
}

/** The occurrences that are the prompt granting the thing in its own voice. */
const grants = (someText, phrase) => occurrences(someText, phrase).filter((hit) => !hit.quoted);

/** The occurrences that are the prompt quoting the old wording. */
const quotes = (someText, phrase) => occurrences(someText, phrase).filter((hit) => hit.quoted);

/** How many lines hold `phrase` without any flattening -- printed, never asserted on. */
const perLine = (someText, phrase) => someText.split("\n").filter((line) => line.includes(phrase)).length;

/** Replace `from` once, and throw when the anchor moved, so no mutant is a no-op. */
function mutate(someText, from, to) {
  const first = someText.indexOf(from);
  if (first === -1) throw new Error(`mutation anchor not found in roles/pm.md: ${JSON.stringify(from)}`);
  if (someText.indexOf(from, first + from.length) !== -1) {
    throw new Error(`mutation anchor appears more than once in roles/pm.md: ${JSON.stringify(from)}`);
  }
  return someText.slice(0, first) + to + someText.slice(first + from.length);
}

/**
 * Run one self-test, and turn a moved anchor into a named failure instead of a
 * crash. `mutate` throws on purpose -- an edit that matched nothing would leave
 * the mutant identical to the file and report a pass for a pin it never touched
 * -- but a throw that escapes ends the whole run, so the checks after it never
 * report and the totals never print. Both halves matter here: the anchor of
 * mutant 1 is the very sentence a comeback would rewrite, so this is the likely
 * case, not a theoretical one.
 */
function selfTest(what, body) {
  try {
    body();
  } catch (error) {
    check(what, false, `${error.message}\n      the wording this self-test edits has moved: re-read roles/pm.md and fix the anchor in the same commit -- never delete the self-test`);
  }
}

// ------------------------------------------------- DoD item 5 and item 6: no grant

for (const [phrase, where] of [[HARD_RULES_GRANT, "the **Hard rules** push bullet"], [STEP_16_GRANT, "step 16's asking paragraph"]]) {
  const granted = grants(text, phrase);
  const quoted = quotes(text, phrase);
  check(
    `roles/pm.md grants a force push 0 times through \`${phrase}\` (${granted.length} grant(s), ${quoted.length} quoted mention(s), ${perLine(text, phrase)} per line)`,
    granted.length === 0,
    `${phrase} used to live in ${where}. PRD B8 removed it because one yes must never cover a force push, and step 17 forbids one outright. ${granted.map((hit) => `...${hit.context}...`).join("\n      ")}`,
  );
}

// The same two counts, taken in the one section each wording lived in, so a
// comeback is reported with a place and not only with a number.
{
  const rules = section(text, "Hard rules");
  const granted = grants(rules, HARD_RULES_GRANT);
  check(
    `the Hard rules section grants a force push 0 times through \`${HARD_RULES_GRANT}\` (${granted.length} grant(s))`,
    granted.length === 0,
    `the push bullet may not say a yes covers a force push. ${granted.map((hit) => `...${hit.context}...`).join("\n      ")}`,
  );
}
{
  const s16 = step(text, 16);
  const granted = grants(s16, STEP_16_GRANT);
  check(
    `step 16 grants a force push 0 times through \`${STEP_16_GRANT}\` (${granted.length} grant(s))`,
    granted.length === 0,
    `step 16 may not say the guard trusts the root session with a force push -- the ask is the rule, and step 17 forbids the force push itself. ${granted.map((hit) => `...${hit.context}...`).join("\n      ")}`,
  );
  check(
    "step 16 still says the ask is the rule",
    flat(s16).includes("the ask is the rule"),
    "the guard clause was deleted; the sentence that makes asking the rule has to stay, or step 16 lost the rule together with the wrong reason for it",
  );
}

// ------------------- the three `main`-only sentences are gone, and what replaced them
//
// Each spot is one PAIR: the old narrow wording ABSENT, and the sentence that
// does that spot's job PRESENT. The absent halves are judged on the FLATTENED
// text and WITHOUT CASE, and print all four numbers -- flat and per line, with
// and without case -- because a wording can come back wrapped across two lines
// (`docs/qa/gaps.md` item 21: for an absent pin the per-line 0 proves nothing)
// or with one capital letter changed (`docs/qa/gaps.md` item 30). The present
// halves are phrase FAMILIES: any one member satisfies the check, so a
// legitimate reword of the passage does not go red on a file that is correct.

/** flat and per-line counts of `phrase`, with and without case. */
function counts(someText, phrase) {
  const flattened = flat(someText);
  const lines = someText.split("\n");
  const copies = (haystack, needle) => haystack.split(needle).length - 1;
  return {
    flatCase: copies(flattened, phrase),
    flatAny: copies(flattened.toLowerCase(), phrase.toLowerCase()),
    lineCase: lines.filter((line) => line.includes(phrase)).length,
    lineAny: lines.filter((line) => line.toLowerCase().includes(phrase.toLowerCase())).length,
  };
}

/** All four numbers, for the check name. */
const shown = (seen) => `flat ${seen.flatCase} case-sensitive / ${seen.flatAny} either case, per line ${seen.lineCase} / ${seen.lineAny}`;

/** The members of `family` this text states, ignoring case, after flattening. */
const says = (someText, family) => {
  const flattened = flat(someText).toLowerCase();
  return family.filter((wording) => flattened.includes(wording.toLowerCase()));
};

/**
 * One `**Sub-heading.**` block of a flattened step, up to the next sub-heading.
 * Anchored on the sub-heading, never on a line number (ADR 0023 shape 7), and
 * an anchor that matches nothing returns "" so the caller reports it by name
 * instead of passing on an empty string.
 */
function subBlock(flatStep, from, to) {
  const start = flatStep.indexOf(from);
  if (start === -1) return "";
  const end = flatStep.indexOf(to, start + from.length);
  return end === -1 ? flatStep.slice(start) : flatStep.slice(start, end);
}

{
  const s17raw = step(text, 17);
  const s17 = flat(s17raw);
  const merge = subBlock(s17, "**The merge.**", "**The push of `main`.**");
  const push = subBlock(s17, "**The push of `main`.**", "**The delete.**");

  for (const [where, block] of [["the merge paragraph", merge], ["the push of `main` paragraph", push]]) {
    check(
      `step 17's sub-headings still divide it, so this case reads ${where} and not the whole step`,
      block !== "",
      "the sub-heading this case slices on was reworded or the step was split up. Fix the anchor in the same commit: an anchor that matches nothing leaves every check below reading an empty string, which passes while reading nothing at all",
    );
  }

  // Spot 1, the merge: the old absolute is gone, and the paragraph still stops
  // instead of forcing its way past a failed fast-forward.
  {
    const old = "do not merge and never force push `main`";
    const seen = counts(s17raw, old);
    check(
      `step 17 no longer scopes the merge's force-push rule to \`main\` alone through \`${old}\` (${shown(seen)})`,
      seen.flatAny === 0,
      "CRD 0024 decision 1 widened this rule to every branch on the user's own instruction. If this wording is back, the merge paragraph is stating the pre-T-94 rule again -- reopen the decision in a new CRD before changing this check",
    );
    const stops = says(merge, ["tell the user and stop"]);
    const notPast = says(merge, ["do not force push `main` to get past it", "force pushes nothing by itself", "do not force push", "never force push"]);
    check(
      `step 17's merge still stops on a failed fast-forward (${stops.length}) and does not force its way past it (${notPast.length})`,
      stops.length > 0 && notPast.length > 0,
      `a failed fast-forward has to end the step. The rule got wider, not softer: the merge may not reach for a force push to get past a moved \`main\`, and the approval CRD 0024 added is for a push the user asked for, not for tidying up a merge. merge paragraph: ${merge}`,
    );
  }

  // Spot 2, the push of `main`: the old absolute is gone, and the paragraph is
  // still force-push-free by default and still names both commands.
  {
    const old = "on `main` are never part of this step";
    const seen = counts(s17raw, old);
    check(
      `step 17 no longer scopes the push's force-push rule to \`main\` alone through \`${old}\` (${shown(seen)})`,
      seen.flatAny === 0,
      "T-94 DoD item 2 required this wording gone: it left a force push of a work branch to the ordinary push yes, named by no rule at all, which is the step the security review walked",
    );
    const named = ["`git push --force`", "`--force-with-lease`"].filter((command) => flat(push).includes(command));
    const byDefault = says(push, ["force pushes nothing", "not part of it", "never part of this step", "nothing by default"]);
    check(
      `step 17's push of \`main\` still names both force-push commands (${named.length} of 2) and is force-push-free by default (${byDefault.length})`,
      named.length === 2 && byDefault.length > 0,
      `the default has to stay off, with the user's approval as the only way in. A paragraph that names neither command cannot be read as forbidding either. push paragraph: ${push}`,
    );
  }

  // The reason the two pinned strings above are what they are: these five words
  // are legitimately in the file, so a pin on "mentions a force push" would be
  // red today, against a file that is correct. This check is the trap written
  // down where the next person editing this case will read it.
  const naive = ["force push", "--force", "--force-with-lease", "whatever the guard allows"];
  const missing = naive.filter((word) => !s17.includes(word));
  check(
    `step 17 legitimately contains all ${naive.length} words a pin on "mentions a force push" would use`,
    missing.length === 0,
    `missing: ${missing.join(", ")} -- if step 17 no longer says these, the prohibition itself was weakened`,
  );
}

// ------------------------- the deletion left the stricter rule behind, not silence

{
  const rulesRaw = section(text, "Hard rules");
  const rules = flat(rulesRaw);
  // Spot 3, the hard rules. The old sentence said no yes at all covers a force
  // push of `main`. Its successor is not silence and it is not a loosening of
  // the bar for the ORDINARY yes: the ordinary push yes still does not reach a
  // force push -- that needs a yes of its own. This is the half that keeps the
  // two grant pins above meaningful, so it is pinned here and not left to the
  // wider rule's own case.
  {
    const old = "No yes covers a force push of `main`";
    const seen = counts(rulesRaw, old);
    check(
      `the Hard rules no longer state the pre-T-94 absolute \`${old}\` (${shown(seen)})`,
      seen.flatAny === 0,
      "the user was asked twice and answered `main is ok if user approve` (CRD 0024 decision 1), so this sentence is the superseded rule. It going missing is the change the user asked for; it coming back is a decision that needs a new CRD, and this check changes in the same commit",
    );
    const ownYes = says(rules, ["a yes of its own", "its own yes", "a separate yes", "on top of that", "a yes of its very own"]);
    check(
      `the Hard rules keep a force push outside the ordinary push yes: it needs one of its own (${ownYes.length} wording(s))`,
      ownYes.length > 0,
      `without this the widened rule collapses back into the ordinary "ask before every push" bullet, and one yes for a push becomes a yes for rewriting the branch -- which is the reading the two grant pins above exist to stop. Hard rules: ${rules}`,
    );
  }
  check(
    "the Hard rules point at step 17 for the force push, so the two places cannot drift apart again",
    rules.includes("(step 17)"),
    rules,
  );
}

// -------------------------------------------------------------- self-tests
//
// A pin is only a pin if the thing it guards can turn it red. Every mutant here
// is a string in memory: nothing is written, and the repository is never
// touched. The first two put each wording back ACROSS a line break, which is
// how a comeback most plausibly arrives in a file that wraps at 80 columns.
// The third is the one that earns this case its shape: a sentence that quotes
// both old rules in order to forbid them has to stay GREEN.
//
// Every self-test below measures a DELTA against the file as it stands, never
// an absolute count, and that is a correction this case earned rather than a
// precaution. Written with absolute counts, three of these checks went red the
// first time the third mutant was run against a file that already carried one
// honest quoted mention: with that mention in place the file starts at one
// quote and one per-line hit, so `quotes === 1` and `perLine === 0` stopped
// being true of a file that was perfectly correct.
// A self-test that goes red the day the file legitimately mentions the old rule
// is the same false red this case exists to avoid, one level up -- and the
// person meeting it would have deleted the self-test to get their commit green.

selfTest("mutant 1: the Hard rules permission put back across a line break is caught", () => {
  const mutant = mutate(
    text,
    "publishing a package. Push `main` or a tag only when the user has just said",
    "publishing a package. Push `main`, a tag, or\n  with force only when the user has just said",
  );
  const added = grants(mutant, HARD_RULES_GRANT).length - grants(text, HARD_RULES_GRANT).length;
  check(
    `mutant 1: the Hard rules permission put back across a line break is caught (${added} new grant(s))`,
    added === 1,
    "the detector missed the grant this case exists to catch",
  );
  check(
    "mutant 1: a per-line search would have missed it, so the flattening is doing the work",
    perLine(mutant, HARD_RULES_GRANT) === perLine(text, HARD_RULES_GRANT),
    `per line ${perLine(text, HARD_RULES_GRANT)} before, ${perLine(mutant, HARD_RULES_GRANT)} after -- the mutant no longer wraps the wording, so it stopped testing the wrap`,
  );
});

selfTest("mutant 2: step 16's guard-trusts-you permission put back across a line break is caught", () => {
  const mutant = mutate(
    text,
    "The guard does not do the asking for you: the ask\n    is the rule.",
    "You are the root session, so the guard trusts you for any branch, any tag, and even a\n    force push -- but the ask is still the rule.",
  );
  const added = grants(mutant, STEP_16_GRANT).length - grants(text, STEP_16_GRANT).length;
  check(
    `mutant 2: step 16's guard-trusts-you permission put back across a line break is caught (${added} new grant(s))`,
    added === 1,
    "the detector missed the grant this case exists to catch",
  );
  check(
    "mutant 2: a per-line search would have missed it too",
    perLine(mutant, STEP_16_GRANT) === perLine(text, STEP_16_GRANT),
    `per line ${perLine(text, STEP_16_GRANT)} before, ${perLine(mutant, STEP_16_GRANT)} after`,
  );
});

selfTest("mutant 3: a sentence quoting the two deleted wordings in order to forbid them stays green", () => {
  // Two honest sentences: they name both deleted wordings in order to forbid
  // them, one of them broken over a line the way the file's own prose is. A
  // count-only pin goes red on both; this case must not.
  const mutant = `${text}
- Never write "or with force" in the **Hard rules** push bullet again: PRD B8
  deleted that half-sentence, and step 17 already forbids the force push.
- Step 16 never says "and even a force
  push" again either.
`;
  for (const phrase of [HARD_RULES_GRANT, STEP_16_GRANT]) {
    const newGrants = grants(mutant, phrase).length - grants(text, phrase).length;
    const newQuotes = quotes(mutant, phrase).length - quotes(text, phrase).length;
    check(
      `mutant 3: a sentence quoting \`${phrase}\` in order to forbid it stays green (${newGrants} new grant(s), ${newQuotes} new quoted mention(s))`,
      newGrants === 0 && newQuotes === 1,
      "a false red here is worse than a missing pin: the next person deletes this case to get their commit green",
    );
  }
});

done();
