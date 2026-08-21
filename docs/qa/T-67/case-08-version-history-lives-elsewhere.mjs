// T-67 DoD item 2 (PRD M1 DoD item 14, first half): `roles/pm.md` says version
// history does not go in the PRD, AND the same sentence names BOTH of the two
// places it lives instead — the `Applied` line of a CRD, and the git history.
//
// WHY THIS CASE EXISTS. The user asked for it in their own words: "too long,
// history version should not be in the same prd." That request has two halves. The
// second half — no version list inside a `prd-*.md` — is
// `case-09-no-version-list-in-a-prd.mjs`. This case is the first half: the RULE in
// the PM's own prompt, which is what stops the next PRD growing the list again.
//
// THE THING THAT MAKES THIS CASE MORE THAN A KEYWORD SEARCH: "NAMES BOTH".
// T-67's DoD cell 2 asks the prompt to say WHERE it lives instead — the `Applied`
// line of every CRD, and the git history — and its verification column requires
// that the sentence name both `Applied` and git history. Asking only whether the
// two words appear ANYWHERE in step 4 is far too weak: step 4 is over 12,000
// characters, `Applied` could sit in the block about corrections and `git history`
// in a bullet about milestones, and the check would still be green while the rule
// itself had been cut in half. A reader who only reaches "not in the PRD" and never
// learns where it IS instead has been told nothing usable.
//
// SO "TOGETHER" IS DEFINED HERE, AND THE DEFINITION IS THE POINT OF THE CASE:
//
//   1. slice step 4 only (`step(text, 4)`), never the whole file;
//   2. flatten it, so a sentence that wraps across lines is still one sentence
//      (`docs/qa/gaps.md` item 21 — the trap that bit this job seven times);
//   3. strip the markdown emphasis markers (see the paragraph on item 27 below);
//   4. split what is left into SENTENCES on `.`/`!`/`?` followed by whitespace —
//      the separator is written here on purpose, the way `T-60/case-09` splits one
//      table row on `;`, its own separator;
//   5. require ONE SINGLE SENTENCE to name both destinations (BOTH_IN_ONE_SENTENCE
//      below), and require that sentence to sit next to the sentence that says
//      version history stays out of the PRD (at most one sentence apart).
//
// The separator deliberately does NOT include `:` or `;`. "Version history does not
// go in the PRD: it lives in the `Applied` line of each CRD and in the git history"
// is a perfectly good wording, and splitting on a colon would tear it in half and
// go red on correct prose — a false red is worse than no pin.
//
// THE PRICE OF THE ONE-SENTENCE RULE, SAID OUT LOUD. A future wording that split
// the two destinations into two adjacent sentences ("It is already in the CRD's
// `Applied` line. It is also in the git history.") would be refused by this pin
// even though it means the same thing. That is deliberate and it is this
// repository's declared style for prose (`ADR 0004`, `ADR 0007`): whoever changes
// the wording comes here and widens the rule to a two-sentence window IN THE SAME
// COMMIT, with a reason. What is not allowed is widening it to "both words
// somewhere in step 4", which is the check this case was written to replace.
//
// `docs/qa/gaps.md` ITEM 27, HANDLED. The anchor the DoD hands over is `Applied`
// as it RENDERS. In `docs/design/tasks.md` it is written `**Applied**`, in T-67's
// verification column it is written with backticks, and in `roles/pm.md` today it
// is `**Applied**`. A pin that copied any one of those spellings byte for byte
// could never fail. So every marker character is stripped before matching, and the
// last check below prints what a copied-from-the-document pin would have found.
//
// SCOPE, SO NOTHING IS CLAIMED THAT IS NOT CHECKED. This case reads exactly one
// file, `roles/pm.md`, and asserts nothing about any `prd-*.md` (that is case-09)
// and nothing about whether the rule is a GOOD rule. It checks that the rule is
// written, in step 4, with both of its destinations, together.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const STEP = 4;
const raw = step(pm(), STEP);

