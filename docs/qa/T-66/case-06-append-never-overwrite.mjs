// T-66 DoD items 8 and 9 (PRD M1 DoD item 9, Part B item B12; `CRD 0023`
// decision one): `roles/pm.md` writes down the whole of "append, never
// overwrite" — all four of its parts — AND keeps the line that says a *change*
// to scope, a DoD item or the milestone list still needs the user's own yes.
//
// The four parts, from T-66 DoD item 8:
//   1. the confirmed words are never deleted;
//   2. the PM writes a CRD;
//   3. the correction goes beside the confirmed words, carrying its date;
//   4. one fixed heading lists every correction (T-66 chose the English
//      `Corrections`), so the user can read the set at a glance.
//
// And the boundary, from T-66 DoD item 9: append-never-overwrite covers a
// **correction** — a check nothing could pass, two checks that contradict each
// other. It does **not** cover a **change** to the scope, a DoD item or the
// milestone list; that still stops and waits for the user. Without that line the
// rule is a back door around the user's consent: every scope cut could be filed
// as a "correction" and appended without anyone being asked. So this case wants
// two separate rules, each with its own action, not one blurred paragraph.
//
// Why it is written this way:
//
//   * The two rules are found by what they say, not by their position in the
//     list, so re-ordering the Hard rules does not turn this red — but they are
//     read only inside `## Hard rules`, because that is where the PM's binding
//     rules live. The same shape is also written as prose in the
//     `### The documents that judge the work` section; that copy is deliberately
//     NOT what is judged here, so the normative list cannot be emptied while a
//     prose retelling keeps this green.
//   * Every match runs on flattened text (`flat()`), never line by line. This
//     repository has gone red eight times over a pinned string that an 80-column
//     line wrap had split in two (`docs/qa/gaps.md` item 21). The `Corrections`
//     count is printed both ways, flattened and per line, so a future reader can
//     see at once whether the string is wrapping.
//   * Each of the four parts is its own check, and each failure line says which
//     part of four is missing. One check covering all four would report "B12 is
//     broken" without saying what to write.
//   * Meaning, not a proxy. "The file contains the word CRD" would pass on the
//     six other bullets that mention a CRD, so part 2 asks for a writing verb
//     next to `CRD` inside this rule. The literal `Corrections` is asserted as
//     itself, because T-66 DoD item 8's own check is that the English heading can
//     be found in the flattened file.
//
// What this case does NOT prove — read this before quoting it:
//
//   It proves the four parts and the boundary are WRITTEN IN THE PROMPT. It says
//   nothing about whether any PM ever obeyed them. "No confirmed word was ever
//   deleted" cannot be checked by any case at all: it would need today's file
//   compared against the version the user read at the moment they confirmed it,
//   and that version exists only in git history, which one squash or one rewrite
//   removes. That gap belongs in `docs/qa/gaps.md`, not in a green tick here.
//
// Reads one file: `roles/pm.md`. Writes nothing.

import { pm, section, flat, check, done } from "../lib/qa.mjs";

const HEADING = "Hard rules";
const FIXED_HEADING = "`Corrections`";

const text = pm();

// ------------------------------------------------------------- the section

let hardRules = null;
let sliceError = "";
try {
  hardRules = section(text, HEADING);
} catch (error) {
  sliceError = String(error?.message ?? error);
}
check(
  `roles/pm.md still has a "## ${HEADING}" section`,
  hardRules !== null,
  `${sliceError} — the PM's binding rules moved or were renamed, so nothing below could be judged`,
);
if (hardRules === null) done();

// The bullets of that section. A bullet is a `- ` at the start of a line; its
// continuation lines belong to it, which is why the split looks ahead instead of
// splitting on every newline.
const bullets = hardRules.split(/\n(?=- )/).slice(1);
// `plain` drops the markdown emphasis so a regex does not have to know where the
// bold stars fall; `raw` keeps backticks, because the fixed heading is asserted
// as the exact string the document uses.
const raw = bullets.map((bullet) => flat(bullet));
const plain = raw.map((bullet) => bullet.replace(/\*+/g, ""));

console.log(`      ## ${HEADING} holds ${bullets.length} bullet(s)`);

