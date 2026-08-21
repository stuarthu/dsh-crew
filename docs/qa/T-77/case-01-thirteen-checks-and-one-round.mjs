// T-77 (checklist C-48) — DoD items 12 and 13 of `## T-77` in docs/design/tasks.md.
//
// What it proves, in one line: `roles/doc-reviewer.md` no longer carries the old
// multi-round section `## Later rounds`, its `## What you check, in this order`
// section still holds EXACTLY thirteen numbered checks, and the prose keeps the
// two ideas apart — all thirteen checks still run, and what shrank is the set of
// documents each one lands on.
//
// WHY THIS CASE EXISTS AT ALL, AND IT IS THE WHOLE POINT OF ITEM 13. A1b says a
// doc review runs once per milestone and looks at the changed part only. The
// cheap way to implement "the changed part only" is to run fewer checks. That is
// a different thing, and mixing the two makes the doc review quietly weaker with
// nothing going red: "only the changed part" narrows the SCOPE (which documents),
// never the LIST OF CHECKS (which questions). So this case does not stop at
// counting to thirteen. It also demands that the file says both things, in
// sentences of their own, in one passage.
//
// PINNING STYLE, PER PIN:
//
//   * `Later rounds` is an ABSENT pin, so it is judged FLATTENED and
//     CASE-INSENSITIVE, and all four numbers (flat/per-line x sensitive/
//     insensitive) are printed. `docs/qa/gaps.md` item 21 second note: for an
//     ABSENT pin, "the flat count equals the line count" only means 0 equals 0
//     and buys a line-based scan nothing — the sentence can come back folded
//     across a line break and a line scan still reads 0. Item 30: a lower-case
//     copy of a banned string walks past the default `grep`. Check 2 is a
//     self-test that feeds the matcher a folded, re-cased sample and demands a
//     hit, so a later rewrite of this file back to a line-based or
//     case-sensitive scan turns the case red instead of quietly weakening it.
//
//   * THE BANNED STRING IS PLURAL, AND THAT IS DELIBERATE. The file still says
//     "A later round may reach you as a message" — SINGULAR — and that sentence
//     is part of the new shape, not a leftover. DoD item 12 bans `Later rounds`,
//     the old section heading. A pin written as /later round/i would be red for
//     ever on a correct file, which is `docs/qa/gaps.md` item 31's failure mode
//     (an anchor that never existed, red for ever, and the person who meets it
//     widens the assertion). Anchors verified against the source before this case
//     was written, as items 27 and 31 require.
//
//   * The count of numbered checks is judged BOTH WAYS: thirteen lines are found,
//     AND the numbers they claim are exactly 1..13 with nothing missing, nothing
//     repeated and nothing out of order. Counting alone would pass a list that
//     went 1..12 plus a second `12.`.
//
// WHY 13 IS HARD-CODED, AND WHAT TO DO THE DAY IT IS WRONG. DoD item 13 says the
// number is "still exactly 13", so the case can only pin 13. A fourteenth check
// added on purpose one day makes this case red, and that red is a FALSE one. The
// fix then is: change the DoD cell and change check 5, 6, 7 and 14 here, in the
// same commit. Do NOT loosen the assertion to `>= 13` and do NOT delete the case
// — that is exactly the pressure `docs/qa/gaps.md` item 33 describes, and giving
// in to it is how a rule gets retired by accident.
//
// CHECK 14 CLOSES THE LOOP BETWEEN THE TWO HALVES. The prose promises a number
// in words ("all thirteen"), and the list holds a number of items. Check 14
// asserts they are the same number, so a file that grows a check without
// updating the sentence — or updates the sentence without the check — goes red.
//
// CHECK 13 IS A DELIBERATELY BRITTLE PROSE PIN, for the same reason DoD item 10's
// `` `scope: `` pin is one. It demands that "all thirteen checks run" and "each
// check lands only on the changed documents" are carried by sentences of their
// own. A rewrite that welds them into one sentence would not be WRONG, but it
// buries the half this whole DoD item exists to protect. If that red ever shows
// up, read the passage first and take it to the PM; do not widen it alone.
//
// Read-only: nothing here writes anything, and nothing runs a project command.

