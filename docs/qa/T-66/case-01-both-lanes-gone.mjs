// T-66 (PRD M1 DoD item 9, requirement B5) — carried by T-64 DoD item 9,
// T-69 DoD item 5, T-77 DoD item 8 and T-80 DoD item 1.
// Proves the phrase `both lanes` is gone from all four files that held it:
// `roles/pm.md`, `principles.md`, `roles/doc-reviewer.md` and `CLAUDE.md`.
//
// Why the phrase had to go: the three named files each listed THREE lanes
// (`ask`, `quick`, `team`), so "in both lanes" and "(both lanes)" pointed at
// nothing a reader could resolve. B5 replaces every one of them with wording
// about small work and big work. A1d then removed the `quick` lane, which
// touches the same sentences a second time — so this case pins only the half
// that must be ABSENT, and never the replacement wording, which belongs to the
// cases of the file that owns it.
//
// Five things about the method here, each one the reason a check below exists.
//
// 1. FOUR FILES, FOUR CHECKS, AND EVERY MESSAGE NAMES ITS FILE.
//    B5 was a sweep across four files with four different owners (T-64, T-69,
//    T-77, T-80), working in four different task rows. One check over a
//    concatenation of the four would go red without saying whose file brought
//    the phrase back, which is the one fact the reader needs. So each file gets
//    its own named check, and one file left behind turns the run red on its own.
//
// 2. AN ABSENT PIN IS JUDGED ON THE FLATTENED TEXT, AND ONLY THERE.
//    The prose of `roles/pm.md`, `principles.md` and `roles/doc-reviewer.md`
//    wraps at 80 columns and `CLAUDE.md` at 100, so a sentence usually spans two
//    or three lines and a line-by-line `grep` misses it. `docs/qa/gaps.md`
//    item 21 records eight bites from that trap in this job alone, and its
//    2026-08-22 addition settles this exact case: for a string that must be
//    ABSENT, the flattened count and the per-line count being equal is only
//    `0` equal to `0`, and it is NOT a licence to pin per line — the day the
//    phrase comes back it may come back wrapped, and the per-line count is
//    still 0. So the assertion is on the flattened text. The per-line count is
//    printed beside it as a number, not as advice, and a self-test below proves
//    the flattened matching really does survive a line wrap while the per-line
//    matching does not.
//
// 3. THE MATCH IS CASE-INSENSITIVE, AND THAT IS NOT COSMETIC.
//    Before this job `roles/pm.md` line 1453 read `Both lanes open with`, in a
//    hard rule, and `principles.md` and `CLAUDE.md` each had a capitalised one
//    too. A case-sensitive count gave 4 for `roles/pm.md` instead of 5 and would
//    have called the file clean with the hard rule still saying it. All four DoD
//    cells demand `grep -i` for this reason. A self-test below proves the
//    matching used here catches the capitalised writing.
//
// 4. THE ANCHOR WAS CHECKED AGAINST THE SOURCE FILES, NOT COPIED FROM THE DoD.
//    `docs/qa/gaps.md` item 27: an anchor string quoted in a DoD cell is the
//    rendered shape, not the shape in the file, and a pin copied from the page
//    can be dead the minute it is written. `both lanes` carries no backticks and
//    no escaping, so there was nothing to unescape here — but it was still
//    counted in the source of all four files at this job's start commit
//    (d06a19e) before this case was written, and the counts came out exactly as
//    the DoD cells say: `roles/pm.md` 5, `principles.md` 7,
//    `roles/doc-reviewer.md` 1, `CLAUDE.md` 3, sixteen in all. A second, looser
//    check per file catches the phrase written with markdown emphasis or
//    backticks between the two words, so no escaping dodges the pin.
//
// 5. NO "HONEST MENTION" WINDOW, ON PURPOSE — and this is a decision, not an
//    oversight. `docs/qa/gaps.md` item 26 asks whether a sentence that merely
//    REPORTS the old wording ("this used to say both lanes, because there were
//    three lanes then") should be allowed. Three reasons it is not allowed here.
//    (a) It was measured first: the flattened, case-insensitive count is 0 in
//    all four files today, so there is no honest mention in existence to
//    protect, and a window would be guarding nothing. (b) All four DoD cells
//    give the same verification — the count is `0`, full stop, with no exception
//    written into any of them; inventing one here would test a message instead of
//    the document. (c) Item 26 measured what such a window costs: widened it goes
//    falsely green, narrowed it goes falsely red, and there is no middle point a
//    string check can hold. If this repository ever does want to write that
//    sentence, the honest road is `ADR 0018` — change the DoD cell first, and
//    change this case in the same commit — never a quiet exception here.
//
// Scope, said out loud so the next reader does not think it was missed:
// `docs/research/req-part-b-audit.md` names exactly these four files under its
// defect 5, and the four DoD cells cover exactly those four. Two other files in
// this repository still hold the phrase and are deliberately NOT pinned here:
// `CHANGELOG.md` (3 flattened, and one of them wraps across lines) and
// `tools/verify-mount.mjs` (4, in the comments of the CRD 0010 pins). Neither is
// named by the audit or by any B5 DoD cell, and `tools/verify-mount.mjs` is the
// engineer's file, which QA does not touch. The QA report for this case says so.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

