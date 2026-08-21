// T-66 DoD item 2 and DoD item 3 (PRD M1 DoD item 9, requirement B2): the PM
// prompt no longer points step 13 or step 14 at a commit that never existed. It
// proves step 13 gives those files ONE COMMIT OF THEIR OWN plus the shape of its
// message, that the dead pointer "in this milestone's commit" is gone from the
// whole file, and that step 14's matching hole is closed — each of the three
// reader-facing things it names says which commit it goes in.
//
// WHAT THE DEFECT WAS. Step 13 used to tell the PM to put the release and upgrade
// plans "in this milestone's commit". There is no such commit and never was: this
// crew commits once per task, so by the time step 13 runs every task is committed
// already and the milestone has no commit of its own to add anything to. A PM
// following that line has nowhere to put the file. Step 14 had the same hole from
// the other side: the two READMEs were told they go in the same commit as each
// other, while the `CHANGELOG.md` entry and the repository's own rules file were
// told nothing at all.
//
// WHY THE FIX IS TWO DIFFERENT SHAPES, AND WHY THIS CASE READS STEP 14 TODAY
// RATHER THAN COPYING STEP 13'S ANSWER. Step 13 writes only files the PM writes
// itself, so everything it produces lands in one commit of its own. Step 14 is
// mixed: a README written by an engineer under a task row belongs to that task's
// commit, and only what the PM writes itself gets a commit of its own. So step 14
// is NOT "one commit of its own, always", and a check that asserted that would be
// red against a correct prompt. The two classes were read out of step 14 as it
// stands, not assumed from step 13.
//
// THE TRAP THIS CASE HAD TO STEP OVER, AND IT IS THE REASON THE ANCHORS BELOW
// WERE TAKEN FROM THE FILE'S BYTES. A DoD cell shows an anchor the way MARKDOWN
// RENDERS it, not the way the source spells it, and a pin copied from the
// rendering can be dead from the moment it is written (`docs/qa/gaps.md` item 27).
// Every anchor here was read out of `roles/pm.md` with `od -c` first:
//
//   * the message shape is spelled `docs: <short what> (crew <milestone>)` with
//     PLAIN backticks around it in the file — the backticks are markdown's code
//     span, they are not part of the string, and nothing inside the string is
//     escaped;
//   * `no "milestone commit"` uses ASCII double quotes, not curly ones;
//   * `that task's` and `milestone's` use the ASCII apostrophe. The scans below
//     still accept U+2019 as well, so a typographic apostrophe cannot smuggle the
//     dead pointer back in.
//
// Text is also run through the same backslash-backtick unescaping the other cases
// use, so an anchor would be found whichever way a future editor escapes it.
//
// THE SECOND TRAP: WRAPPING. `roles/pm.md` wraps at 80 columns and the sentence
// that carries the message shape wraps right after the word "message" — in BOTH
// steps. A line-by-line search for `message `docs: <short what> (crew <milestone>)``
// finds 0 today while the sentence sits there twice. So every match below runs on
// `flat()`ed text, and the counts are taken twice (flattened and line by line) and
// compared, exactly as `docs/qa/gaps.md` item 21 asks. The printed table shows the
// two numbers for every anchor, and the 0-versus-2 row is the proof.
//
// WHAT IS DELIBERATELY *NOT* PINNED TO ZERO: the words "milestone commit".
// Step 13 now carries the sentence `There is no "milestone commit"` — that
// sentence is the record of why this changed, and it is the mention, not the rule
// (the distinction this job made several times). Only the possessive form
// `this milestone's commit` is forbidden, because that form is only ever an
// instruction to put something into a commit that does not exist. The broader form
// without the leading "in" is forbidden too: changing the preposition is not a fix.
//
// WHAT THIS CASE CANNOT DO. It cannot tell whether the message shape is a GOOD
// shape, whether a real PM would understand which commit is meant, or whether the
// commits a job really makes follow it. It reads two steps of one prompt file.
//
// Reads one repository file (`roles/pm.md`). Writes nothing, anywhere. Offline.

