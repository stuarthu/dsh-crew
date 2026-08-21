// T-66 DoD item 4 (PRD M1 DoD item 9, requirement B3): the milestone-review
// answer in step 12 of `roles/pm.md` is named for what the user gets, its body
// names BOTH step 13 and step 16, and it spells out every separate yes.
//
// WHY THIS ONE MATTERS MORE THAN A WORDING CHECK.
// The old answer was called `Ship this milestone` and its body said "do step 13,
// then come back here and treat it as `go on`". Step 13 only writes the release
// plan and the upgrade plan; nothing it writes reaches a single user. The push,
// the tag push and the publish command all live in step 16. So one honest
// reading of the old answer was "the user just said ship it" — and acting on that
// reading puts a package on a registry that the user never agreed to release, and
// a published version cannot be taken back. That is the cost of getting this one
// wrong, which is why the case pins the pointer, the meaning AND all three yeses
// rather than only the new name.
//
// WHAT IT ASSERTS
//   1. `Ship this milestone` is gone: 0 occurrences in the flattened text,
//      IGNORING CASE.
//   2. Step 12 still asks one question with four answers, and the first of them
//      is the release-to-users one.
//   3. The answer bullet carries the new name.
//   4. Its body names step 13 and names step 16 — both, in the same body.
//   5. Its body says why it is two steps: writing a plan reaches nobody, and
//      step 16 is what reaches users.
//   6. Its body spells out the three yeses: one for the push of a work branch or
//      of `main`, a separate loud one for the tag push, and one of its own for
//      the publish command.
//   7. Its body says that a yes to this answer is none of those three. Without
//      that sentence the answer is still an instruction to ship.
//   8. Step 16 REALLY IS the push step, and step 13 REALLY IS the plans step.
//
// WHY 8 IS PART OF THE CASE AND NOT DECORATION.
// A pointer is worth exactly as much as the step it points at. Renumbering the
// prompt's steps would leave the digits "13" and "16" sitting in the answer while
// they pointed somewhere else, and no count of the string "step 16" would notice.
// T-64's case-03 pins the same idea for the sentence in step 1; this case does it
// for both pointers, so a renumbering has to go red here.
//
// WHY EVERY MATCH IS ON FLATTENED TEXT, AND WHY THE COUNT IGNORES CASE.
// Both halves are load-bearing here, and this file's real history proves it:
//   - the answer body breaks the line right inside the pointer ("step 13" at the
//     end of one line, "and step 16" at the start of the next), and the question
//     sentence breaks inside "release this milestone to / users", so a line-based
//     grep for either phrase reads 0 on a file that plainly says it;
//   - before T-66, `Ship this milestone` appeared TWICE — once capitalised as the
//     answer's title and once lower-case inside the question sentence. A
//     case-sensitive count saw only one of the two, so a fix that renamed the
//     title and forgot the question would have turned the DoD's own command to 0
//     while the old name was still in the file. T-66's engineer reported this.
// So the count below is made on flattened, lower-cased text, and every run prints
// all four numbers (flattened and line-based, with and without case) so a future
// reader can see for themselves which greps would have lied.
//
// Reads one file: `roles/pm.md`. Everything it breaks, it breaks inside a
// throwaway copy of the repository, which it removes again. It writes nothing
// anywhere else and touches no network.

import { pm, step, flat, check, done, tempRepo, cleanUp, copyFile, edit, put } from "../lib/qa.mjs";

const OLD_ANSWER = "Ship this milestone";
const ANSWER = "- **Release this milestone to users**";
const PLANS_STEP = 13;
const PUSH_STEP = 16;
const REVIEW_STEP = 12;

// ------------------------------------------------------------------ counting

/** How often `phrase` appears: flattened and line by line, with and without case. */
function counts(text, phrase) {
  const lower = phrase.toLowerCase();
  const flatText = flat(text);
  return {
    flattened: flatText.split(phrase).length - 1,
    flattenedAnyCase: flatText.toLowerCase().split(lower).length - 1,
    byLine: text.split("\n").filter((line) => line.includes(phrase)).length,
    byLineAnyCase: text.toLowerCase().split("\n").filter((line) => line.includes(lower)).length,
  };
}

