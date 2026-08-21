// T-67 DoD item 1 and DoD item 3 (PRD M1: the short-version half of item 13, and
// item 14's neighbourhood): step 4 of `roles/pm.md` really tells a PM what a PRD
// holds — priority with a cut order, release criteria, a target time window — and
// really keeps the DoD split in two halves, the milestone's and the task row's.
//
// WHAT THE USER ASKED FOR, IN THEIR OWN WORDS: "so that pm knows how to write prd
// correctly". That request lands in exactly one place a PM reads while writing a
// PRD — step 4 of its own prompt. Everything below is read inside that step.
//
// WHERE THE THREE THINGS COME FROM. `docs/research/document-types.md` section 1.2
// quotes Marty Cagan, *How To Write a Good PRD* (`(c) 2005 Silicon Valley Product
// Group`) line by line, and three of the things it names were missing from this
// repository's own practice: the prioritization step with its rank inside each
// class (so that a slipping schedule cuts the right items and not the easy ones),
// the six non-functional release criteria, and a schedule given as a target window
// with a reason rather than a random date. T-67 DoD item 1 names those same three
// and asks that each of them be readable in step 4 and point back to the entry
// `principles.md` carries. Both halves are checked here.
//
// THE DIVISION OF LABOUR WITH `docs/qa/T-63/case-09-eight-document-types.mjs`.
// That case owns the LONG version: it counts the eight subsections of
// `principles.md`'s `## What each kind of document holds` and requires a source in
// each. This case owns the SHORT version in `roles/pm.md` step 4, plus the one
// thing neither of those two can see on its own: that the two say the SAME thing.
// So the three anchors below are looked up in step 4 and then again in the PRD
// entry of that principles section — set-compared for the six bars — and nothing
// here re-counts subsections or re-reads citations. Two cases pinning one fact
// would mean two files to edit for one legitimate move, and the second would add
// nothing.
//
// WHY THE STEP IS SLICED OUT FIRST. `roles/pm.md` is over 1700 lines and mentions
// PRDs, milestones and DoD sections in many steps. A hit anywhere in the file
// would not prove a PM reading step 4 can see any of this, which is what the DoD
// item asks. `step(text, 4)` slices from `4. **` to the next numbered step and
// throws when there is no step 4, so a renumbered prompt dies loudly instead of
// quietly searching an empty string. The length of the slice is printed, so a
// slice that silently shrank to a few characters is visible in the output rather
// than hidden behind a row of green.
//
// WHY EVERY READ IS FLATTENED. Step 4 is prose wrapped at 80 columns, and most of
// the anchors below cross a line break in the source: the cut-order sentence, the
// two DoD halves, the "target window" clause. `docs/qa/gaps.md` item 21 is this
// trap, and this repository has gone red for it seven times. `flat()` collapses
// every run of whitespace first, so where the line happens to wrap decides
// nothing. How many of the anchors need that is printed below as a fact, not
// asserted: an editor who reflows the file must not make this case red for it.
//
// ONE ANCHOR THE DoD GIVES THAT THIS CASE DOES NOT USE, AND WHY. T-67 DoD item 1
// quotes Cagan as `schedules often slip and you may well be forced to cut some
// features`. That exact sentence is in neither `roles/pm.md` nor
// `docs/research/document-types.md` — the research file's verbatim quotes on the
// same point are "implement the easy features first" and "The prioritization helps
// you to know what to cut". Pinning the DoD's wording would be a check that could
// never go green, which is `docs/qa/gaps.md` item 27 in the other direction. So the
// anchor used here is the sentence that really carries the meaning in step 4, and
// the mismatch is reported to the PM rather than edited into any document.
//
// WHAT THIS CASE DELIBERATELY DOES NOT ASSERT.
//   * Not that step 4 is short, and not how long it is. "PRD variable is too long"
//     was the user's complaint about a PRD, not about the prompt, and no number
//     for the prompt exists in any document.
//   * Not the version-history sentence and not where version history lives. That
//     is T-67 DoD item 2, and `case-08-version-history-lives-elsewhere.mjs` owns it.
//   * Not the file-name shape `docs/design/prd-<date>-<job-slug>.md`. That is DoD
//     item 4, owned by its own case.
//   * Not whether a cited source really says what an entry claims. No script can
//     read a PDF and judge that; `docs/qa/gaps.md` keeps it written down.
//
// THE PLAN LINE FILED THIS CASE UNDER "PRD M1 DoD item 14". Item 14's own subject
// is that version history is not in the PRD, which is C-40's case; the "what a PRD
// holds" substance sits in item 13's short-version half and in T-67's items 1 and
// 3. The header above names the items this case really reads, and the mismatch is
// in the report.

