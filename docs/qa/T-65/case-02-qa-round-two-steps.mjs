// T-65 DoD items 3 and 4 (PRD M1 DoD item 5; CRD 0023 decision five).
// Proves step 10 of `roles/pm.md` runs QA as ONE round for the whole milestone,
// after the coding and before the three reviews, and that the round has the
// two-step shape decision five settled: first one `crew_qa` that writes only
// the case list and does NOT read the code, then one agent per case in one
// message, then the reports coming back to the PM.
//
// This case judges the shape of the QA round it is itself part of. The case
// list it was written from was produced by the first step (one agent, DoD only,
// no code), and this file was written by one of the second step's agents. So a
// red here means either the prompt lost the shape or the round that produced
// this file was not run that way.
//
// Three things about the method, each one a trap this repository has paid for:
//
// 1. Everything is asked of the step 10 slice (`step(text, 10)`), never of the
//    whole prompt. Step 9 talks about parallel engineers, step 11 writes the
//    Verdicts line and step 15 runs the last doc review, so a whole-file search
//    would pass on text from a step this DoD item is not about. The slice's
//    length is printed so a slice that quietly grew to the whole file is
//    visible in the output rather than hidden behind a green.
// 2. Every prose match is made on the flattened text. The prompt wraps at 80
//    columns and nearly every sentence pinned below crosses a line break, so a
//    line-by-line grep would report "not there" for a sentence that is. The
//    per-line count is printed beside the flattened one for the one ABSENT-shaped
//    count, and a self-test proves the matching used here really does survive a
//    wrap (`docs/qa/gaps.md` item 21).
// 3. Emphasis and backticks are stripped before matching, so moving a `**` or
//    dropping a code span cannot turn a green into a red. What is pinned is the
//    sentence, not its markdown.
//
// What this case does NOT prove: that the round was really run this way in any
// past job (nothing in this repository records how a job's agents were started),
// and that the two reviews' half of step 10 is right — that is
// `docs/qa/T-65/case-01-reviews-once-at-the-end.mjs`.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