import { pm, step, flat, check, done } from "../lib/qa.mjs";

/** Turn a backslash-escaped backtick back into a plain one, so both spellings match. */
const unescapeBackticks = (text) => text.replace(/\\`/g, "`");

const RAW = unescapeBackticks(pm());
const FLAT = flat(RAW);

/** The message shape, spelled the way `roles/pm.md` really spells it. */
const SHAPE = "`docs: <short what> (crew <milestone>)`";

/** An apostrophe, either spelling. */
const AP = "['’]";

const step13 = step(RAW, 13);
const step14 = step(RAW, 14);
const flat13 = flat(step13);
const flat14 = flat(step14);

console.log(`step 13 cut out: ${step13.length} characters (${step13.split("\n").length} lines)`);
console.log(`step 14 cut out: ${step14.length} characters (${step14.split("\n").length} lines)`);

// --------------------------------------------------------------- the premise
//
// Without this, deleting step 14's whole tail would make every check after it
// pass on nothing at all. "Nothing left to find" is not "the right thing said".

for (const [what, pattern] of [["README", /README/], ["the CHANGELOG", /CHANGELOG\.md/], ["the repository's own rules file", /CLAUDE\.md|rules file/i]]) {
  check(
    `premise: step 14 still names ${what} somewhere in the step`,
    pattern.test(flat14),
    `step 14 is ${step14.length} characters long and does not match ${pattern} — the step was gutted, not corrected`,
  );
}

// ------------------------------------------- DoD item 2, first half: the dead pointer
//
// T-66 DoD item 2 verifies with `flat roles/pm.md | grep -o "in this milestone's
// commit" | wc -l` = 0. Same question, on the flattened WHOLE file, case
// insensitively, and accepting either apostrophe.

for (const [what, regex] of [
  ["in this milestone's commit", new RegExp(`in this milestone${AP}s commit`, "gi")],
  ["this milestone's commit (any preposition — changing the word in front is not a fix)", new RegExp(`this milestone${AP}s commit`, "gi")],
]) {
  const hits = [...FLAT.matchAll(regex)];
  check(
    `roles/pm.md points nowhere at "${what}"`,
    hits.length === 0,
    `${hits.length} occurrence(s); first one in context: ${JSON.stringify(FLAT.slice(Math.max(0, (hits[0]?.index ?? 0) - 120), (hits[0]?.index ?? 0) + 160))}`,
  );
}

// ------------------------------------ DoD item 2, second half: what step 13 says instead
//
// A separate commit, and the shape of its message. Both, and in one sentence: a
// step that said "a commit of its own" in one paragraph and printed a message
// shape three paragraphs later would leave the PM guessing which commit the shape
// belongs to, which is the same defect in a quieter form.

check(
  "step 13 gives what it writes a commit of its own",
  /a commit of its own/i.test(flat13),
  `step 13 (${step13.length} characters) never says the files get their own commit`,
);

check(
  `step 13 gives the message shape ${SHAPE}`,
  flat13.includes(SHAPE),
  `not found in step 13 — check the file's own bytes before changing this anchor (docs/qa/gaps.md item 27)`,
);

check(
  "step 13 ties the message shape to that same commit, in one sentence",
  new RegExp(`a commit of its own\\W{0,4} ?message ${SHAPE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(flat13),
  `the separate commit and the message shape are in step 13 but not in the same sentence:\n      ${JSON.stringify(flat13.slice(0, 700))}`,
);

check(
  "step 13 says why: the milestone has no commit of its own, because the crew commits once per task",
  /milestone commit/i.test(flat13) && /once per task/i.test(flat13),
  `step 13 replaced the dead pointer without recording that there is no milestone commit, so the next editor can put it back not knowing why it went`,
);

// ------------------------------- DoD item 3: step 14's matching hole, all three things
//
// Read out of step 14 as it stands after T-83 split it in two: what an engineer
// wrote under a task row goes in THAT TASK'S commit, and what the PM writes itself
// goes in ONE COMMIT OF ITS OWN. Everything below is judged inside the bullet that
// answers the question, not anywhere in the step, so a sentence about commits
// somewhere else in the step cannot stand in for an answer.

const at = flat14.search(/\*\*Which commit/);
check(
  "step 14 has a bullet that answers which commit these files go in",
  at !== -1,
  `no "**Which commit" bullet in step 14 (${step14.length} characters) — the hole B2 named is still open on this side`,
);

const bullet = at === -1 ? "" : flat14.slice(at);
console.log(`step 14's "which commit" bullet: ${bullet.length} characters`);

check(
  "that bullet sends a file written under a task row to that task's commit",
  new RegExp(`task row[^.]{0,60}that task${AP}s commit`, "i").test(bullet),
  `bullet: ${JSON.stringify(bullet)}`,
);

check(
  "that bullet sends what the PM writes itself to one commit of its own",
  /one commit of its own/i.test(bullet),
  `bullet: ${JSON.stringify(bullet)}`,
);

for (const [what, pattern] of [
  ["the README pair", /README/],
  ["the CHANGELOG.md entry", /`?CHANGELOG\.md`?/],
  ["the repository's own rules file", /rules[- ]file|CLAUDE\.md/i],
]) {
  check(
    `that bullet names ${what} as one of the things it is answering for`,
    pattern.test(bullet),
    `${what} is not in the bullet, so nothing in the prompt says which commit it goes in — bullet: ${JSON.stringify(bullet)}`,
  );
}

check(
  `that bullet gives the same message shape as step 13, ${SHAPE}`,
  bullet.includes(SHAPE),
  `the two steps would name different message shapes, and step 13 promises "Step 14's files do the same"`,
);

check(
  "that bullet points at no milestone commit either",
  !new RegExp(`milestone${AP}s commit`, "i").test(bullet),
  `bullet: ${JSON.stringify(bullet)}`,
);

// -------------------------------------------------- the wrap guard: count it twice
//
// Every anchor above is matched on flattened text. This asks the same questions
// line by line and prints both numbers. A flattened count LOWER than the
// line-by-line one would mean the matching method itself is broken; the rows where
// the line-by-line count is 0 and the flattened count is not are the ones a
// line-based pin would have missed entirely — the message shape sentence is
// exactly that, in both steps.

const lines = RAW.split("\n");
const counts = (regex) => {
  const flatHits = [...FLAT.matchAll(new RegExp(regex.source, "gi"))].length;
  const lineHits = lines.reduce((total, line) => total + [...line.matchAll(new RegExp(regex.source, "gi"))].length, 0);
  return { flatHits, lineHits };
};

const escaped = SHAPE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ANCHORS = [
  ["in this milestone's commit", new RegExp(`in this milestone${AP}s commit`)],
  ["a commit of its own", /a commit of its own/],
  ["one commit of its own", /one commit of its own/],
  ["the message shape alone", new RegExp(escaped)],
  ["message + the shape (this one wraps)", new RegExp(`message ${escaped}`)],
  ["goes in that task's commit", new RegExp(`goes in that task${AP}s commit`)],
];

const lost = [];
for (const [what, regex] of ANCHORS) {
  const { flatHits, lineHits } = counts(regex);
  console.log(`count  ${what}: flattened ${flatHits}, line by line ${lineHits}`);
  if (flatHits < lineHits) lost.push(`${what} (flattened ${flatHits} < line by line ${lineHits})`);
}

check(
  "the flattened scan finds at least as many hits as the line-by-line scan, for every anchor",
  lost.length === 0,
  `flattening lost a hit: ${lost.join("; ")} — the method is wrong, not the file`,
);

done();