// -------------------------------------------- rule one: append, never overwrite

const appendHits = plain
  .map((bullet, index) => ({ bullet, index }))
  .filter(({ bullet }) => /append,\s*never overwrite/i.test(bullet));

check(
  "exactly one Hard rule carries `append, never overwrite`",
  appendHits.length === 1,
  appendHits.length === 0
    ? "no Hard rule says it: B12's whole shape is gone from the rules list, so the PM has no written "
      + "instruction on what to do with a standard it must correct"
    : `${appendHits.length} bullets say it (indexes ${appendHits.map(({ index }) => index).join(", ")}) — `
      + "one rule in two places drifts apart; a human has to decide which is the real one",
);
if (appendHits.length !== 1) done();

const appendIndex = appendHits[0].index;
const appendRule = plain[appendIndex];
console.log(`      the append rule is bullet ${appendIndex}, ${appendRule.length} characters flattened`);

check(
  "B12 part 1 of 4 — the confirmed words are never deleted or rewritten",
  /\bconfirmed\b/i.test(appendRule)
    && /\b(never|no|not)\b[^.]*\b(deleted|rewritten|removed)\b/i.test(appendRule),
  "the append rule does not say that the CONFIRMED words are never deleted or rewritten. "
    + "Part 1 is the floor the other three stand on: without it a correction may overwrite what the "
    + `user read. The rule says: ${JSON.stringify(appendRule)}`,
);

check(
  "B12 part 2 of 4 — the PM writes a CRD for the correction",
  /\b(write|writes|writing|record|records)\b[^.]{0,60}\bCRD\b/i.test(appendRule),
  "the append rule names no act of WRITING a CRD (a bare mention of the word `CRD` is not enough, "
    + "and is not what is asked here). Part 2 is what leaves a trace of the correction outside the "
    + `document it corrected. The rule says: ${JSON.stringify(appendRule)}`,
);

check(
  "B12 part 3 of 4 — the correction goes beside the confirmed words, with its date",
  /\bbeside\b[^.]{0,160}\bdate\b/i.test(appendRule) || /\bdate\b[^.]{0,160}\bbeside\b/i.test(appendRule),
  "the append rule does not put the correction BESIDE the confirmed words WITH ITS DATE in one "
    + "breath. Part 3 is what makes the two readable together; \"beside\" without a date, or a date "
    + `without \"beside\", is half the rule. The rule says: ${JSON.stringify(appendRule)}`,
);

check(
  "B12 part 4 of 4 — one fixed heading lists every correction",
  /\bfixed heading\b/i.test(appendRule),
  "the append rule does not ask for a FIXED HEADING. Part 4 is the only part the user benefits from "
    + "directly: corrections scattered through a document cannot be read at a glance, so the user "
    + `cannot interrupt. The rule says: ${JSON.stringify(appendRule)}`,
);

check(
  `B12 part 4 of 4, second half — that heading is named: ${FIXED_HEADING}`,
  raw[appendIndex].includes(FIXED_HEADING),
  `the append rule asks for a fixed heading but does not say which one. "Fixed" only means `
    + "something if the word is written down; two documents each inventing their own heading is the "
    + `state the rule exists to stop. Expected the literal ${FIXED_HEADING} inside the rule.`,
);

// T-66 DoD item 8's own check, run as the DoD writes it: the English heading can
// be found in the flattened file. Counted per line as well, because equal
// numbers are the evidence that no line wrap is hiding a copy — the habit
// `docs/qa/gaps.md` item 21 asks for.
const flatCopies = flat(text).split(FIXED_HEADING).length - 1;
const lineCopies = text
  .split("\n")
  .reduce((total, line) => total + line.split(FIXED_HEADING).length - 1, 0);

console.log(`      ${FIXED_HEADING} in roles/pm.md: ${flatCopies} flattened, ${lineCopies} line by line`);

check(
  `${FIXED_HEADING} can be found in the flattened roles/pm.md`,
  flatCopies >= 1,
  "T-66 DoD item 8 checks exactly this. Zero copies means the fixed heading has no name anywhere in "
    + "the prompt, whatever the rule says about having one",
);

