// T-79 DoD items 2 and 3 (PRD M1 DoD item 15): EACH of the two READMEs, on its
// own, tells the reader the three things this job changed about how a job runs,
// plus the one sentence requirement A3 asked for.
//
//   1. ONE round of QA per milestone, at the end of the coding, before the
//      reviews - not once per task;
//   2. the three reviews run ONE round each, in PARALLEL, over the CHANGED part
//      only, and only a review's own finding brings that review back;
//   3. a task is finished when ITS OWN UNIT TESTS pass - nothing else holds it
//      open;
//   4. (A3) every role persona carries a "what you may write" section, and
//      reading is not restricted.
//
// WHAT IT PROVES. The README is the only page most users read. `CLAUDE.md`
// requires the two files to move together, English first, Chinese second - so
// the ordinary failure is not "nobody wrote it", it is "the English page grew a
// paragraph and the Chinese reader silently got a smaller product". This case
// therefore asserts on EACH FILE SEPARATELY: eight primary checks, four per
// file, one per thing per file. Two files never cover for each other here, and a
// FAIL line names the file and the thing, so one red line is the whole diagnosis.
//
// WHY IT IS NOT `docs/qa/T-59/`, WHICH ALSO READS BOTH READMES. T-59 belongs to
// the previous job (`paired-engineers`) and pins that job's content plus the
// SHAPE of the pair: the paired-shape section, nine rows in the role table, the
// `roleDeny` default row, architect-only and the symlink, the heading counts
// lining up one for one, "pair programming" only in a contrast sentence, and the
// released-version box left untouched. Not one of those is about how a job runs.
// This case pins THIS job's content - the four statements above - and pins it
// per file rather than by comparing the two files. Overlap: none. The nearest
// neighbour is `T-59/case-07`, which counts headings in both files; it would stay
// green while a paragraph inside a section quietly lost a claim, which is exactly
// the failure this case exists for.
//
// DELIBERATELY NOT CHECKED HERE: the version numbers. PRD DoD item 15 originally
// asked for "the version agrees in two places"; the v6 -> v7 correction of that
// PRD dropped that half - this job does not touch a version number at all, all
// three places stay at `0.8.0`, and they move together on the day the user says
// release. The version box is pinned by `docs/qa/T-59/case-09` and is none of
// this case's business.
//
// ------------------------------------------------------------------------------
// PINNING STYLE: MARKERS STRIPPED, THEN COUNTED TWICE - FLATTENED AND SQUEEZED.
// Three traps of `docs/qa/gaps.md` meet in one file here, and the third one is
// new because one of the two files is not English.
//
//   * WRAPPING (gaps item 21). Both READMEs wrap at 100 columns, so a sentence
//     normally spans two or three lines and any line-based match reports a
//     sentence that IS there as missing. Measured today, three of the ten
//     English anchors below are line-invisible: "not once per task", "so neither
//     of them calls a task done" and "Reading is not restricted" all give
//     line=0, flat=1. Every check here prints both numbers.
//
//   * MARKDOWN MARKERS (gaps item 27, second example). Every claim in these
//     files is bold, and one anchor sits astride a marker:
//     `**What you may write**` inside a sentence. An anchor copied from the
//     rendered page would never match. So backticks, asterisks and underscores
//     are removed from BOTH the text and the anchor before matching, and the
//     anchors below are written with no markers at all.
//
//   * COLLAPSING WHITESPACE IS THE RIGHT NORMALIZATION FOR ENGLISH AND THE WRONG
//     ONE FOR CHINESE. `flat()` turns every run of whitespace into ONE SPACE,
//     which is correct for English, where the space between two words is part of
//     the sentence. In the Chinese file there is no space between two
//     characters, so a sentence that wraps mid-sentence becomes "<chars> <chars>"
//     after flattening and a correct anchor stops matching. Measured today: no
//     Chinese anchor below wraps (all eleven give line=1), so flattening alone
//     would pass - by luck, and only until somebody re-wraps that file. So every
//     anchor is also counted in a SQUEEZED copy, where whitespace is removed
//     rather than collapsed, and an anchor found either way counts as present.
//     Self-test 2 below proves the squeezed pass really does find an anchor
//     broken across a line; self-test 3 proves the flattened pass alone does not.
//
// WHY THE CHINESE ANCHORS ARE `\u` ESCAPES. `docs/qa/gaps.md` item 25 says it:
// every ABSENT-or-PRESENT pin in this repository is written as an English
// string, and `README-zh.md` is the only page a Chinese-speaking user reads. A
// pin written in English cannot fire on a translated sentence. Measured today,
// all ten English anchors below occur ZERO times in `README-zh.md`, so a case
// that had reused them would have been a pin that can never go red - the
// "check that is dead the moment it is written" of gaps items 27, 28 and 31.
// The anchors for the Chinese file are therefore the real Chinese sentences,
// written as `\u` escapes so this case file itself carries no Chinese character
// (`docs/qa/T-67/case-09` uses the same device, and gaps item 24 explains why a
// Chinese character inside an English-only file matters).
//
// BRITTLE ON PURPOSE, AND WHAT TO DO WHEN IT GOES RED. Each thing is pinned by
// two or three whole sentences, and ALL of them must be present. Reword one of
// them legitimately and this case goes red. That is the trade `ADR 0004`
// describes, taken deliberately: the failure being guarded is a claim quietly
// disappearing from one of the two pages, and only a sentence-level anchor sees
// that. When a rewording is real, `ADR 0018` says what to do - change the anchor
// in the SAME commit as the file, and never weaken the assertion. When an anchor
// reads zero, gaps item 31 says which to doubt first: the anchor, not the file.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

