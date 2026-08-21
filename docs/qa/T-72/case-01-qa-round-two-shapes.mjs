// T-72 DoD item 5 and item 6 (requirement A1c, the QA side), case C-50.
//
// It proves that `roles/qa.md` really describes the QA round as TWO shapes, and
// that each shape carries its own three things: what it is given (input), what
// it produces (output), and what it may not do. Item 5's own verification says
// "read those two sections; the do-not-read-the-code sentence must be in the
// first one", so this case cuts the two sections out and asserts inside them —
// never against the whole file. A pin that searched the whole file would pass on
// a prompt that put every anchor in one section and left the other empty, which
// is exactly the failure item 5 exists to stop.
//
// Item 6 is the other half: the round is no longer one per task. That is checked
// in both directions — the new per-milestone wording must be there, and four
// strings of the old per-task wording must be gone.
//
// Three habits from docs/qa/gaps.md are used on purpose:
//   * flat() before every prose match (item 21): this file wraps at 80 columns,
//     so every sentence here crosses two or three lines and a line-by-line grep
//     would read a sentence that is present as absent;
//   * every ABSENT check prints FOUR numbers — flattened/line-by-line times
//     case-sensitive/case-insensitive (item 30) — and asserts all four are 0, so
//     a lower-case copy of an old sentence cannot hide;
//   * every anchor below was counted in roles/qa.md before it was written down
//     (items 27 and 31): the anchors are the source file's own bytes, not the
//     rendered shape of the DoD cell.
//
// Reads one repository file and writes nothing. Same result every run.

import { check, done, flat, repoFile, section } from "../lib/qa.mjs";

const FILE = "roles/qa.md";
const text = repoFile(FILE);
const whole = flat(text);

const JOB_1 = "Job 1: write the case list";
const JOB_2 = "Job 2: write your one case, run it, report it";

// ---------------------------------------------------------------- the two shapes exist

for (const heading of [JOB_1, JOB_2]) {
  const copies = text.split(`\n## ${heading}`).length - 1;
  check(
    `${FILE} has exactly one "## ${heading}" section`,
    copies === 1,
    `found ${copies}`,
  );
}

const shape1 = section(text, JOB_1);
const shape2 = section(text, JOB_2);

console.log(`\nsection lengths: shape 1 = ${shape1.length} characters / ${shape1.split("\n").length} lines,`
  + ` shape 2 = ${shape2.length} characters / ${shape2.split("\n").length} lines\n`);

check(
  "the two sections are really separate, not one section read twice",
  !shape1.includes(JOB_2) && !shape2.includes(JOB_1) && shape1 !== shape2 && shape1.length > 500 && shape2.length > 500,
  `shape 1 is ${shape1.length} characters, shape 2 is ${shape2.length} characters,`
  + ` shape 1 holds the other heading: ${shape1.includes(JOB_2)}, shape 2 holds the other heading: ${shape2.includes(JOB_1)}`,
);

// ------------------------------------------------- input, output, what it must not do
//
// Three things per shape, six checks in all. The failure line names the shape,
// names the thing, and names every anchor that was missing, so a red says
// "shape 2 has no output" and not just "a string is gone".

const SHAPES = [
  {
    name: "shape 1 (the case list)",
    text: shape1,
    things: {
      input: [
        "Read the DoD section of every task the round covers, item by item.",
      ],
      output: [
        "<job folder>/<task-id>-plan.md",
        "Then `report` the list to the PM",
      ],
      "what it must not do": [
        'Do not open the product code — not once, and not "just to see the file names".',
        "You write no case file, and you run nothing.",
      ],
    },
  },
  {
    name: "shape 2 (one case)",
    text: shape2,
    things: {
      input: [
        "You were handed one numbered case off the list.",
      ],
      output: [
        "Write it in `docs/qa/<task-id>/`, one case per file.",
        "`docs/qa/<task-id>/run.sh`",
        "`report` to the PM with:",
      ],
      "what it must not do": [
        "That case, and no other.",
        "report it — do not write it",
      ],
    },
  },
];

