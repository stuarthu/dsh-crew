// T-66 DoD item 1 (PRD M1 DoD item 9, requirement B1): step 11 of `roles/pm.md`
// still refuses a file no task owns, AND right next to that refusal it says the
// documents the playbook itself asks the PM to write are the expected exception
// and still go into a commit.
//
// WHY THIS ONE IS NOT A PLAIN "IS THE STRING THERE" CASE.
// Step 11 used to say only "If a file changed that no task owns, stop. Show the
// user the file and ask." — while the opening document, the HLD, every ADR and
// CRD and `docs/design/tasks.md` are owned by no task row at all. So the very
// first commit of every job walks into that rule. B1's answer was NOT to delete
// the rule: the rule catches a file nobody was asked to touch, which is the
// thing worth stopping for. The answer was to keep the rule and write the
// exception beside it. That makes this an "A is there, AND B is next to A" case,
// and both halves have to be able to fail:
//
//   * pin only `no task owns` and the case passes on the old, broken text;
//   * pin only "the exception sentence exists somewhere" and the case passes
//     with the sentence parked at the far end of step 11, four screens below the
//     rule, where a PM reading the rule never meets it. A rule and its exception
//     that are not read together are not an exception.
//
// HOW "NEXT TO" IS DECIDED HERE, AND WHY. Step 11 is cut out first with
// `step(text, 11)` — never searched for in the whole file, because `roles/pm.md`
// talks about staging, commits and task ownership in several steps. That slice
// is then cut into BLOCKS: one block per top-level bullet, and one per
// blank-line-separated paragraph. The pass criterion, written as
// `PROXIMITY_BLOCKS = 1` below, is that every anchor of the exception must sit in
// a block whose index is within 1 of the block holding `no task owns` — the same
// bullet, the bullet before it, or the bullet after it.
//
// Three reasons for that criterion rather than a character count:
//
//   1. The unit is the file's own structure. `roles/pm.md` is prose wrapped at 80
//      columns, so a character or line budget would have to be re-tuned every
//      time somebody rewrites a sentence, while "the next bullet" survives any
//      rewrap. A limit that needs re-tuning is a limit that gets loosened.
//   2. It matches how the file is read. Step 11's rules are a bullet list; a
//      reader who has just read the rule reads the bullet under it. A sentence
//      two bullets away, or down inside the Verdicts prose that fills the rest of
//      step 11, is not read with the rule.
//   3. It rejects most of the step. Step 11 holds 16 blocks today and the
//      exception sits 1 block from the rule, so the criterion accepts at most 3
//      of the 16 possible homes and refuses the other 13. `SELF_GUARD` below
//      fails the case if that ever stops being true, because a proximity check
//      whose window is the whole step proves nothing.
//
// The shape is borrowed from `docs/qa/T-60/case-09-prd-and-hld-exist-now.mjs`,
// which cuts one table row out and then cuts that row into cells so that a name
// and its description have to be in the SAME cell. Same idea, one size up: cut
// the step out, cut it into blocks, and require the rule and its exception to be
// in the same block or in touching blocks.
//
// EVERY MATCH IS MADE ON FLATTENED TEXT. The exception sentence wraps across
// lines in the source ("belong to no task," ends line 1), so a line-by-line grep
// for it finds nothing and any line-based pin here would be born dead — the trap
// that bit this job eight times (`docs/qa/gaps.md` item 21). The counts printed
// below therefore give the flattened count and the line-based count side by
// side: where they differ, the phrase wraps and only the flattened number is
// telling the truth.
//
// THE ONE ANCHOR THIS TASK'S DoD HANDS OVER, CHECKED AGAINST THE SOURCE.
// The DoD cell verifies item 1 with `grep -o 'no task owns'`. That string was
// read back out of `roles/pm.md` before this case was written — it is there,
// once, on one line, with no backtick or escaping in it, so it is safe to copy
// (`docs/qa/gaps.md` item 27: an anchor quoted from a document may be the
// rendered form, not the source form). Every other anchor below was taken from
// the source file itself, not from the DoD.
//
// This case reads the repository and writes nothing.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

/** How many blocks apart the rule and its exception may be. See the header. */
const PROXIMITY_BLOCKS = 1;

const text = pm();
const eleven = step(text, 11);
const flatStep = flat(eleven);

/**
 * Step 11 as blocks: one per top-level bullet, one per blank-line-separated
 * paragraph. This is the unit "next to" is measured in.
 */