// Every file B5 swept, with the flattened count each one held at this job's
// start commit d06a19e. The count is carried here so a reader can see what this
// pin is worth: a file that never had the phrase would give a green that looked
// at nothing.
const SWEPT = [
  { file: "roles/pm.md", before: 5, carriedBy: "T-64 DoD item 9" },
  { file: "principles.md", before: 7, carriedBy: "T-69 DoD item 5" },
  { file: "roles/doc-reviewer.md", before: 1, carriedBy: "T-77 DoD item 8" },
  { file: "CLAUDE.md", before: 3, carriedBy: "T-80 DoD item 1" },
];

// The phrase itself, exactly as the four DoD cells write it, case-insensitive.
const BANNED = /both lanes/gi;
// The same phrase written with markdown emphasis or backticks between the two
// words: `both **lanes**`, `both `lanes``, `**both** lanes`. Whitespace is
// already collapsed by `flat`, so only the markup characters are allowed here.
// Brackets and parentheses are left OUT of the class on purpose: `both (lanes
// and roles)` is ordinary English, not the banned phrase, and a pin that went
// red on it would be a false red.
const BANNED_MARKED_UP = /both[\s`*_]*lanes/gi;

const count = (text, pattern) => (text.match(pattern) ?? []).length;
const perLine = (text) => text.split("\n").filter((line) => /both lanes/i.test(line)).length;

// ------------------------------------------------------------- the self-tests
//
// Two properties of the matching, proved on strings written here rather than on
// the repository. They are what makes every check below able to fail: without
// the first, a returning phrase hides in a line break; without the second, it
// hides behind a capital letter. Both were the real shape of this phrase in
// this repository before the sweep.

const wrapped = "in any folder. Both\nlanes open with the same document";
check(
  "flattening finds the phrase even when it wraps across lines, and a per-line search does not",
  count(flat(wrapped), BANNED) === 1 && perLine(wrapped) === 0,
  `flattened ${count(flat(wrapped), BANNED)}, per line ${perLine(wrapped)} —`
  + " if these are not 1 and 0 the ABSENT checks below are not protected against a wrapped return",
);

const capitalised = "in any folder. Both lanes open with the same document";
check(
  "the matching is case-insensitive: it finds `Both lanes` where a case-sensitive count misses it",
  count(flat(capitalised), BANNED) === 1
    && count(flat(capitalised), /both lanes/g) === 0,
  "the capitalised writing is the one `roles/pm.md` really had, in a hard rule at line 1453",
);

check(
  "the looser pattern catches the phrase written with emphasis or backticks",
  count(flat("the opening document of both **lanes**"), BANNED_MARKED_UP) === 1
    && count(flat("the task table of both `lanes`"), BANNED_MARKED_UP) === 1
    && count(flat("it opens both lanes"), BANNED_MARKED_UP) === 1,
  "an escaping or emphasis writing must not be able to dodge the pin",
);

check(
  "the looser pattern does not go red on ordinary English between the two words",
  count(flat("it needs both (lanes and roles) to agree"), BANNED_MARKED_UP) === 0,
  "a pin that reads `both (lanes and roles)` as the banned phrase is a false red",
);

// -------------------------------------------------------------- the four files
for (const { file, before, carriedBy } of SWEPT) {
  const text = repoFile(file);
  const flatText = flat(text);

  // The premise, per file. A file emptied, renamed or replaced by a stub would
  // give every check below a free green, so its size is asserted first. Reading
  // a missing file throws, which is the loud failure this case wants.
  check(
    `${file} is present and is the real file (${text.length} char(s))`,
    text.length > 1000,
    `${file} holds only ${text.length} char(s) — an ABSENT check against a stub proves nothing`,
  );

  const flatHits = count(flatText, BANNED);
  const lineHits = perLine(text);
  check(
    `${file} no longer says "both lanes" (flattened: ${flatHits}, per line: ${lineHits}; ${before} before the sweep, ${carriedBy})`,
    flatHits === 0,
    `${file} holds the phrase ${flatHits} time(s) in the flattened text: `
    + JSON.stringify([...flatText.matchAll(/.{0,60}both lanes.{0,40}/gi)].map((m) => m[0]))
    + `\n      the per-line count is ${lineHits} and proves nothing on its own (docs/qa/gaps.md item 21)`
    + `\n      this is ${carriedBy}, requirement B5: the phrase points at nothing, because the file lists no two lanes`,
  );

  const markedUp = count(flatText, BANNED_MARKED_UP);
  check(
    `${file} does not say it with emphasis or backticks between the words either (${markedUp})`,
    markedUp === 0,
    `${file} holds a marked-up writing of the phrase: `
    + JSON.stringify([...flatText.matchAll(/.{0,60}both[\s`*_]*lanes.{0,40}/gi)].map((m) => m[0]))
    + `\n      ${carriedBy}, requirement B5 — the writing changed, the phrase did not`,
  );
}

done();