/** Drop emphasis and code markers: the sentence is the pin, not its markdown. */
const bare = (text) => text.replace(/[*`]/g, "");

const text = pm();
const ten = step(text, 10);
const plain = bare(flat(ten));

// ---------------------------------------------------------------- the premise
// Every check below reads the step 10 slice, so the slice itself is asserted
// first. A slice that started somewhere else, or that ran to the end of the
// file, would make the rest of this case pass on the wrong text.
check(
  "step(roles/pm.md, 10) really starts at step 10",
  /^10\. \*\*/.test(ten),
  `slice starts with ${JSON.stringify(ten.slice(0, 40))}`,
);
check(
  `the step 10 slice is a slice, not the whole prompt (${ten.length} of ${text.length} char(s), ${ten.split("\n").length} line(s))`,
  ten.length > 3000 && ten.length < text.length / 2,
  `slice ${ten.length} char(s), file ${text.length} char(s)`,
);
check(
  "the step 10 slice stops before step 11",
  !/\n11\. \*\*/.test(ten),
  "the slice runs on into step 11, so anything found below may belong to another step",
);

// ------------------------------------------------- T-65 DoD item 3: one round
// QA runs once per milestone, after the coding, before the reviews. Three
// separate things, because a prompt can say "one round" and still start it in
// the middle of the coding, or after the reviews have already read the code.
check(
  "step 10 says QA runs once per milestone, at the end of it",
  /run once per milestone/.test(plain) && /QA and the three reviews/.test(plain),
  "no sentence in step 10 puts QA at one round per milestone",
);
check(
  "step 10 says nothing in it runs per task",
  /Nothing below runs per task/.test(plain),
  "without this the reader keeps the old per-task QA round and the one-round rule reads as advice",
);
check(
  "the round starts only after the last task landed and the coding is finished",
  /last task of the milestone has landed/.test(plain) && /coding is finished/.test(plain),
  "a round with no start condition can be run while the code is still moving",
);
check(
  "QA is one round, for the whole milestone",
  /one round of QA/.test(plain) && /QA . one round for the whole milestone/.test(plain),
  "10c does not say its round covers the milestone",
);

// QA before the reviews. The order is pinned by position, not by a word: the
// bullet that puts QA first has to come before the bullet that starts the three
// reviews, whatever either one is worded like.
const qaFirst = plain.indexOf("10c first: one round of QA");
const thenThree = plain.search(/Then 10a, 10b and 10d/);
check(
  "step 10 names QA as the first thing in the order",
  qaFirst !== -1,
  "no `10c first: one round of QA` in step 10",
);
check(
  "step 10 starts the three reviews only after that QA round",
  thenThree !== -1 && qaFirst !== -1 && qaFirst < thenThree,
  `QA-first at ${qaFirst}, the three reviews at ${thenThree}`,
);
// The pin T-65 item 7 warned about: `Parallel is the default` used to describe
// three checks starting in one message, QA among them. It must now cover the
// three reviews only, or QA is back inside the parallel batch and "before the
// reviews" means nothing.
check(
  "`Parallel is the default` now covers the three reviews only, not QA",
  /Parallel is the default for those three/.test(plain),
  "the parallel sentence does not say which agents it covers, so QA can be read back into it",
);

// --------------------------------------- T-65 DoD item 4: the two-step shape
// 10c is cut out of step 10 before the shape is counted, so a numbered list
// somewhere else in step 10 cannot be counted as the two steps.
const startC = ten.indexOf("**10c.");
const startD = ten.indexOf("**10d.");
check(
  "step 10 has a 10c block and a 10d block after it",
  startC !== -1 && startD > startC,
  `10c at ${startC}, 10d at ${startD}`,
);
const tenC = startC === -1 ? "" : ten.slice(startC, startD === -1 ? undefined : startD);
const plainC = bare(flat(tenC));
check(
  `the 10c slice is a slice of step 10 (${tenC.length} of ${ten.length} char(s))`,
  tenC.length > 800 && tenC.length < ten.length,
  `10c ${tenC.length} char(s), step 10 ${ten.length} char(s)`,
);

check(
  "10c says the round has two steps and two kinds of QA agent",
  /in two steps/.test(plainC) && /two kinds of QA agent/.test(plainC),
  "a round described as one thing gives the PM no reason to brief the two halves differently",
);

// Exactly two numbered items inside 10c. The block's own heading starts at
// column 0 of its paragraph, and the steps are indented, so requiring leading
// whitespace keeps `10c.` and `10d.` out of the count.
const steps = [...tenC.matchAll(/^[ \t]+(\d+)\.\s+\*\*/gm)].map((m) => Number(m[1]));
check(
  "10c lists exactly two numbered steps, 1 and 2",
  steps.join(",") === "1,2",
  `found ${steps.length}: ${steps.join(",") || "none"}`,
);

// Step one: one agent, the case list only, no code, no case.
check(
  "step one starts exactly one crew_qa, and it writes the case list and nothing else",
  /One crew_qa writes the case list, and nothing else/.test(plainC),
  "step one does not say how many agents it starts or that the list is all it produces",
);
const NO_CODE = "does not read the code";
const flatNoCode = (plainC.match(/does not read the code/g) ?? []).length;
const lineNoCode = tenC.split("\n").filter((line) => bare(line).includes(NO_CODE)).length;
check(
  `step one says the list writer does not read the code (flattened: ${flatNoCode}, per line: ${lineNoCode})`,
  flatNoCode === 1,
  "this is the sentence DoD item 4 names by hand: without it the list writer starts from the code, and a case list written from the code always passes",
);
check(
  "step one says the list writer writes no case",
  /writes no case/.test(plainC),
  "an agent that may also write cases collapses the two steps back into one",
);
check(
  "step one says why the extra round is worth it: the side being measured does not set the questions",
  /side being measured does not set the questions/.test(plainC),
  "CRD 0023 decision five is only defensible with its reason attached; without it the round reads as a wasted turn and gets dropped",
);

// Step one's inputs and outputs, both written down (DoD item 4: "both steps
// have their input and output written").
for (const [what, pattern] of [
  ["the opening document", /paths of the opening document/],
  ["docs/design/tasks.md", /docs\/design\/tasks\.md/],
  ["the task ids with their DoD sections", /task ids with their DoD sections/],
  ["the project's test command", /project's test command/],
  ["the job folder path", /job folder path/],
]) {
  check(
    `step one's briefing names ${what}`,
    pattern.test(plainC),
    `missing from 10c step one: ${what}`,
  );
}
check(
  "step one's output is the plan file in the job folder, one line per case",
  /<job folder>\/<task-id>-plan\.md/.test(plainC) && /one line each/.test(plainC),
  "a step with no named output leaves the PM nothing to read before step two",
);

// Step two: the PM reads the list first, then one agent per case in one message.
check(
  "step two starts only after the PM has read the list",
  /You read the list, then one agent per case/.test(plainC),
  "without the read, the fan-out is not driven by the list and the first step buys nothing",
);
check(
  "step two is one agent per case, all in one message",
  /one agent per case, all in one message/.test(plainC),
  "one agent per case run one after another is the same round without the speed, which is the whole point of decision five",
);
check(
  "step two's output is a real test file under docs/qa/<task-id>/ with a run.sh beside it",
  /real test file/.test(plainC) && /docs\/qa\/<task-id>\//.test(plainC) && /run\.sh beside it/.test(plainC),
  "a case that is not a file in the project's own framework is gone the moment the agent stops",
);

// Step three: the reports come back to the PM, and a report with no case is not
// a report. Decision five's third line.
check(
  "each agent reports the case file it wrote and the totals",
  /reports the case file it wrote and the totals/.test(plainC),
  "the PM cannot collect the round if the report does not say what was written",
);
check(
  "a report with no case file is sent back",
  /A report with no case file is not done/.test(plainC),
  "without this the round can end with agents that reported instead of writing",
);

// The two steps in order inside 10c.
const one = plainC.indexOf("One crew_qa writes the case list");
const two = plainC.indexOf("You read the list, then one agent per case");
check(
  "the list-writing step is written before the one-agent-per-case step",
  one !== -1 && two !== -1 && one < two,
  `step one at ${one}, step two at ${two}`,
);

// ------------------------------------------------------------ the self-test
// Proof that the matching used above cannot be fooled by a line break, which is
// what would make every check here green whatever the prompt said.
const wrapped = "It does **not read the\n      code** and it writes **no case**.";
check(
  "the matching used here finds a pinned sentence even when it wraps across lines",
  bare(flat(wrapped)).includes(NO_CODE) && !bare(wrapped).includes(NO_CODE),
  "flattening plus stripping emphasis is what makes these checks able to fail",
);

done();