import { check, done, flat, pm, repoFile, section, step } from "../lib/qa.mjs";

const STEP = step(pm(), 4);
const STEP_FLAT = flat(STEP);
const PM_FLAT = flat(pm());

// The PRD entry of the long version: the first `### ` subsection of that section.
const principlesPrd = () => {
  const whole = section(repoFile("principles.md"), "What each kind of document holds");
  const first = whole.indexOf("### ");
  if (first === -1) throw new Error("`## What each kind of document holds` has no `### ` subsection at all");
  const next = whole.indexOf("### ", first + 4);
  const entry = next === -1 ? whole.slice(first) : whole.slice(first, next);
  if (!/^### PRD/.test(entry)) {
    throw new Error(`the first subsection of that section is not the PRD entry: ${JSON.stringify(entry.slice(0, 60))}`);
  }
  return flat(entry);
};
const PRD_ENTRY = principlesPrd();

console.log(`step 4 of roles/pm.md: ${STEP.length} characters, ${STEP_FLAT.length} once flattened`);
console.log(`principles.md PRD entry: ${PRD_ENTRY.length} characters once flattened`);

// The six release criteria, named in the source and repeated in both documents.
const SIX_BARS = ["Performance", "Scalability", "Reliability", "Usability", "Supportability", "Localizability"];

// The three things T-67 DoD item 1 asks for, each with the anchors that carry it
// in step 4 and the anchors that carry the same thing in the principles entry.
// Every `name` below is written so the FAIL line says which of the three is
// missing, without the reader opening this file.
const THINGS = [
  {
    name: "priority and the cut order",
    step: [
      "**Prioritize.**",
      "`must-have`, `high-want`, `nice-to-have`",
      "rank inside its class, from 1 to n",
      "schedules slip, something has to be cut, and with no ranking the easy items survive instead of the right ones",
      "Nothing ships while one `must-have` is unfinished.",
    ],
    principles: ["Prioritize", "must-have", "high-want", "nice-to-have", "rank-order each requirement, from 1 to n"],
  },
  {
    name: "release criteria, the six non-functional bars",
    step: ["**Release criteria**", "non-functional bars", ...SIX_BARS],
    principles: ["Release criteria", "non-functional bars", ...SIX_BARS],
  },
  {
    name: "the schedule as a target time window",
    step: ["**Schedule**", "target window", "never a date picked at random"],
    principles: ["Schedule", "target window", "not a random date"],
  },
];

const missingFrom = (text, anchors) => anchors.filter((anchor) => !text.includes(anchor));

for (const thing of THINGS) {
  const gone = missingFrom(STEP_FLAT, thing.step);
  check(
    `step 4 of roles/pm.md tells the PM about ${thing.name}`,
    gone.length === 0,
    `missing from step 4: ${gone.map((anchor) => JSON.stringify(anchor)).join(", ")}`,
  );

  const goneToo = missingFrom(PRD_ENTRY, thing.principles);
  check(
    `the PRD entry of principles.md carries ${thing.name} too, so step 4's short version points back to it`,
    goneToo.length === 0,
    `missing from the PRD entry: ${goneToo.map((anchor) => JSON.stringify(anchor)).join(", ")}`,
  );
}