import { check, done, flat, repoFile, section } from "../lib/qa.mjs";

const FILE = "roles/doc-reviewer.md";
const HEADING = "What you check, in this order";
const EXPECTED_CHECKS = 13;

const text = repoFile(FILE);
const lines = text.split("\n");
const flatText = flat(text);

// ---------------------------------------------------------------- group 0
// Guards against a vacuous pass. Every ABSENT pin below reads 0 on an empty
// file, so the file has to be shown to still be a real prompt first.

const headings = lines.filter((line) => /^##\s+\S/.test(line));
check(
  `guard: ${FILE} is still a real prompt (${lines.length} line(s), ${headings.length} "## " heading(s))`,
  lines.length >= 200 && headings.length >= 5,
  `an ABSENT pin reads 0 on an empty file, so this has to hold before any of it means anything`,
);

// ------------------------------------------------- group 1: `Later rounds`

const BANNED = "Later rounds";

/** Count copies of `needle` in `haystack`, optionally ignoring case. */
const count = (haystack, needle, insensitive) => {
  const hay = insensitive ? haystack.toLowerCase() : haystack;
  const pin = insensitive ? needle.toLowerCase() : needle;
  return hay.split(pin).length - 1;
};

const flatSensitive = count(flatText, BANNED, false);
const flatInsensitive = count(flatText, BANNED, true);
const lineSensitive = lines.filter((line) => line.includes(BANNED)).length;
const lineInsensitive = lines.filter((line) => line.toLowerCase().includes(BANNED.toLowerCase())).length;

// The verdict is the flattened, case-insensitive number. The other three are in
// the check name so the person reading the output sees the facts, not advice.
check(
  `1. \`${BANNED}\` is gone from ${FILE} (flat+ci ${flatInsensitive}, flat+cs ${flatSensitive}, line+ci ${lineInsensitive}, line+cs ${lineSensitive}; the verdict is flat+ci)`,
  flatInsensitive === 0,
  `the old multi-round section heading is back, or its wording is`,
);

// Self-test: the matcher must catch the banned string when it is folded across a
// line break AND re-cased. Without this, checking 1 could be passing by luck.
const SAMPLE = "## later\nROUNDS\n\nA later round may reach you as a message.\n";
const sampleFlat = count(flat(SAMPLE), BANNED, true);
const sampleLine = SAMPLE.split("\n").filter((line) => line.toLowerCase().includes(BANNED.toLowerCase())).length;
check(
  `2. self-test: the matcher catches a folded, re-cased \`${BANNED}\` (flat+ci ${sampleFlat}, line+ci ${sampleLine} on the sample)`,
  sampleFlat === 1 && sampleLine === 0,
  `flattening is what makes check 1 able to fail; a line-based or case-sensitive scan would read 0 on this sample and call it clean`,
);

const bannedHeadings = headings.filter((line) => /later\s+rounds/i.test(line));
check(
  `3. no "## " heading in ${FILE} is a later-rounds heading (${bannedHeadings.length} found)`,
  bannedHeadings.length === 0,
  bannedHeadings.join(" | "),
);

// -------------------------------------- group 2: exactly thirteen checks

const checksSection = section(text, HEADING);
const NUMBERED = /^([0-9]+)\. \*\*(.*)$/;

// No fenced block may hide inside the section: a numbered line inside ``` is not
// a check, and counting one would inflate the total on a file that grew an example.
const fenceLines = checksSection.split("\n").filter((line) => line.startsWith("```")).length;
check(
  `4. the "${HEADING}" section has no fenced block to confuse the count (${fenceLines} fence line(s))`,
  fenceLines === 0,
  `a numbered line inside a code fence is an example, not a check; this case's counter cannot tell them apart, so the section must hold no fences`,
);

const numbered = checksSection.split("\n")
  .map((line) => NUMBERED.exec(line))
  .filter((match) => match !== null);
const claimed = numbered.map((match) => Number(match[1]));
const titles = numbered.map((match) => match[2].split("**")[0].trim());

check(
  `5. the "${HEADING}" section holds exactly ${EXPECTED_CHECKS} numbered checks (found ${numbered.length})`,
  numbered.length === EXPECTED_CHECKS,
  `claimed numbers: ${claimed.join(", ")}`,
);

// The other direction: every number from 1 to 13 is really there. Counting alone
// would pass a list that skipped 7 and repeated 12.
const missing = [];
for (let want = 1; want <= EXPECTED_CHECKS; want += 1) {
  if (!claimed.includes(want)) missing.push(want);
}
check(
  `6. each of checks 1..${EXPECTED_CHECKS} is present by number (${missing.length} missing)`,
  missing.length === 0,
  `missing: ${missing.join(", ")}`,
);

const inOrder = claimed.every((value, index) => value === index + 1);
check(
  `7. the numbers run 1..${EXPECTED_CHECKS} in order, none repeated (got ${claimed.join(",")})`,
  inOrder && claimed.length === EXPECTED_CHECKS,
  `a repeated or out-of-order number means one check was replaced by a copy of another`,
);

const emptyTitles = titles.filter((title) => title.length < 4);
check(
  `8. all ${numbered.length} numbered checks carry a bold title (${emptyTitles.length} empty or near-empty)`,
  emptyTitles.length === 0,
  `titles: ${titles.map((title, index) => `${index + 1}=${JSON.stringify(title)}`).join(" ")}`,
);

// The count must belong to that section and not to the file as a whole, or a
// numbered list somewhere else could be making up the difference.
const wholeFile = lines.filter((line) => NUMBERED.test(line)).length;
check(
  `9. all ${wholeFile} top-level numbered-bold lines of ${FILE} are inside that one section`,
  wholeFile === numbered.length,
  `${wholeFile} in the file, ${numbered.length} in the section — the count is not about the section any more`,
);

// ----------------------- group 3: scope narrowed, list of checks was not

// Paragraphs of the raw file, each flattened, each tagged with the "## " section
// it sits in. Item 13 asks for ONE passage that draws the distinction, so the two
// sentences have to be found together rather than anywhere in the file.
const paragraphs = [];
{
  let heading = "(before the first heading)";
  let buffer = [];
  const flush = () => {
    const raw = buffer.join("\n").trim();
    if (raw) paragraphs.push({ heading, flat: flat(raw) });
    buffer = [];
  };
  for (const line of lines) {
    if (/^##\s+\S/.test(line)) { flush(); heading = line.replace(/^#+\s*/, "").trim(); continue; }
    if (line.trim() === "") { flush(); continue; }
    buffer.push(line);
  }
  flush();
}

/** Split one flattened paragraph into sentences. */
const sentences = (paragraph) => paragraph.split(/(?<=[.!?])["'`*)\]]*\s+/).filter((one) => one.trim() !== "");

// "All thirteen numbered checks run, one by one, every round."
const ALL_RUN = /\ball\s+(thirteen|13|twelve|12|fourteen|14)\b[^.]{0,80}\bchecks?\b[^.]{0,80}\brun\b/i;
// "What shrinks is the set of documents each check lands on: the ones this
// milestone changed, and no others."
const LANDS_ON_CHANGED = /\beach\s+check\b[^.]{0,120}\blands?\b/i;
const CHANGED_DOCS = /\bthis\s+milestone\s+changed\b/i;
const SCOPE_NARROWS = /\bnarrows?\s+the\s+scope\b/i;
const CHECKS_NOT_NARROWED = /\b(never|not|no)\b[^.]{0,60}\bnarrows?\b[^.]{0,60}\bchecks?\b/i;
const CHECK_DROPPED = /\bcheck\b[^.]{0,60}\b(dropped|skipped|omitted|left\s+out|unanswered)\b/i;
const CHANGED_PART = /only\s+the\s+changed\s+part/i;

// The passage is the paragraph that claims all the checks run. Everything else
// in this group is judged inside that same paragraph, which is what "that
// passage must make it clear" means.
const passages = paragraphs.filter((paragraph) => ALL_RUN.test(paragraph.flat));
check(
  `10. one passage of ${FILE} says all the numbered checks still run (${passages.length} such passage(s))`,
  passages.length >= 1,
  `no paragraph matched ${ALL_RUN} — the promise that the list of checks did not shrink is not written down`,
);

const passage = passages[0];
const passageSentences = passage ? sentences(passage.flat) : [];
const runIndexes = passageSentences
  .map((one, index) => (ALL_RUN.test(one) ? index : -1))
  .filter((index) => index !== -1);
const landIndexes = passageSentences
  .map((one, index) => (LANDS_ON_CHANGED.test(one) && CHANGED_DOCS.test(one) ? index : -1))
  .filter((index) => index !== -1);

check(
  `11. the same passage says each check lands only on the documents this milestone changed (under "## ${passage?.heading ?? "?"}", sentence(s) ${landIndexes.join(",") || "none"})`,
  landIndexes.length >= 1,
  `the passage promises the checks all run but never says what DID shrink; that is the reading item 13 exists to prevent`,
);

// The distinction itself: the two ideas are carried by sentences of their own.
const runAlone = runIndexes.filter((index) => !landIndexes.includes(index));
const landAlone = landIndexes.filter((index) => !runIndexes.includes(index));
check(
  `12. the two ideas are not the same sentence (all-run sentence(s) ${runIndexes.join(",") || "none"}, lands-on sentence(s) ${landIndexes.join(",") || "none"})`,
  runAlone.length >= 1 && landAlone.length >= 1,
  `"all thirteen run" and "each lands only on the changed documents" must each stand in a sentence of their own; welded into one, the half that protects the list of checks is easy to read past`,
);

check(
  `13. the same passage separates the words: the scope narrows, the list of checks does not`,
  Boolean(passage) && SCOPE_NARROWS.test(passage.flat) && CHECKS_NOT_NARROWED.test(passage.flat),
  `scope-narrows ${passage ? SCOPE_NARROWS.test(passage.flat) : false}, checks-not-narrowed ${passage ? CHECKS_NOT_NARROWED.test(passage.flat) : false} in the passage under "## ${passage?.heading ?? "?"}"`,
);

// The number the prose promises has to be the number the list holds.
const WORDS = { twelve: 12, thirteen: 13, fourteen: 14, 12: 12, 13: 13, 14: 14 };
const promised = passage ? WORDS[(ALL_RUN.exec(passage.flat)?.[1] ?? "").toLowerCase()] : undefined;
check(
  `14. the number the prose promises (${promised ?? "none"}) is the number of checks in the list (${numbered.length})`,
  promised === numbered.length,
  `the sentence and the list disagree, so one of them was changed without the other`,
);

// The reverse ban: dropping a check must not be allowed as "only the changed part".
const forbidding = passageSentences.filter((one) => CHECK_DROPPED.test(one) && CHANGED_PART.test(one));
check(
  `15. the passage forbids dropping a check in the name of "only the changed part" (${forbidding.length} sentence(s))`,
  forbidding.length >= 1,
  `nothing in the passage says out loud that a check dropped for that reason is a check nobody ran; item 13 was written because the next doc reviewer will otherwise read the narrowing as licence to skip`,
);

console.log(`\nnote  ${FILE}: ${lines.length} lines, ${headings.length} sections, ${numbered.length} numbered checks; passage under "## ${passage?.heading ?? "?"}" with ${passageSentences.length} sentence(s)`);
console.log(`note  \`${BANNED}\` counts — flat+ci ${flatInsensitive}, flat+cs ${flatSensitive}, line+ci ${lineInsensitive}, line+cs ${lineSensitive}`);
console.log(`note  check titles: ${titles.map((title, index) => `${index + 1}. ${title}`).join(" | ")}`);

done();