// Flatten first (item 21), then drop the markdown markers that make an anchor
// copied from a rendered document unfindable (item 27).
const flatStep = flat(raw);
const text = flatStep.replace(/[`*_\\]/g, "");

// The separator, written down once so the rule is auditable: end-of-sentence
// punctuation followed by whitespace. Nothing else splits a sentence here.
const SENTENCE_SPLIT = /(?<=[.!?])\s+/;
const sentences = text.split(SENTENCE_SPLIT).map((one) => one.trim()).filter(Boolean);

// The three things the rule has to say, each as its own predicate.
const NEGATION = /\b(?:does not|do not|doesn't|never|not|no)\b/i;
const saysStaysOut = (s) => /version history/i.test(s) && /\bPRD\b/.test(s) && NEGATION.test(s);
// Destination one: the `Applied` line OF A CRD. `Applied` on its own names no
// place, so the sentence has to say which document's line it is.
const namesApplied = (s) => /\bApplied\b/.test(s) && /\bCRDs?\b/.test(s);
// Destination two: the git history, in the DoD's own words.
const namesGitHistory = (s) => /\bgit history\b/i.test(s);

console.log(`note  step ${STEP} of roles/pm.md is ${raw.length} chars raw, ${text.length} chars flattened and stripped, ${sentences.length} sentence(s)`);

check(
  `step ${STEP} of roles/pm.md was sliced and holds real prose`,
  raw.length > 500 && sentences.length > 5,
  `only ${raw.length} chars and ${sentences.length} sentence(s) — the step's shape moved, so this case would be testing nothing`,
);

const statementAt = sentences.findIndex(saysStaysOut);

check(
  `step ${STEP} says version history stays out of the PRD`,
  statementAt !== -1,
  "no sentence in step 4 carries all three of \"version history\", \"PRD\" and a negation"
    + ` (${NEGATION.source}). The rule the user asked for is gone from the PM's prompt.`,
);

// The heart of the case: ONE sentence, BOTH destinations.
const bothAt = sentences.findIndex((one) => namesApplied(one) && namesGitHistory(one));
const appliedAnywhere = sentences.some(namesApplied);
const gitAnywhere = sentences.some(namesGitHistory);

check(
  "one single sentence of step 4 names BOTH places version history lives: the `Applied` line of a CRD, and the git history",
  bothAt !== -1,
  `no one sentence carries both destinations. Across the whole of step ${STEP}:`
    + ` a CRD's \`Applied\` line is named in ${sentences.filter(namesApplied).length} sentence(s),`
    + ` the git history in ${sentences.filter(namesGitHistory).length} sentence(s).`
    + ` MISSING: ${[!appliedAnywhere ? "the CRD's `Applied` line" : null, !gitAnywhere ? "the git history" : null].filter(Boolean).join(" and ") || "neither — both are in step 4, but never in the same sentence, so the reader is never told the two places together"}.`,
);

// And that sentence has to belong to the rule, not sit somewhere else in step 4.
check(
  "the sentence naming both places is the rule's own sentence or the one right next to it",
  statementAt !== -1 && bothAt !== -1 && Math.abs(bothAt - statementAt) <= 1,
  `the "stays out of the PRD" sentence is #${statementAt} and the sentence naming both places is #${bothAt}`
    + ` — ${statementAt === -1 || bothAt === -1 ? "one of them is missing" : `${Math.abs(bothAt - statementAt)} sentences apart, so they no longer read as one rule`}`,
);

// gaps.md item 27, demonstrated on this case's own anchor: a pin that copied the
// spelling out of `docs/design/tasks.md` would look for a backticked or a bolded
// word and find nothing. The stripped text finds it whatever the markers are.
const strippedHits = text.split("Applied").length - 1;
const backtickedHits = flatStep.split("`Applied`").length - 1;
const boldedHits = flatStep.split("**Applied**").length - 1;

check(
  "the `Applied` anchor is found after markers are stripped, at least as often as any single copied-from-the-document spelling",
  strippedHits >= 1 && strippedHits >= backtickedHits && strippedHits >= boldedHits,
  `stripped ${strippedHits}, backticked ${backtickedHits}, bolded ${boldedHits}`,
);

console.log(
  `note  "Applied" in step ${STEP}: ${strippedHits} hit(s) with markers stripped,`
  + ` ${backtickedHits} as \`Applied\`, ${boldedHits} as **Applied**`
  + `${strippedHits > backtickedHits || strippedHits > boldedHits ? " — a pin copying one rendered spelling would MISS a hit (gaps.md item 27)" : ""}`,
);

// Count-it-twice (gaps.md item 21), on this case's other anchor.
//
// PRINTED, NOT ASSERTED — AND THAT IS A FIX, NOT A RELAXATION. This used to carry
// `check(flatCount >= lineCount)`, and that could not fail. The anchor is the
// two words `version history` with one single space between them, so a line that
// matches still matches after `flat()` has collapsed that file's whitespace, and
// joining two lines can only ADD a match. The inequality was a restatement of the
// two lines above it, not a claim about `roles/pm.md` — `docs/qa/gaps.md` item 21,
// the `crew-qa-C42` note: an assertion that only restates the necessary result of
// the code above it is not an assertion. What a reader needs is the two numbers,
// and the two numbers are still printed.
const flatCount = flatStep.split(/version history/i).length - 1;
const lineCount = raw.split("\n").filter((line) => /version history/i.test(line)).length;

console.log(
  `note  "version history" appears ${flatCount} time(s) flattened and ${lineCount} time(s) on a single line`
  + `${flatCount > lineCount ? " — it wraps, so a line-based grep on it would MISS a hit" : ""}`,
);

done();