check(
  `the ${FIXED_HEADING} count is the same flattened and line by line`,
  flatCopies === lineCopies,
  `${flatCopies} flattened against ${lineCopies} per line: a copy is split across a line wrap, so `
    + "any line-by-line pin on this string is lying. Match it on flattened text",
);

check(
  "CRD 0023's rejected option stays rejected — the job does not stop, and nothing changes silently",
  /\b(never|do not|does not|no)\b[^.]{0,40}\bstop\b/i.test(appendRule)
    && /\b(silent|silently|quiet|quietly)\b/i.test(appendRule),
  "the append rule no longer says both \"do not stop the job\" and \"do not change it silently\". "
    + "CRD 0023 decision one rejected \"stop and ask every time\" by name, because one broken check "
    + "then blocks every task under it — the very thing requirement A1a exists to remove. Losing this "
    + `sentence lets the rule slide back into the rejected option. The rule says: ${JSON.stringify(appendRule)}`,
);

// ------------------------- rule two: a change still needs the user's own yes
//
// This is the half that keeps the rule from becoming a way around consent. It
// must be a rule of its own — a different bullet — because the two situations
// have opposite actions: append and carry on, against stop and wait.

const changeHits = plain
  .map((bullet, index) => ({ bullet, index }))
  .filter(({ bullet, index }) =>
    index !== appendIndex
    && /\bcorrection\b/i.test(bullet)
    && /\bchange\b/i.test(bullet)
    && /\b(yes|consent)\b/i.test(bullet));

check(
  "a separate Hard rule keeps a correction and a change apart",
  changeHits.length >= 1,
  "no Hard rule other than the append rule tells a correction from a change and asks for the user's "
    + "yes. This is T-66 DoD item 9, and it is the back door: with the two situations blurred into "
    + "one, a cut to the scope can be filed as a \"correction\", appended with a date, and never put "
    + "to the user at all",
);
if (changeHits.length === 0) done();

const changeIndex = changeHits[0].index;
const changeRule = plain[changeIndex];
console.log(`      the change rule is bullet ${changeIndex}, ${changeRule.length} characters flattened`);

check(
  "it says in so many words that a correction is not a change",
  /\bcorrection\b[^.]{0,40}\b(is not|is never)\b[^.]{0,20}\bchange\b/i.test(changeRule),
  "the rule mentions both words but never states that the one is not the other. The whole point is "
    + `that the reader can tell which of the two they are holding. The rule says: ${JSON.stringify(changeRule)}`,
);

const NOUNS = [
  ["scope", /\bscope\b/i],
  ["a DoD item", /\bDoD item\b/i],
  ["the milestone list", /\bmilestone list\b/i],
];
const missing = NOUNS.filter(([, pattern]) => !pattern.test(changeRule)).map(([name]) => name);

check(
  "it names all three things a change may move: scope, a DoD item, the milestone list",
  missing.length === 0,
  `missing: ${missing.join(", ")}. Anything left out of this list is a thing the PM may move without `
    + `asking, which is exactly what T-66 DoD item 9 forbids. The rule says: ${JSON.stringify(changeRule)}`,
);

check(
  "the change rule carries its own action: stop, and wait for the user's own yes",
  /\bstop\b/i.test(changeRule) && /\bwait\b[^.]{0,80}\byes\b/i.test(changeRule),
  "the rule states the difference but gives no action for the change side, so the two situations do "
    + "not in fact have different consequences. T-66 DoD item 9 asks for one action each. The rule "
    + `says: ${JSON.stringify(changeRule)}`,
);

check(
  "and it settles the doubtful case: when you cannot tell, it is a change",
  /\bcannot tell\b[^.]{0,120}\bit is a change\b/i.test(changeRule)
    || /\bin doubt\b[^.]{0,120}\bit is a change\b/i.test(changeRule),
  "the rule does not say what to do when the PM cannot tell a correction from a change, so the split "
    + "leaves the PM judging which bucket it falls in — and CRD 0023 decision one rejected the "
    + "\"split by kind\" option for exactly that reason: the audit found nine unapproved edits, each "
    + `defensible on its own. The safe default has to be written down. The rule says: ${JSON.stringify(changeRule)}`,
);

done();