// The two documents must name the SAME six bars. Presence in each one separately
// would still pass if step 4 kept five of them and invented a sixth of its own.
const barsIn = (text) => SIX_BARS.filter((bar) => text.includes(bar));
const inStep = barsIn(STEP_FLAT);
const inEntry = barsIn(PRD_ENTRY);
check(
  "the six release-criteria bars are the same six in step 4 and in principles.md",
  inStep.length === SIX_BARS.length && inEntry.length === SIX_BARS.length,
  `step 4 has ${inStep.length} of them (${inStep.join(", ") || "none"}), the PRD entry has ${inEntry.length} (${inEntry.join(", ") || "none"})`,
);

// ---------------------------------------------------------- the DoD, in two halves

const nameCount = (text) => (text.match(/DoD section/g) || []).length;
const inPm = nameCount(PM_FLAT);
const inStep4 = nameCount(STEP_FLAT);
console.log(`"DoD section" appears ${inPm} time(s) in flat roles/pm.md, ${inStep4} of them inside step 4`);

check(
  'flat roles/pm.md still calls it a "DoD section" (T-67 DoD item 3, and tools/verify-mount.mjs pins the name)',
  inPm >= 1,
  `flat roles/pm.md | grep -o 'DoD section' | wc -l is ${inPm}`,
);
check(
  'step 4 itself calls it a "DoD section", so the PM meets the name where it writes the document',
  inStep4 >= 1,
  `"DoD section" appears ${inStep4} time(s) inside step 4`,
);

check(
  "step 4 says where each half lives: one in the milestone, one in the task row",
  STEP_FLAT.includes("Every milestone carries a DoD section") && STEP_FLAT.includes("every task row carries a DoD section"),
  `milestone half named: ${STEP_FLAT.includes("Every milestone carries a DoD section")}; task-row half named: ${STEP_FLAT.includes("every task row carries a DoD section")}`,
);

check(
  'step 4 keeps the milestone half of a check — what "done" means, in the user\'s words',
  STEP_FLAT.includes('what "done" means'),
  'step 4 does not say the milestone\'s section states what "done" means',
);

const howMissing = missingFrom(STEP_FLAT, ["how somebody else checks it", "the exact command"]);
check(
  "step 4 keeps the task-row half of a check — how somebody else checks it, with the exact command",
  howMissing.length === 0,
  `missing from step 4: ${howMissing.map((anchor) => JSON.stringify(anchor)).join(", ")} — with this half gone, a DoD item states a standard nobody can run`,
);

const bothMissing = missingFrom(STEP_FLAT, ["two halves", "both of them stay in the repository"]);
check(
  "step 4 says the two are two halves of one check and that both stay in the repository",
  bothMissing.length === 0,
  `missing from step 4: ${bothMissing.map((anchor) => JSON.stringify(anchor)).join(", ")}`,
);

const splitMissing = missingFrom(PRD_ENTRY, [
  "the milestone's DoD says what done means, the task row says how it is checked",
]);
check(
  "principles.md draws the same two-half line, so the short and the long version agree (ADR 0015)",
  splitMissing.length === 0,
  `missing from the PRD entry: ${splitMissing.map((anchor) => JSON.stringify(anchor)).join(", ")}`,
);

// Printed, never asserted: how many anchors would be invisible to a line-based
// hunt. It shows the flattening is doing real work here; a reflow of the file may
// change the number and must not turn this case red.
const wrapped = [...THINGS.flatMap((thing) => thing.step), "how somebody else checks it", "both of them stay in the repository"]
  .filter((anchor) => STEP_FLAT.includes(anchor) && !STEP.includes(anchor));
console.log(`${wrapped.length} of the anchors above cross a line break in the source and are only findable once flattened`);

done();