function blocks(slice) {
  const out = [];
  let current = [];
  const flush = () => {
    if (current.join(" ").trim() !== "") out.push(current.join("\n"));
    current = [];
  };
  for (const line of slice.split("\n")) {
    if (line.trim() === "" || /^\s*-\s/.test(line)) flush();
    if (line.trim() !== "") current.push(line);
  }
  flush();
  return out;
}

/** How many times a pattern matches the flattened text, and how many lines hold it. */
function counts(slice, pattern) {
  const global = new RegExp(pattern.source, `${pattern.flags.replace("g", "")}g`);
  const flatHits = (flat(slice).match(global) ?? []).length;
  const lineHits = slice.split("\n").filter((line) => pattern.test(line)).length;
  return { flatHits, lineHits };
}

const RULE = /no task owns/i;

// The exception, as the four things it has to say plus the action it has to
// keep. Each one is a meaning, matched loosely enough that a rewording of the
// sentence does not go red, and tightly enough that no other sentence in the
// window satisfies it.
const EXCEPTION = [
  ["the playbook itself asks for these documents", /playbook[^.]{0,60}\b(tells|told|asks|asked|requires)\b/i],
  // Deliberately NOT `/no task owns/`: that is the rule's own wording, so an
  // anchor allowing it would be satisfied by half A and could never fail on its
  // own. The first mutation run below caught exactly that.
  ["they belong to no task", /(belongs?|belonging) to no task|no task row (ever )?owns/i],
  ["that is expected", /\b(is|are) expected\b/i],
  ["so it is not a reason to stop", /not a reason to stop|do not stop|never a reason to stop/i],
  ["and they are staged anyway", /\b(stage|staged|staging|commit) them\b/i],
];

const parts = blocks(eleven);
const ruleBlock = parts.findIndex((block) => RULE.test(flat(block)));
const low = ruleBlock - PROXIMITY_BLOCKS;
const high = ruleBlock + PROXIMITY_BLOCKS;
const window = parts.slice(Math.max(0, low), high + 1);
const flatWindow = flat(window.join("\n"));

console.log(
  `step 11: ${eleven.length} chars, ${flatStep.length} flattened, ${eleven.split("\n").length} lines, ${parts.length} blocks`,
);
console.log(
  `window: blocks ${Math.max(0, low)}..${Math.min(parts.length - 1, high)} of 0..${parts.length - 1}, ${window.length} block(s), ${flatWindow.length} flattened chars`,
);

// -------------------------------------------------------------- the premise

check(
  "step 11 of roles/pm.md is still the Commit step",
  /^11\. \*\*Commit\.\*\*/.test(flatStep),
  `step 11 opens: ${JSON.stringify(flatStep.slice(0, 80))}`,
);

// ------------------------------------------------------------------ half A

const ruleCounts = counts(eleven, RULE);
check(
  "step 11 still refuses a file no task owns (the rule itself is kept)",
  ruleCounts.flatHits >= 1 && ruleBlock !== -1,
  `flattened hits ${ruleCounts.flatHits}, line hits ${ruleCounts.lineHits}, block index ${ruleBlock}`,
);
console.log(`rule: 'no task owns' — flattened ${ruleCounts.flatHits}, line-based ${ruleCounts.lineHits}, block ${ruleBlock}`);

// -------------------------------------------------- the criterion is not vacuous

check(
  "the proximity window is a small part of step 11, so passing it means something",
  parts.length >= 6 && window.length <= 2 * PROXIMITY_BLOCKS + 1 && flatWindow.length < flatStep.length / 2,
  `${parts.length} block(s) in step 11, window ${window.length} block(s), ${flatWindow.length} of ${flatStep.length} flattened chars`,
);

// ------------------------------------------------------------------ half B

for (const [what, pattern] of EXCEPTION) {
  const inStep = pattern.test(flatStep);
  check(
    `step 11 says: ${what}`,
    inStep,
    `no match for ${pattern} anywhere in step 11 — the exception sentence is missing, not merely misplaced`,
  );
  check(
    `and it says it next to the rule (within ${PROXIMITY_BLOCKS} block): ${what}`,
    pattern.test(flatWindow),
    inStep
      ? `found in step 11 but outside blocks ${Math.max(0, low)}..${high}: block(s) ${parts
          .map((block, index) => (pattern.test(flat(block)) ? index : -1))
          .filter((index) => index !== -1)
          .join(", ")} — the rule is in block ${ruleBlock}, so a reader of the rule never meets this sentence`
      : "the sentence is missing from step 11 altogether",
  );
}

done();