for (const shape of SHAPES) {
  const flatShape = flat(shape.text);
  for (const [thing, anchors] of Object.entries(shape.things)) {
    const missing = anchors.filter((anchor) => !flatShape.includes(flat(anchor)));
    check(
      `${shape.name}: ${thing} is written down`,
      missing.length === 0,
      `missing from that section: ${missing.map((anchor) => JSON.stringify(anchor)).join(", ")}`,
    );
  }
}

// ---------------------------------- the do-not-read-the-code sentence belongs to shape 1
//
// Item 5's verification puts this sentence in the FIRST shape. Both halves are
// asserted: it is in shape 1, and it is NOT in shape 2 — a copy pasted into
// shape 2 would make job 2 forbid reading the code it has to test.
//
// The count over the whole file is printed, not asserted. The earlier summary
// section says the same thing in different words ("It does not read the product
// code"), which is legitimate, and a prompt is free to say it again in a third
// place; only a copy inside shape 2 is a defect.

const NO_CODE = 'Do not open the product code — not once, and not "just to see the file names".';
const noCodeCopies = whole.split(flat(NO_CODE)).length - 1;
console.log(`      the do-not-read-the-code sentence: ${noCodeCopies} verbatim copy/copies in the whole file\n`);

check(
  "the do-not-read-the-code sentence is in shape 1 and not in shape 2",
  flat(shape1).includes(flat(NO_CODE)) && !flat(shape2).includes(flat(NO_CODE)),
  `in shape 1: ${flat(shape1).includes(flat(NO_CODE))}, in shape 2: ${flat(shape2).includes(flat(NO_CODE))},`
  + ` ${noCodeCopies} copy/copies in the whole file`,
);

// ----------------------------------------------- item 6: once per milestone, not per task

const PER_MILESTONE = [
  "QA runs **once per milestone**, after all the coding is finished and before the three reviews.",
  "It is not one round per task",
  "there is no such thing as being started because one task just landed",
];

for (const sentence of PER_MILESTONE) {
  check(
    `${FILE} says the round is per milestone: ${JSON.stringify(sentence.slice(0, 46))}`,
    whole.includes(flat(sentence)),
    "not found in the flattened file",
  );
}

// ------------------------------------------------------ item 6: the old wording is gone
//
// Each string below was in roles/qa.md before this task and is a sentence of the
// per-task shape: one QA agent, called when one task landed, writing the plan and
// then reading that task's code. Four numbers per string, all of them 0.

const OLD_PER_TASK = [
  ["the old rule sentence", "Write the test plan from the document, before you read the new code"],
  ["the single task's DoD section", "Read the task's DoD section in"],
  ["the old step 1 heading", "Step 1: the test plan"],
  ["one agent writing the plan and then reading the code", "Only after the plan is written may you read the code"],
];

const countIn = (haystack, needle) => haystack.split(needle).length - 1;
const lineCount = (needle, insensitive) => text.split("\n")
  .filter((line) => (insensitive ? line.toLowerCase() : line).includes(insensitive ? needle.toLowerCase() : needle))
  .length;

for (const [what, sentence] of OLD_PER_TASK) {
  const needle = flat(sentence);
  const counts = {
    "flattened, case-sensitive": countIn(whole, needle),
    "flattened, case-insensitive": countIn(whole.toLowerCase(), needle.toLowerCase()),
    "line by line, case-sensitive": lineCount(needle, false),
    "line by line, case-insensitive": lineCount(needle, true),
  };
  const printed = Object.entries(counts).map(([how, n]) => `${how}: ${n}`).join(", ");
  console.log(`      old wording ${JSON.stringify(sentence)} — ${printed}`);
  check(
    `the old per-task wording is gone (${what})`,
    Object.values(counts).every((n) => n === 0),
    `${JSON.stringify(sentence)} still in ${FILE} — ${printed}`,
  );
}

done();
