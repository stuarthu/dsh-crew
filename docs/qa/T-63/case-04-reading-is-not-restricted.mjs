// T-63 DoD item 4, and the shared DoD item 1 of T-70 to T-78: the one line that
// says reading is NOT restricted is carried by all ten role prompts, word for
// word, exactly once each, and it sits in the place where it does its job.
//
// WHY THIS ONE LINE IS WORTH A CASE OF ITS OWN. Every other line of the
// `## What you may write` section is a RESTRICTION: these classes of file are
// yours, those are not. This is the only line in the whole section that says what
// is NOT restricted. So it is the one line a writer can drop while the section
// still reads complete — nothing looks missing, and the section quietly starts to
// read as "the list governs reading too". That shape was refused on purpose:
// `CRD 0023` decision three pins the WRITE set and leaves reading alone, and
// `principles.md` gives the reason in as many words — reading was never the
// problem, so the write set is what needs a line drawn around it. Nine engineers
// who cannot see each other each copied this line into their own file, which is
// exactly the situation where one copy goes missing and nobody notices.
//
// THE SENTENCE IS CUT OUT OF `principles.md`, NEVER TYPED IN THIS FILE.
// `principles.md` holds the authoritative wording, and its own rule is "copy, do
// not paraphrase" — so the only honest comparison is against that text. A copy
// typed here would be an eleventh version of the sentence, and the day the
// authoritative one is reworded this case would be comparing the ten prompts
// against a string no document contains. The cut is structural: the
// `## Wording every role prompt copies word for word` section, its
// `### The shape of a role's write set` subsection, and the single quoted line
// inside it. If that subsection ever holds no quoted line or more than one, this
// case reports that and stops rather than guessing which line it meant.
//
// THE LIST OF TEN FILES IS ALSO CUT OUT OF `principles.md`. That section names
// all ten prompts by path in its opening paragraph, so the list of files that must
// carry the line comes from the document rather than from a hard-coded ten. The
// folder is then compared against that list, which closes the hole a plain
// directory walk leaves: a walk over `roles/` would pass with nine files, having
// silently stopped testing the tenth.
//
// THREE FAKE-CHECK SHAPES THIS JOB REALLY PRODUCED, AND HOW EACH IS AVOIDED.
//
//   1. PINNING A STRING THAT WRAPS. The prose in `roles/` wraps at 80 columns and
//      a sentence normally spans two or three lines, so a line-based grep reports
//      a sentence that IS there as absent. Every count below is taken on flattened
//      text. The line happens to fit on one line in all ten files today, and that
//      is luck, not a property: the sentence is 54 characters, and one more clause
//      would wrap it. The count-it-twice guard below records both counts for each
//      file so a future wrap is visible instead of silent.
//   2. PINNING A PROXY. "The section exists" or "the file mentions reading" would
//      both stay green with the line gone. What is asserted here is the sentence
//      itself, character for character, in the flattened text.
//   3. READING THE WRONG FILE. `docs/qa/T-52/case-16` pins a property of
//      `roles/*.md` while reading only `principles.md`, so it can never fire. Every
//      read below names the file it is judging, and every failure line names it too
//      — "one of the ten is wrong" is not a usable failure message when nine
//      engineers each own one file.
//
// WHERE THE LINE HAS TO BE, AND WHY THAT IS ASKED IN THREE PLACES. A count over
// the whole file would pass on a copy pasted anywhere — a copy sitting under
// Rule A, or in a closing section, satisfies a counter while the write-set
// statement itself has no such line and reads as if reading were restricted.
// So it is counted three times, narrowing each time: the whole file (exactly one,
// no stray second copy), the `## What you may write` section (it is in there,
// not elsewhere), and the part of that section before the section's first `###`
// subsection (it closes the write-set statement itself, rather than being tucked
// inside the Rule A or Rule B subsection that follows). All ten files put it there
// today with room to spare, and `principles.md` says the section ends with this
// line.
//
// WHAT THIS CASE DELIBERATELY DOES NOT COVER, so nobody reads a pass here as more
// than it is: the section HEADING itself, and the file count, belong to
// `case-01`; that the section names classes and no PRD or HLD file name belongs
// to `case-05`; Rule A and Rule B word for word belong to `case-02` and
// `case-03`. This case is about the one non-restrictive line and nothing else.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, done, flat, repoFile, section } from "../lib/qa.mjs";

