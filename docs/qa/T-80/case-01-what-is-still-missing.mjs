// T-80 DoD item 5 — `CLAUDE.md`: the "what is still missing" sentence.
//
// What this proves: the sentence no longer claims `docs/research/` is empty (it
// holds two files today), the old wording it used to end with is gone, and the
// sentence names `docs/design/api/` and `docs/release/` only.
//
// Before the change the sentence read (git show d06a19e:CLAUDE.md, lines 308-310):
//
//   What is still missing is `docs/design/api/`, `docs/release/` and
//   `docs/research/`: no job here has written one. That is correct, not missing.
//
// It was already untrue the day it was written: `docs/research/req-part-b-audit.md`
// existed and `docs/research/document-types.md` was added by the same job. A
// researcher found it by chance while reading for something else (section 13 of
// `docs/research/document-types.md`); no check in this repository saw it.
//
// Two traps this case is written around, both from `docs/qa/gaps.md`:
//
//  * item 31 — never search the WHOLE file for `docs/research`. That path is a
//    legitimate part of `CLAUDE.md`: the folder is real, it has a row in the
//    "durable" table and the prose mentions it twice more. A whole-file ban would
//    be a check that is red from the moment it is written. So the sentence is
//    sliced out first, and the ban applies inside that one sentence only.
//  * item 30 — a "must be 0" check is counted flattened AND case-insensitively,
//    and every number is printed, so a lower-case copy of the old wording cannot
//    hide behind the default of `grep`.
//
// Read-only: it reads `CLAUDE.md` and writes nothing, so it is repeatable and
// safe to run beside anything else.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const RAW = repoFile("CLAUDE.md");

/** The sentence's opening words. Verified present in the before-change file too. */
const ANCHOR = "What is still missing is";

/** The wording that had to go: it is the half that was untrue. */
const BANNED = "no job here has written one";

/**
 * Drop the markdown markers a phrase or a path may be wrapped in, so a check
 * cannot be dodged by putting the words in backticks or bold (gaps.md item 27).
 */
const bare = (text) => text.replace(/[`*_\\]/g, "");

/** How many times `needle` is in `text`, optionally ignoring case. */
function countIn(text, needle, insensitive) {
  const haystack = insensitive ? text.toLowerCase() : text;
  const target = insensitive ? needle.toLowerCase() : needle;
  return haystack.split(target).length - 1;
}

/**
 * The one sentence that starts at `anchor`, out of already-flattened text.
 *
 * The end of a sentence is the first full stop followed by whitespace or by the
 * end of the text. A path such as `prd.md` has no whitespace after its dot, so
 * it never cuts the sentence short.
 */
function sentenceFrom(text, anchor) {
  const start = text.indexOf(anchor);
  if (start === -1) return null;
  const rest = text.slice(start);
  const end = rest.search(/\.(\s|$)/);
  return end === -1 ? rest : rest.slice(0, end + 1);
}

const FLAT_BARE = bare(flat(RAW));
const sentence = sentenceFrom(FLAT_BARE, ANCHOR);

// ------------------------------------------------------------------ the numbers

const counts = {
  "flattened, case-sensitive": countIn(flat(RAW), BANNED, false),
  "flattened, case-insensitive": countIn(flat(RAW), BANNED, true),
  "as written, case-sensitive": countIn(RAW, BANNED, false),
  "as written, case-insensitive": countIn(RAW, BANNED, true),
  "flattened + markers stripped, case-insensitive": countIn(FLAT_BARE, BANNED, true),
};
for (const [how, many] of Object.entries(counts)) {
  console.log(`      count of ${JSON.stringify(BANNED)} (${how}): ${many}`);
}
console.log(`      the sentence: ${sentence === null ? "NOT FOUND" : JSON.stringify(sentence)}`);

// ------------------------------------------------------------------ the checks

// 1. The positive anchor. Without it, deleting the whole sentence would make
//    every other check here pass on text that is not there any more.
const anchors = countIn(FLAT_BARE, ANCHOR, true);
check(
  "CLAUDE.md still carries a \"what is still missing\" sentence",
  anchors >= 1,
  `${JSON.stringify(ANCHOR)} appears ${anchors} time(s) in the flattened file`,
);

// 2. The old wording is gone, by every way of counting it.
const worst = Math.max(...Object.values(counts));
check(
  `CLAUDE.md nowhere says ${JSON.stringify(BANNED)}`,
  worst === 0,
  Object.entries(counts).map(([how, many]) => `${how}: ${many}`).join("; "),
);

// 3. Structural guard: the slice really is one sentence. A missing full stop
//    would run the slice on into the rest of the file, and check 4 would then be
//    judging text that is not the sentence.
check(
  "the \"what is still missing\" sentence can be sliced out as one sentence",
  sentence !== null && sentence.length <= 400,
  sentence === null
    ? `no sentence starts with ${JSON.stringify(ANCHOR)}`
    : `the slice is ${sentence.length} characters, which is too long to be one sentence: ${JSON.stringify(sentence)}`,
);

// 4. One assertion, three facts about that sentence: it names the two folders
//    that really are still empty, and does not name the one that is not.
const named = {
  "docs/design/api": (sentence ?? "").includes("docs/design/api"),
  "docs/release": (sentence ?? "").includes("docs/release"),
  "docs/research": (sentence ?? "").includes("docs/research"),
};
check(
  "the sentence names docs/design/api/ and docs/release/ and NOT docs/research/",
  named["docs/design/api"] && named["docs/release"] && !named["docs/research"],
  `in the sentence — docs/design/api: ${named["docs/design/api"]}, docs/release: ${named["docs/release"]}, docs/research: ${named["docs/research"]}\n      ${sentence === null ? "NOT FOUND" : JSON.stringify(sentence)}`,
);

// 5. The other direction. `docs/research/` is a real folder with a real row in
//    the "durable" table, so the way to satisfy check 4 is to fix the sentence,
//    never to delete the path from the file.
const stillThere = countIn(FLAT_BARE, "docs/research", true);
check(
  "docs/research/ is still described elsewhere in CLAUDE.md",
  stillThere >= 1,
  `docs/research appears ${stillThere} time(s) in the flattened file, so the sentence was fixed by deleting the folder's own description`,
);

done();