// ---------------------------------------------------------------- normalizing

/** Drop the markdown emphasis markers, so an anchor need not know where bold starts. */
const plain = (text) => text.replace(/[`*_]/g, "");

/** English-safe: runs of whitespace become one space. */
const flatten = (text) => flat(plain(text));

/** Chinese-safe: whitespace removed, so a wrap inside a sentence cannot hide it. */
const squeeze = (text) => plain(text).replace(/\s+/g, "");

const occurrences = (haystack, needle) => haystack.split(needle).length - 1;

/**
 * How many times `needle` occurs in `text`, counted three ways.
 * `present` is true when either whitespace-insensitive pass finds it; `line` is
 * reported only so a reader can see when a line-based pin would have lied.
 */
function counts(text, needle) {
  const line = plain(text).split("\n").filter((one) => one.includes(plain(needle))).length;
  const fl = occurrences(flatten(text), flatten(needle));
  const sq = occurrences(squeeze(text), squeeze(needle));
  return { line, flat: fl, squeeze: sq, present: fl > 0 || sq > 0 };
}

// ------------------------------------------------------------------ the files

const FILES = {
  en: { path: "README.md", text: repoFile("README.md") },
  zh: { path: "README-zh.md", text: repoFile("README-zh.md") },
};

// ---------------------------------------------------------------- the anchors
//
// Four things, and per thing one anchor list per file. The Chinese lists are the
// same claims as the English ones, taken from `README-zh.md` itself - NOT a
// word-for-word translation of the English anchor, because the Chinese page is
// written, not substituted, and an anchor invented by translating would be an
// anchor that never matches.

const THINGS = [
  {
    id: "1 QA runs once per milestone, not once per task",
    en: [
      "One round of QA first, in two steps",
      "run once per milestone, at the end of it",
      "not once per task",
    ],
    zh: [
      // "one round of QA first, in two steps"
      "\u5148\u4e00\u8f6e QA\uff0c\u5206\u4e24\u6b65",
      // "runs only one round per milestone"
      "\u4e00\u4e2a\u91cc\u7a0b\u7891\u53ea\u8dd1\u4e00\u8f6e",
      // "not once per task"
      "\u4e0d\u662f\u6bcf\u4e2a\u4efb\u52a1\u8dd1\u4e00\u904d",
    ],
  },
  {
    id: "2 the three reviews: one round each, in parallel, changed part only",
    en: [
      "Then the other three, in one message, one round each, in parallel",
      "Only the changed part is in scope",
      "The three never re-run together",
    ],
    zh: [
      "\u7136\u540e\u53e6\u5916\u4e09\u4e2a\uff0c\u5728\u540c\u4e00\u6761\u6d88\u606f\u91cc\u5404\u4e00\u8f6e\u3001\u5e76\u884c",
      "\u53ea\u6709\u6539\u52a8\u8fc7\u7684\u90e8\u5206\u5728\u8303\u56f4\u5185",
      "\u4e09\u4e2a\u4ece\u4e0d\u4e00\u8d77\u91cd\u8dd1",
    ],
  },
  {
    id: "3 a task is finished when its own unit tests pass",
    en: [
      "A task is finished when its own unit tests pass",
      "so neither of them calls a task done",
    ],
    zh: [
      "\u4e00\u4e2a\u4efb\u52a1\u505a\u5b8c\u7684\u5224\u636e\uff0c\u662f\u5b83\u81ea\u5df1\u7684\u5355\u5143\u6d4b\u8bd5\u901a\u8fc7",
      "\u6240\u4ee5\u5b83\u4eec\u8c01\u4e5f\u4e0d\u8d1f\u8d23\u5ba3\u5e03\u4e00\u4e2a\u4efb\u52a1\u505a\u5b8c",
    ],
  },
  {
    id: "4 (A3) every persona has a what-you-may-write section, reading unrestricted",
    en: [
      "Every persona also carries a What you may write section",
      "Reading is not restricted",
    ],
    zh: [
      "\u6bcf\u4efd\u4eba\u8bbe\u91cc\u8fd8\u5404\u6709\u4e00\u8282",
      "\u4f60\u80fd\u5199\u4ec0\u4e48",
      "\u8bfb\u4e0d\u53d7\u9650",
    ],
  },
];

// ----------------------------------------------------------- the eight checks

for (const thing of THINGS) {
  for (const key of ["en", "zh"]) {
    const file = FILES[key];
    const found = thing[key].map((anchor) => ({ anchor, ...counts(file.text, anchor) }));
    const missing = found.filter((one) => !one.present);
    const numbers = found
      .map((one) => `flat=${one.flat} squeeze=${one.squeeze} line=${one.line} ${JSON.stringify(one.anchor)}`)
      .join("\n      ");
    check(
      `${file.path} says thing ${thing.id}`,
      missing.length === 0,
      missing.length === 0
        ? ""
        : `${missing.length} of ${found.length} anchor(s) missing from ${file.path}\n      ${numbers}\n      `
          + `If the page really was reworded, fix the anchor in the same commit (ADR 0018) and do not weaken this check. `
          + `If the page was not touched, doubt the anchor first (gaps item 31).`,
    );
  }
}

// ------------------------------------------------------------- the self-tests
//
// Four of them, because three of this case's own mechanisms could fail silently
// and leave eight green checks that looked at nothing.

// 1. The finder must be able to say NO. Without this, a bug that made
//    `present` always true would give eight passes and no warning.
{
  const absent = counts(FILES.en.text, "this sentence is not in either README");
  check(
    "self-test: the finder reports a made-up sentence as absent",
    absent.present === false && absent.flat === 0 && absent.squeeze === 0,
    `flat=${absent.flat} squeeze=${absent.squeeze}`,
  );
}

// 2. The squeezed pass must find a Chinese anchor that is broken across a line.
//    This is the pass that exists only for the Chinese file, and today nothing in
//    that file exercises it - every Chinese anchor happens to sit on one line. So
//    the wrap is made here on purpose, in a synthetic string, and the finder must
//    still see the anchor. Without this self-test the Chinese half of this case
//    would be green by luck for as long as nobody re-wraps that page.
{
  const anchor = THINGS[3].zh[2]; // the "reading is not restricted" sentence
  const wrapped = `${anchor.slice(0, 2)}\n   ${anchor.slice(2)}`;
  const seen = counts(wrapped, anchor);
  check(
    "self-test: a Chinese anchor broken across a line is still found (squeezed)",
    seen.present === true && seen.squeeze === 1,
    `flat=${seen.flat} squeeze=${seen.squeeze} line=${seen.line}`,
  );
}

// 3. And the other half of the same point, stated as a number rather than as a
//    warning: on that same wrapped text, FLATTENING ALONE fails. This is what
//    makes the squeezed pass necessary rather than decorative, and it is the
//    difference between English and Chinese wrapping written down so the next
//    person reads a measurement instead of advice.
{
  const anchor = THINGS[3].zh[2];
  const wrapped = `${anchor.slice(0, 2)}\n   ${anchor.slice(2)}`;
  const flatOnly = occurrences(flatten(wrapped), flatten(anchor));
  check(
    "self-test: flattening alone does NOT find that wrapped Chinese anchor, so the squeezed pass is load-bearing",
    flatOnly === 0,
    `flattening found it ${flatOnly} time(s) - if this is no longer 0, whitespace handling changed and the comment above is stale`,
  );
}

// 4. An English anchor with markdown emphasis and a line wrap through it must be
//    found - the T-79 page really does write `**What you may write**` mid-sentence
//    and really does wrap `Reading is not restricted` across two lines.
{
  const anchor = "Every persona also carries a What you may write section";
  const asWritten = "Every persona also carries a **What you may\nwrite** section";
  const seen = counts(asWritten, anchor);
  check(
    "self-test: an English anchor is found through markdown markers and a wrap",
    seen.present === true && seen.flat === 1 && seen.line === 0,
    `flat=${seen.flat} squeeze=${seen.squeeze} line=${seen.line}`,
  );
}

// ------------------------------------------------------------------- the note
//
// Printed, not asserted: the measurement behind the pinning style. It is the
// evidence for gaps item 25 - a pin written in English cannot fire on the
// Chinese page - and for gaps item 21 in this file, and a reader of the output
// gets the numbers rather than a paragraph asking them to trust one.
{
  const englishAnchors = THINGS.flatMap((thing) => thing.en);
  const inChinese = englishAnchors.filter((anchor) => counts(FILES.zh.text, anchor).present).length;
  const lineInvisible = englishAnchors.filter((anchor) => counts(FILES.en.text, anchor).line === 0).length;
  console.log(
    `note  ${englishAnchors.length} English anchors: ${inChinese} of them occur in README-zh.md `
    + `(an English pin on that file fires on ${inChinese}), and ${lineInvisible} are invisible to a line-based match in README.md`,
  );
}

done();