/** The flattened body of the answer bullet: from its title to the next bullet. */
function answerBody(reviewStep) {
  const flatStep = flat(reviewStep);
  const at = flatStep.indexOf(ANSWER);
  if (at === -1) return "";
  const next = flatStep.indexOf("- **", at + ANSWER.length);
  return next === -1 ? flatStep.slice(at) : flatStep.slice(at, next);
}

/** Text around the first match of `needle`, so a qualifier before it is still in view. */
function near(text, needle, before = 140, after = 140) {
  const found = needle.exec(text);
  if (found === null) return "";
  return text.slice(Math.max(0, found.index - before), found.index + found[0].length + after);
}

// ------------------------------------------------------------------ the audit
//
// One pure function over the file's text, so the very same judgement runs against
// the deliberately broken copies below. A case that judges the real file with one
// body of code and proves it can fail with another proves nothing about the code
// that runs in the suite.

const ID = {
  oldGone: `the old answer name "${OLD_ANSWER}" is gone from roles/pm.md (flattened, any case)`,
  stepCut: `roles/pm.md still has a step ${REVIEW_STEP}`,
  fourAnswers: `step ${REVIEW_STEP} asks one question whose four answers open with releasing to users`,
  answerThere: "the answer is named for what the user gets: releasing this milestone to users",
  names13: `the answer's body names step ${PLANS_STEP}`,
  names16: `the answer's body names step ${PUSH_STEP}`,
  why: "the body says why it is two steps: a plan reaches nobody, step 16 is what reaches users",
  yesBranch: "the body asks for a yes of its own for the push of a work branch or of `main`",
  yesTag: "the body asks for a separate, loud yes for the tag push",
  yesPublish: "the body asks for a yes of its own for the publish command",
  notAYes: "the body says a yes to this answer is none of those three yeses",
  pushStep: `step ${PUSH_STEP} really is the push step both pointers rely on`,
  plansStep: `step ${PLANS_STEP} really is the release-and-upgrade-plans step`,
};