const WORDING_HEADING = "Wording every role prompt copies word for word";
const WRITE_SET_SUBSECTION = "### The shape of a role's write set";
const WRITE_SET_HEADING = "What you may write";

const principles = repoFile("principles.md");
const wording = section(principles, WORDING_HEADING);

// ---------------------------------------------------------------- the cut

const subsectionStart = wording.indexOf(WRITE_SET_SUBSECTION);
check(
  `principles.md: the "${WORDING_HEADING}" section still holds a "${WRITE_SET_SUBSECTION}" subsection`,
  subsectionStart !== -1,
  "the authoritative wording moved, so there is nothing to compare the ten prompts against."
    + " Find where the write-set line is now defined and point this case at it.",
);
if (subsectionStart === -1) done();

const afterHeading = wording.slice(subsectionStart + WRITE_SET_SUBSECTION.length);
const nextSubsection = afterHeading.indexOf("\n### ");
const writeSetBlock = nextSubsection === -1 ? afterHeading : afterHeading.slice(0, nextSubsection);

// Every run of consecutive `> ` lines in that subsection, joined into one string.
// A quoted block can wrap like any other prose, so the lines of one block are
// joined rather than read one by one.
const quotedBlocks = [];
let open = null;
for (const line of writeSetBlock.split("\n")) {
  if (/^>\s?/.test(line)) {
    const body = line.replace(/^>\s?/, "");
    if (open === null) open = [body];
    else open.push(body);
  } else if (open !== null) {
    quotedBlocks.push(open.join(" "));
    open = null;
  }
}
if (open !== null) quotedBlocks.push(open.join(" "));

check(
  `principles.md: "${WRITE_SET_SUBSECTION}" holds exactly one quoted line, and that is the sentence compared below`,
  quotedBlocks.length === 1,
  `found ${quotedBlocks.length} quoted block(s): ${quotedBlocks.map((block) => JSON.stringify(block)).join(" / ")}.`
    + " With none there is no authoritative sentence left; with more than one this case cannot tell which is meant."
    + " Neither is a thing to guess at — decide which line is authoritative and point this case at it.",
);
if (quotedBlocks.length !== 1) done();

const SENTENCE = flat(quotedBlocks[0]).trim();
console.log(`note  the authoritative line, cut from principles.md: ${JSON.stringify(SENTENCE)}`);

// Guards on the cut itself. They do not judge the wording — they only refuse to
// carry on with a cut that is obviously not a sentence, so a bad cut fails here,
// naming the cut, instead of ten files away naming ten innocent prompts.
check(
  "the cut sentence is one line of prose, not a fragment and not a paragraph (20 to 200 characters)",
  SENTENCE.length >= 20 && SENTENCE.length <= 200,
  `the cut is ${SENTENCE.length} character(s): ${JSON.stringify(SENTENCE)}`,
);
check(
  "the cut sentence is about reading",
  /\bread/i.test(SENTENCE),
  `the cut says nothing about reading, so it is not the line this case is for: ${JSON.stringify(SENTENCE)}`,
);
check(
  "the cut sentence is complete (it ends in a full stop, with or without its emphasis markers)",
  /\.\**$/.test(SENTENCE) && /\./.test(SENTENCE),
  `the cut ends with ${JSON.stringify(SENTENCE.slice(-8))}, which looks like half a sentence`,
);

// ------------------------------------------------- which files must carry it

const namedFiles = [...new Set(
  [...wording.matchAll(/`(roles\/[a-z-]+\.md)`/g)].map((match) => match[1]),
)].sort();

