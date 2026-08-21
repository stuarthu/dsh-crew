// T-65 DoD items 17, 18 and 19 (PRD M1 DoD item 5, the "the old shape must be
// gone" half).
// Proves the multi-round doc-review wording of `roles/pm.md` is gone in both
// places it lived -- `same round rules` and `on every landing` -- while the one
// sentence that fixes the ORDER rather than the number of rounds, `No code
// starts before the doc review passes.`, is still there exactly once.
//
// The three live in one case because they are three directions of one edit.
// A1b cancelled multiple rounds of the doc review, so the two old phrases had to
// go; it did not cancel the gate that the design documents pass before an
// engineer writes a line. Removing that gate by accident, while removing the
// two phrases on purpose, is the most likely way this edit goes wrong, and a
// case that only counted the two absences would report a clean pass on it.
//
// ------------------------------------------------------ method, and why it is this
//
// 1. EVERY count here is taken on the FLATTENED file, and that is not a habit,
//    it is the only correct way to read an ABSENT pin. For a string that must
//    NOT be there, the flattened count and the per-line count are both `0`
//    today, and two zeros agreeing proves nothing: the day the sentence comes
//    back it can come back wrapped across two lines, and the per-line count
//    stays `0` while the sentence is plainly in the file. So an ABSENT pin can
//    only be judged after flattening (`docs/qa/gaps.md` item 21, the note added
//    on 2026-08-22 for exactly this case). The per-line number is still printed
//    beside the flattened one, because a reader comparing the two is how the
//    wrap gets noticed at all -- but it is never what the assertion is on.
//
// 2. The prose of `roles/pm.md` wraps at 80 columns and the file is at 1900
//    lines, right against the PRD's hard ceiling, so the next edit to it may
//    re-wrap any paragraph. That is a real risk for the PRESENT pin too, in the
//    other direction: a per-line search for the required sentence would go red
//    on a file whose wording is perfectly correct and only wrapped differently.
//    A false red and a false green come from the same mistake here. Both
//    self-tests below prove the matching used survives a line break.
//
// 3. `same round rules` is counted case-insensitively, because the two places it
//    lived wrote it capitalised (`Same round rules as a code review: ...` in
//    step 8, `Same round rules.` in step 15) and a comeback could be either.
//    `on every landing` is counted case-insensitively for the same reason: the
//    sentence it came from, `Doc review runs on every landing, not only at the
//    two phase points.`, could return with the phrase at the start of a
//    sentence. The required sentence is counted case-sensitively, because it is
//    a quoted sentence with a capital `N` and the DoD quotes it that way.
//
// 4. Mention against rule (`docs/qa/gaps.md` item 26). Before writing this file
//    the real counts were measured: `same round rules` and `on every landing`
//    are at 0 hits today, flattened and per line, so there was no hit whose
//    context had to be read and no mention-against-rule call to make. The
//    criterion written in here is therefore the DoD's own: exactly 0, with no
//    exemption for an honest mention such as "this used to say same round
//    rules". That is deliberate. Item 26 records that a machine cannot tell a
//    mention from a rule except inside one sentence, and the DoD grids 17 and 19
//    give a hard 0 with no carve-out. If a later change really needs to mention
//    the old wording, the fix is to change this case in the same commit
//    (`ADR 0018`), naming the mention, and never to widen the match so any hit
//    is waved through.
//
// 5. Every count is over the WHOLE file, not one step. The old wording sat in
//    two different steps (8 and 15) and the sentence about the order sits in
//    step 8 today, but nothing in the DoD fixes where any of them may be, and a
//    per-step count would pass on a copy that moved into another step. The step
//    the required sentence sits in is printed into the check name instead of
//    being asserted, so a reader sees where it is without this case going red
//    over a move the DoD allows.

import { check, done, flat, pm } from "../lib/qa.mjs";

const BANNED_ROUNDS = "same round rules";
const BANNED_LANDING = "on every landing";
const REQUIRED = "No code starts before the doc review passes";

const text = pm();
const flatAll = flat(text);

/** How many times `needle` appears in a string. */
const copies = (haystack, needle) => haystack.split(needle).length - 1;

/** Flattened count, the only count anything is asserted on. */
const flatHits = (needle, fold) =>
  fold ? copies(flatAll.toLowerCase(), needle.toLowerCase()) : copies(flatAll, needle);

/** Per-line count, printed for comparison only. */
const lineHits = (needle, fold) =>
  text.split("\n").filter((line) =>
    fold ? line.toLowerCase().includes(needle.toLowerCase()) : line.includes(needle),
  ).length;

/** The same words with a line break and indentation before the last one. */
const wrapped = (needle) => {
  const words = needle.split(" ");
  return `${words.slice(0, -1).join(" ")}\n   ${words[words.length - 1]}`;
};

/** Which numbered step of the prompt a character offset falls in, or null. */
const stepAt = (offset) => {
  let found = null;
  for (const match of text.matchAll(/^(\d+)\. \*\*/gm)) {
    if (match.index > offset) break;
    found = match[1];
  }
  return found;
};

// ---------------------------------------------------------------- the premise
// Everything below reads one file. A `pm()` that came back short or without the
// numbered steps would make each count 0 and each ABSENT check pass on nothing,
// so the file's own shape is asserted first.
check(
  "roles/pm.md was read whole: over 40000 characters",
  text.length > 40000,
  `read ${text.length} character(s)`,
);
check(
  "roles/pm.md still has numbered steps, so the counts are over the real prompt",
  [...text.matchAll(/^\d+\. \*\*/gm)].length >= 15,
  `found ${[...text.matchAll(/^\d+\. \*\*/gm)].length} numbered step(s)`,
);