function audit(text) {
  const results = [];
  const add = (id, ok, detail = "") => results.push({ id, ok, detail });

  const seen = counts(text, OLD_ANSWER);
  add(
    ID.oldGone,
    seen.flattenedAnyCase === 0,
    `${seen.flattenedAnyCase} occurrence(s) flattened ignoring case, ${seen.flattened} flattened `
      + `with case, ${seen.byLineAnyCase} line by line ignoring case, ${seen.byLine} line by line `
      + `with case. The old answer named step ${PLANS_STEP} only, and step ${PLANS_STEP} writes plans `
      + `and reaches nobody, so one honest reading of it jumps to step ${PUSH_STEP} and publishes a `
      + "package the user never asked to release. A count above 0 here means that name is back in the "
      + "file. Note the four numbers: whenever they disagree, every grep that reads the smaller one "
      + "is lying about this file.",
  );

  let reviewStep = null;
  let cutError = "";
  try {
    reviewStep = step(text, REVIEW_STEP);
  } catch (error) {
    cutError = String(error?.message ?? error);
  }
  add(
    ID.stepCut,
    reviewStep !== null,
    `${cutError} — the milestone review moved or was renumbered, so the answer could not be judged `
      + "where T-66 put it. Everything below is about that step and nowhere else in the file.",
  );

  const flatStep = flat(reviewStep ?? "");
  const question = near(flatStep, /four answers:/i, 0, 220);
  add(
    ID.fourAnswers,
    /four answers:/i.test(flatStep) && /release this milestone to users/i.test(question),
    "the question sentence no longer offers four answers opening with releasing this milestone to "
      + `users: ${JSON.stringify(question.slice(0, 220))}. This sentence wraps in the file, so a `
      + "line-based grep for it reads 0 — it is matched on flattened text on purpose.",
  );

  const body = answerBody(reviewStep ?? "");
  add(
    ID.answerThere,
    body !== "",
    `step ${REVIEW_STEP} has no "${ANSWER}" bullet. B3 asks for the answer to be named for what the `
      + "user gets, so a name that does not say 'to users' is the defect this case exists for.",
  );

  add(
    ID.names13,
    new RegExp(`step ${PLANS_STEP}\\b`, "i").test(body),
    `the answer's body never names step ${PLANS_STEP}, the step that writes the two plans: `
      + JSON.stringify(body.slice(0, 260)),
  );
  add(
    ID.names16,
    new RegExp(`step ${PUSH_STEP}\\b`, "i").test(body),
    `the answer's body never names step ${PUSH_STEP}, the step that actually reaches users. This is `
      + "the exact shape of the old answer, and it is the reading that ends in a published package: "
      + JSON.stringify(body.slice(0, 260)),
  );
  add(
    ID.why,
    /reaches nobody|reaches no one/i.test(body) && /reaches users/i.test(body),
    "the body names two steps but does not say which of them reaches users and which reaches nobody, "
      + `so the pointer to step ${PLANS_STEP} can still be read as shipping: `
      + JSON.stringify(body.slice(0, 260)),
  );

  add(
    ID.yesBranch,
    /one for the push of/i.test(body) && /branch/i.test(body) && body.includes("`main`"),
    "the body does not ask for a yes of its own for the branch or `main` push: "
      + JSON.stringify(body.slice(0, 260)),
  );
  const tagWindow = near(body, /tag push|tag\b/i);
  add(
    ID.yesTag,
    /(separate|its own|loud)/i.test(tagWindow),
    "the tag push has no separate, loud yes of its own in this body — and a tag push here is what "
      + `starts the publishing workflow: ${JSON.stringify(tagWindow.slice(0, 260))}`,
  );
  const publishWindow = near(body, /publish/i);
  add(
    ID.yesPublish,
    /(its own|separate|another|one of its own)/i.test(publishWindow),
    "the publish command has no yes of its own in this body, which is the yes B3 is about: "
      + JSON.stringify(publishWindow.slice(0, 260)),
  );
  add(
    ID.notAYes,
    /a yes to this answer/i.test(body)
      && /(none of the three|none of those|not one of|is not a yes for|does not cover)/i.test(body),
    "the body never says that answering this question is NOT one of those three yeses. Without that "
      + "sentence the answer still reads as the user's permission to ship: "
      + JSON.stringify(body.slice(0, 260)),
  );

  // Both pointers are only worth something while the steps they name still do
  // what the body says they do. A renumbering would leave the digits behind.
  let pushStep = "";
  try {
    pushStep = flat(step(text, PUSH_STEP));
  } catch { pushStep = ""; }
  add(
    ID.pushStep,
    /push/i.test(pushStep) && /permission/i.test(pushStep) && /publish/i.test(pushStep),
    `step ${PUSH_STEP} of roles/pm.md is not the push-with-permission-and-publish step the answer `
      + `points at, so the pointer sends the reader to the wrong place: ${JSON.stringify(pushStep.slice(0, 200))}`,
  );
  let plansStep = "";
  try {
    plansStep = flat(step(text, PLANS_STEP));
  } catch { plansStep = ""; }
  add(
    ID.plansStep,
    /release/i.test(plansStep) && /upgrade/i.test(plansStep) && /plan/i.test(plansStep),
    `step ${PLANS_STEP} of roles/pm.md is not the release-and-upgrade-plans step the answer points `
      + `at: ${JSON.stringify(plansStep.slice(0, 200))}`,
  );

  return results;
}

// --------------------------------------------------------------- the real file

const text = pm();
const before = counts(text, OLD_ANSWER);
const reviewStep = (() => { try { return step(text, REVIEW_STEP); } catch { return ""; } })();
const pushStepText = (() => { try { return step(text, PUSH_STEP); } catch { return ""; } })();

console.log(
  `      "${OLD_ANSWER}" in roles/pm.md: ${before.flattened} flattened with case, `
    + `${before.flattenedAnyCase} flattened any case, ${before.byLine} line by line with case, `
    + `${before.byLineAnyCase} line by line any case`,
);
console.log(
  `      cut sizes: step ${REVIEW_STEP} ${flat(reviewStep).length} chars flattened `
    + `(${reviewStep.split("\n").length} lines), step ${PUSH_STEP} ${flat(pushStepText).length} chars `
    + `flattened (${pushStepText.split("\n").length} lines), answer body `
    + `${answerBody(reviewStep).length} chars`,
);

for (const result of audit(text)) check(result.id, result.ok, result.detail);

// ----------------------------------------------------------------- mutations
//
// Three breakages, each in its own throwaway copy of the repository, proving this
// audit goes red on exactly the things it claims to guard. Without them the case
// is a green light with no bulb in it. Every failure a mutation causes is printed
// as a `red:` line, so the report can quote the words a reader would really see.