check(
  `principles.md names ten role prompts as carrying this wording (found ${namedFiles.length})`,
  namedFiles.length === 10,
  `the section names: ${namedFiles.join(", ") || "(none)"}.`
    + " The crew is ten roles, and the authoritative section is where the ten are listed.",
);

const onDisk = readdirSync(join(REPO, "roles"))
  .filter((name) => name.endsWith(".md"))
  .map((name) => `roles/${name}`)
  .sort();

const missingFromDisk = namedFiles.filter((file) => !onDisk.includes(file));
const missingFromList = onDisk.filter((file) => !namedFiles.includes(file));

check(
  "the ten files principles.md names are exactly the role prompts on disk",
  missingFromDisk.length === 0 && missingFromList.length === 0,
  `named but not on disk: ${missingFromDisk.join(", ") || "(none)"};`
    + ` on disk but not named: ${missingFromList.join(", ") || "(none)"}.`
    + " A prompt that no document says must carry this line is a prompt nothing checks;"
    + " a named file that is gone means this case stopped testing it.",
);

// --------------------------------------------------- the ten prompts, one by one

const countIn = (text) => flat(text).split(SENTENCE).length - 1;

for (const relative of namedFiles) {
  if (!onDisk.includes(relative)) {
    check(`${relative}: carries the authoritative line`, false, "the file is not there at all");
    continue;
  }

  const text = repoFile(relative);

  check(
    `${relative}: carries the authoritative line word for word, exactly once`,
    countIn(text) === 1,
    `found ${countIn(text)} copy/copies of ${JSON.stringify(SENTENCE)}.`
      + " Zero means this prompt's write-set section now reads as though reading were restricted too;"
      + " more than one means the line was pasted twice. Copy the line from principles.md, do not retype it.",
  );

  let writeSet;
  try {
    writeSet = section(text, WRITE_SET_HEADING);
  } catch {
    check(
      `${relative}: the authoritative line sits inside its "## ${WRITE_SET_HEADING}" section`,
      false,
      `${relative} has no "## ${WRITE_SET_HEADING}" section, so the line has no section to sit in (case-01 owns the heading itself)`,
    );
    continue;
  }

  check(
    `${relative}: the authoritative line sits inside its "## ${WRITE_SET_HEADING}" section, exactly once`,
    countIn(writeSet) === 1,
    `found ${countIn(writeSet)} copy/copies inside that section, while the file holds ${countIn(text)}.`
      + " A copy elsewhere in the file does not do this line's job: the section that lists what may be"
      + " written is the place a reader decides whether reading is on that list too.",
  );

  const firstSubsection = writeSet.indexOf("\n### ");
  const writeSetProse = firstSubsection === -1 ? writeSet : writeSet.slice(0, firstSubsection);

  check(
    `${relative}: the authoritative line closes the write-set statement itself, before the section's first "###" subsection`,
    countIn(writeSetProse) === 1,
    `found ${countIn(writeSetProse)} copy/copies before the first "###" subsection of that section,`
      + ` and ${countIn(writeSet)} in the section as a whole.`
      + " principles.md says the section ENDS with this line; buried inside the Rule A or Rule B"
      + " subsection that follows, it no longer reads as part of the write set at all.",
  );

  // Count it twice. The flattened count is the one that decides; this records the
  // line-based count beside it, so the day the sentence wraps in one of the ten
  // files it is visible here instead of silently breaking any line-based pin
  // somebody writes later against the same sentence.
  const flatHits = countIn(text);
  const lineHits = text.split("\n").filter((line) => line.includes(SENTENCE)).length;
  check(
    `${relative}: count-it-twice — the flattened count is never below the line-based count`,
    flatHits >= lineHits,
    `flattened ${flatHits} vs line-based ${lineHits}; a line count above the flattened one means the counting is broken`,
  );
  if (flatHits !== lineHits) {
    console.log(
      `note  ${relative}: the line appears ${flatHits} time(s) flattened and ${lineHits} time(s) on a single line`
      + " — it wraps here, so any line-based pin on it would MISS it",
    );
  }
}

done();