// ------------------------------------------------- self-test: absent pins can fail
// The two ABSENT checks are only worth anything if the matching they use would
// really catch the banned phrase coming back wrapped across two lines. Each
// sample below is the banned phrase with a line break before its last word: the
// flattened search must find it, and the per-line search must miss it. The
// second half is the important one -- it is the proof that a per-line pin here
// would have been green from the day it was written.
for (const [what, needle] of [["same round rules", BANNED_ROUNDS], ["on every landing", BANNED_LANDING]]) {
  const sample = `... ${wrapped(needle)} ...`;
  check(
    `flattening is what catches "${what}" when it wraps across lines, and a per-line search does not`,
    copies(flat(sample).toLowerCase(), needle.toLowerCase()) === 1
      && sample.split("\n").filter((line) => line.toLowerCase().includes(needle.toLowerCase())).length === 0,
    `flattened ${copies(flat(sample).toLowerCase(), needle.toLowerCase())}, per line ${sample.split("\n").filter((line) => line.toLowerCase().includes(needle.toLowerCase())).length}`,
  );
}

// -------------------------------------- self-test: the present pin cannot go false red
// The other direction of the same trap. `roles/pm.md` wraps at 80 columns and is
// at its line budget, so the required sentence may be re-wrapped by any later
// edit. A per-line pin would go red on a file that is entirely correct; this one
// must not.
{
  const sample = `... ${wrapped(REQUIRED)} ...`;
  check(
    "the required sentence is still found when it wraps across lines, so a re-wrap cannot fake a red",
    copies(flat(sample), REQUIRED) === 1
      && sample.split("\n").filter((line) => line.includes(REQUIRED)).length === 0,
    `flattened ${copies(flat(sample), REQUIRED)}, per line ${sample.split("\n").filter((line) => line.includes(REQUIRED)).length}`,
  );
}

// ------------------------------------------------------- T-65 DoD item 17: 0 hits
// Two places wrote `Same round rules` before this job -- step 8 and step 15 --
// and both had to change to the one-round shape. Either one left behind keeps
// the file contradicting its own Hard rules, only in a different place.
check(
  `roles/pm.md no longer says "${BANNED_ROUNDS}" in any case (flattened: ${flatHits(BANNED_ROUNDS, true)}, per line: ${lineHits(BANNED_ROUNDS, true)}, was 2 before this job)`,
  flatHits(BANNED_ROUNDS, true) === 0,
  `the multi-round wording is back ${flatHits(BANNED_ROUNDS, true)} time(s) in the flattened file; the per-line count ${lineHits(BANNED_ROUNDS, true)} proves nothing on its own`,
);

// ------------------------------------------------------- T-65 DoD item 19: 0 hits
// `Doc review runs on every landing, not only at the two phase points.` was the
// step 10 sentence describing the old shape. It fights A1b head on, so the
// phrase has to be gone, not merely annotated.
check(
  `roles/pm.md no longer says "${BANNED_LANDING}" in any case (flattened: ${flatHits(BANNED_LANDING, true)}, per line: ${lineHits(BANNED_LANDING, true)}, was 1 before this job)`,
  flatHits(BANNED_LANDING, true) === 0,
  `the old doc-review shape is back ${flatHits(BANNED_LANDING, true)} time(s) in the flattened file; the per-line count ${lineHits(BANNED_LANDING, true)} proves nothing on its own`,
);

// ---------------------------------------------------- T-65 DoD item 18: exactly 1
// The insurance grid. This sentence is about ORDER, not about how many rounds
// there are: the design documents pass before an engineer writes a line. A1b
// cancelled rounds and left the gate alone, so deleting this sentence while
// deleting the two phrases above would let an engineer start on a design nobody
// reviewed -- and nothing else in this case would notice.
{
  const offset = flatAll.indexOf(REQUIRED);
  const sourceOffset = text.indexOf(REQUIRED);
  const where = sourceOffset === -1 ? "not found" : `step ${stepAt(sourceOffset) ?? "?"}`;
  check(
    `roles/pm.md still says "${REQUIRED}" exactly once (flattened: ${flatHits(REQUIRED, false)}, per line: ${lineHits(REQUIRED, false)}, ${where})`,
    flatHits(REQUIRED, false) === 1,
    flatHits(REQUIRED, false) === 0
      ? "the order gate is gone: an engineer may now start before the design documents pass a review"
      : `the sentence appears ${flatHits(REQUIRED, false)} times, so two places now state the same gate and can drift apart`,
  );
  // A sentence inside a ``` block is an example the PM reads, not an
  // instruction the PM follows, so a copy moved into one would satisfy the count
  // above while the real gate was gone. An even number of fence markers before
  // the sentence means it is outside every block.
  const fencesBefore = sourceOffset === -1 ? -1 : text.slice(0, sourceOffset).split("```").length - 1;
  check(
    `the order gate is a live sentence of the prompt, not an example inside a fenced block (${fencesBefore} fence marker(s) before it)`,
    offset !== -1 && fencesBefore >= 0 && fencesBefore % 2 === 0,
    "the sentence sits inside a fenced code block, where it is an example rather than an instruction",
  );
}

done();