/** Break one file of a fresh copy and return which audit checks failed. */
function afterBreaking(label, breakIt) {
  const dir = tempRepo();
  try {
    breakIt(dir);
    const broken = copyFile(dir, "roles/pm.md");
    const failed = audit(broken).filter((result) => !result.ok);
    for (const result of failed) {
      console.log(`      red: ${label}: ${result.id}\n           ${result.detail.slice(0, 240)}`);
    }
    return { failed: failed.map((result) => result.id), broken };
  } finally {
    cleanUp(dir);
  }
}

// Mutation 1: the old answer name comes back, exactly as it was before T-66.
const renamed = afterBreaking("mutation 1", (dir) => {
  edit(dir, "roles/pm.md", ANSWER, `- **${OLD_ANSWER}**`);
});
check(
  "mutation 1: bringing the old `Ship this milestone` answer back turns this case red",
  renamed.failed.includes(ID.oldGone) && renamed.failed.includes(ID.answerThere),
  `failed checks were ${JSON.stringify(renamed.failed)} — the old name was put back in the copy and `
    + "this case still passed on it",
);

// Mutation 2: the pointer rots. Every mention of the push step inside the answer
// body is turned into the plans step, which is the old, dangerous shape: an
// answer that names the step writing plans and never the step that reaches
// users. Nothing else in the file moves, so only the body's pointer is on trial.
const rotted = afterBreaking("mutation 2", (dir) => {
  const whole = copyFile(dir, "roles/pm.md");
  const at = whole.indexOf(ANSWER);
  if (at === -1) throw new Error(`mutation anchor not found: ${ANSWER}`);
  const end = whole.indexOf("\n    - **", at + ANSWER.length);
  if (end === -1) throw new Error("the answer bullet has no bullet after it — the file's shape moved");
  const body = whole.slice(at, end);
  const rewritten = body.replace(/([Ss])tep 16/g, `$1tep ${PLANS_STEP}`);
  if (rewritten === body) throw new Error("the answer body names no step 16, so there was nothing to rot");
  put(dir, "roles/pm.md", whole.slice(0, at) + rewritten + whole.slice(end));
});
check(
  `mutation 2: taking the step ${PUSH_STEP} pointer out of the answer turns this case red`,
  rotted.failed.includes(ID.names16),
  `failed checks were ${JSON.stringify(rotted.failed)} — the body was left naming only the plans `
    + "step, which is the reading that publishes a package, and this case still passed on it",
);

// Mutation 3: only a LOWER-CASE copy of the old name comes back, and it comes
// back WRAPPED across two lines — which is exactly how the second occurrence hid
// in this file before T-66. A case-sensitive grep reads 0. A line-based grep
// reads 0. Only a flattened, case-insensitive count sees it, and this case must.
const sneaked = afterBreaking("mutation 3", (dir) => {
  edit(
    dir,
    "roles/pm.md",
    "with these four answers: release this milestone to\n    users,",
    "with these four answers: ship this\n    milestone, release this milestone to\n    users,",
  );
});
const after = counts(sneaked.broken, OLD_ANSWER);
console.log(
  `      mutation 3 put it back lower-case and wrapped: ${after.flattened} flattened with case, `
    + `${after.flattenedAnyCase} flattened any case, ${after.byLine} line by line with case, `
    + `${after.byLineAnyCase} line by line any case`,
);
check(
  "mutation 3: a lower-case, line-wrapped copy of the old name turns this case red",
  sneaked.failed.includes(ID.oldGone),
  `failed checks were ${JSON.stringify(sneaked.failed)}`,
);
check(
  "mutation 3: only the flattened, case-insensitive count sees it — which is why nothing here counts "
    + "line by line or with case",
  after.flattenedAnyCase === before.flattenedAnyCase + 1
    && after.flattened === before.flattened
    && after.byLine === before.byLine
    && after.byLineAnyCase === before.byLineAnyCase,
  `flattened any case ${before.flattenedAnyCase} -> ${after.flattenedAnyCase}, flattened with case `
    + `${before.flattened} -> ${after.flattened}, line by line any case ${before.byLineAnyCase} -> `
    + `${after.byLineAnyCase}, line by line with case ${before.byLine} -> ${after.byLine}. The `
    + "mutation must add exactly one flattened case-insensitive hit and nothing else; a case-sensitive "
    + "or line-based count that moved means it did not really hide, and proves nothing.",
);

done();
