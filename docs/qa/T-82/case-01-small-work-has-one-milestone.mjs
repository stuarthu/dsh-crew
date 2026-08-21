// T-82 DoD items 1, 2, 3 and 4 — `roles/pm.md` must say ONE thing about whether
// small work has a milestone: it has exactly one, the job itself.
//
// What this case proves:
//
//   item 1  the cancelled wording `small work has none` is gone, and step 4's
//           short-PRD paragraph says a short PRD needs NO section listing
//           milestones (only big work needs it);
//   item 2  the cancelled wording `small work has no milestones` is gone, and the
//           `## The state file` section says small work's `milestones` array
//           holds one entry, not zero;
//   item 3  the two places AGREE — the number each of them states for small
//           work's milestones is the same number, and that number is one;
//   item 4  step 1's sentence `No matter how small a change is, it gets a
//           milestone` is still there, exactly once, and still inside the
//           `## Step 1: pick a lane, every time` section.
//
// WHY ITEM 3 IS ITS OWN ASSERTION, AND WHY IT IS NOT A PROXY.
// The bug T-82 fixed was not a missing sentence. It was two sentences that each
// read fine on their own and contradicted each other: step 1 said every change
// gets a milestone while step 4 and the state file section said small work has
// none. A case that only asked "does each place mention milestones?" would have
// been green through the whole contradiction. So the number is pulled out of each
// segment separately and compared, and mutation 2 below changes ONE of the two
// numbers and nothing else: items 1 and 2 stay green there and only item 3 goes
// red. That is the only way to show this assertion has teeth.
//
// WHY EVERY COUNT IS FLATTENED AND CASE-INSENSITIVE, MEASURED NOT ASSUMED.
// All three strings were counted four ways against the real file before this case
// was written (flattened/line-by-line x case-sensitive/case-insensitive), and two
// of the four readings are dead:
//
//   `small work has none`            0 / 0 / 0 / 0   (removed by T-82)
//   `small work has no milestones`   0 / 0 / 0 / 0   (removed by T-82)
//   `no matter how small ... milestone`  flattened+insensitive 1, EVERYTHING
//                                    ELSE 0 — the sentence wraps after `No`
//                                    (roles/pm.md lines 338-339) and the file
//                                    writes it capitalised.
//
// So a line-based grep for item 4's sentence reads 0, and a case-sensitive grep
// for it reads 0. Both of those would look like "the sentence was deleted" while
// it sits right there. `docs/qa/gaps.md` items 21, 28 and 30 are the three traps,
// all three live in this one string, and that is why this case prints all four
// numbers for all three strings on every run rather than only the one it asserts.
//
// KNOWN OVERLAP, DELIBERATE, REPORTED.
// `docs/qa/T-64/case-03-every-change-gets-a-milestone.mjs` already pins the two
// zero counts, and pins the short substring `it gets a milestone` inside the lane
// section together with the three reviews. This case does NOT repeat the reviews.
// It keeps the two zero counts, because they are T-82's own DoD items 1 and 2 and
// T-82's folder should carry its own pin, and it adds the three things case-03
// does not do: the exact-one count of the WHOLE sentence, the two segments really
// sliced out of the file rather than matched against the whole of it (case-03
// matches both of its replacement sentences against `flat(text)`, so either one
// could move to any other step and stay green), and the agreement assertion.
//
// Reads one file: `roles/pm.md`. Writes nothing outside throwaway copies of the
// repository, which it removes again. No network.

import { pm, step, section, flat, check, done, tempRepo, cleanUp, copyFile, edit } from "../lib/qa.mjs";

const LANE_HEADING = "Step 1: pick a lane, every time";
const STATE_HEADING = "The state file";
const PRD_STEP = 4;

// The two wordings T-82 removed. Neither may come back, in any capitalisation,
// and neither may hide by wrapping across a line.
const BANNED = ["small work has none", "small work has no milestones"];

// The sentence T-82 was forbidden to touch. Counted case-insensitively on
// purpose: the file capitalises the first word and the DoD writes it lowercase.
const KEPT = "no matter how small a change is, it gets a milestone";

// ------------------------------------------------------------------ counting

/** All four readings of one string, so a dead one cannot be mistaken for a zero. */
function counts(text, phrase) {
  const oneLine = flat(text);
  const lower = phrase.toLowerCase();
  return {
    flatSensitive: oneLine.split(phrase).length - 1,
    flatInsensitive: oneLine.toLowerCase().split(lower).length - 1,
    lineSensitive: text.split("\n").filter((line) => line.includes(phrase)).length,
    lineInsensitive: text.toLowerCase().split("\n").filter((line) => line.includes(lower)).length,
  };
}

const show = (phrase, seen) =>
  `      ${JSON.stringify(phrase)}: flattened ${seen.flatInsensitive} (case-sensitive `
  + `${seen.flatSensitive}), line by line ${seen.lineInsensitive} (case-sensitive ${seen.lineSensitive})`;

/** Drop the markdown emphasis marks, so `**one**` and `one` read the same. */
const bare = (text) => flat(text).replace(/[`*_]/g, "");

/**
 * The number this segment states for small work's milestones, as the word the
 * file actually uses (`one`, `no`, `two`, `zero`, …), or null when the segment
 * says nothing about it.
 *
 * Returning the word rather than a boolean is the point: the failure message can
 * then print what each of the two segments said, which is the whole content of
 * DoD item 3. A boolean would only say "they disagree".
 */
function statedCount(segment) {
  const found = /small work has (?:only )?([a-z0-9]+) milestone/i.exec(bare(segment));
  return found === null ? null : found[1].toLowerCase();
}

// ------------------------------------------------------------------ the audit
//
// One pure function over the file's text, so the identical judgement runs against
// the deliberately broken copies below. A case that asserts on the real file with
// one body of code and proves it can fail with another proves nothing about the
// code the suite runs.

const ID = {
  kept: `step 1's sentence ${JSON.stringify(KEPT)} appears exactly once`,
  keptInStep1: `that sentence is inside the "## ${LANE_HEADING}" section`,
  step4: `step ${PRD_STEP} says a short PRD needs no section listing milestones`,
  stateFile: `the "## ${STATE_HEADING}" section says the \`milestones\` array holds one entry, not zero`,
  agree: `step ${PRD_STEP} and "## ${STATE_HEADING}" state the SAME number of milestones for small work, and it is one`,
};
const banned = (phrase) => `the cancelled wording ${JSON.stringify(phrase)} is gone from roles/pm.md`;

/** Slice a part of the file, or report why it could not be sliced. */
function slice(cut) {
  try {
    return { text: cut(), error: "" };
  } catch (error) {
    return { text: "", error: String(error?.message ?? error) };
  }
}

function audit(text) {
  const results = [];
  const add = (id, ok, detail = "") => results.push({ id, ok, detail });

  // --- items 1 and 2: the two cancelled wordings ---------------------------
  for (const phrase of BANNED) {
    const seen = counts(text, phrase);
    add(
      banned(phrase),
      seen.flatInsensitive === 0,
      `${seen.flatInsensitive} occurrence(s) flattened and case-insensitive, ${seen.lineInsensitive} `
        + "line by line. This is one of the two sentences T-82 removed because it contradicts step 1. "
        + "A flattened count above a line-based one means the sentence wraps and every line-based grep "
        + "for it is lying; a case-insensitive count above a case-sensitive one means it came back in "
        + "different capitalisation.",
    );
  }

  // --- item 4: the sentence T-82 was forbidden to touch --------------------
  const kept = counts(text, KEPT);
  add(
    ID.kept,
    kept.flatInsensitive === 1,
    `${kept.flatInsensitive} occurrence(s) flattened and case-insensitive (case-sensitive `
      + `${kept.flatSensitive}, line by line ${kept.lineInsensitive}). T-82 DoD item 4 requires exactly `
      + "one: this is the rule A1d put in step 1, and it is the sentence the other two places used to "
      + "contradict. Zero means it was edited or deleted; more than one means it was duplicated instead "
      + "of the duplicate being removed.",
  );

  const lane = slice(() => section(text, LANE_HEADING));
  add(
    ID.keptInStep1,
    lane.text !== "" && flat(lane.text).toLowerCase().includes(KEPT),
    lane.error
      ? `${lane.error} — the lane section moved or was renamed, so the sentence could not be judged `
        + "where A1d put it"
      : "the sentence exists somewhere in roles/pm.md but not in the lane section. A count over the "
        + "whole file cannot tell that apart from the rule being in the right place.",
  );

  // --- item 1, second half: step 4's short-PRD paragraph -------------------
  //
  // The segment is really cut out of the file. Matching this against the whole
  // flattened file instead would stay green with the sentence moved to any other
  // step, which is the hole this case exists to close.
  const prd = slice(() => step(text, PRD_STEP));
  const prdFlat = bare(prd.text);
  add(
    ID.step4,
    prd.text !== ""
      && /No section listing milestones/i.test(prdFlat)
      && /Only big work needs that section/i.test(prdFlat),
    prd.error
      ? `${prd.error} — step ${PRD_STEP} was renumbered or its bold opener changed, so the short-PRD `
        + "paragraph could not be judged"
      : `step ${PRD_STEP} (${prd.text.length} characters) does not say both halves of T-82 DoD item 1: `
        + "that a short PRD carries no section listing milestones, AND that only big work needs that "
        + `section. What it says around small work: ${JSON.stringify(prdFlat.slice(prdFlat.toLowerCase().indexOf("small work"), prdFlat.toLowerCase().indexOf("small work") + 260))}`,
  );

  // --- item 2, second half: the state file section -------------------------
  const state = slice(() => section(text, STATE_HEADING));
  const stateFlat = bare(state.text);
  add(
    ID.stateFile,
    state.text !== ""
      && /milestones array holds one entry/i.test(stateFlat)
      && /not zero/i.test(stateFlat),
    state.error
      ? `${state.error} — the state file section was renamed, so its milestones sentence could not be `
        + "judged"
      : `the "## ${STATE_HEADING}" section (${state.text.length} characters) does not say small work's `
        + "`milestones` array holds one entry, not zero. Before T-82 this section told the PM to leave "
        + "the key out altogether, which is the contradiction with step 1.",
  );

  // --- item 3: the two places agree ---------------------------------------
  const inPrd = statedCount(prd.text);
  const inState = statedCount(state.text);
  add(
    ID.agree,
    inPrd !== null && inPrd === inState && inPrd === "one",
    `step ${PRD_STEP} states ${JSON.stringify(inPrd)} and "## ${STATE_HEADING}" states `
      + `${JSON.stringify(inState)} (null means the segment says nothing about how many milestones `
      + "small work has). T-82 DoD item 3 is that every place saying this says the SAME thing. The bug "
      + "being guarded is not a missing sentence: it is two sentences that each read fine alone while "
      + "one said one milestone and the other said none.",
  );

  return results;
}

// -------------------------------------------------------------- the real file

const text = pm();

for (const phrase of [...BANNED, KEPT]) console.log(show(phrase, counts(text, phrase)));

const laneLength = slice(() => section(text, LANE_HEADING)).text.length;
const prdLength = slice(() => step(text, PRD_STEP)).text.length;
const stateLength = slice(() => section(text, STATE_HEADING)).text.length;
console.log(
  `      segments sliced out of roles/pm.md: step ${PRD_STEP} ${prdLength} characters, `
    + `"## ${STATE_HEADING}" ${stateLength} characters, "## ${LANE_HEADING}" ${laneLength} characters`,
);
console.log(
  `      number each segment states for small work: step ${PRD_STEP} -> `
    + `${JSON.stringify(statedCount(slice(() => step(text, PRD_STEP)).text))}, "## ${STATE_HEADING}" -> `
    + `${JSON.stringify(statedCount(slice(() => section(text, STATE_HEADING)).text))}`,
);

for (const result of audit(text)) check(result.id, result.ok, result.detail);

// ---------------------------------------------------------------- mutations
//
// Three breakages, each in its own throwaway copy of the repository, proving this
// case goes red on exactly what it claims to guard. Without them it is a green
// light with no bulb in it.

/** Break one file of a fresh copy and return which audit checks failed, plus the text. */
function afterBreaking(breakIt) {
  const dir = tempRepo();
  try {
    breakIt(dir);
    const broken = copyFile(dir, "roles/pm.md");
    return { failed: audit(broken).filter((r) => !r.ok).map((r) => r.id), broken };
  } finally {
    cleanUp(dir);
  }
}

// Mutation 1: the contradiction comes back WRAPPED across a line break AND in a
// different capitalisation — the two ways `docs/qa/gaps.md` items 28 and 30 say a
// zero-count grep gets fooled. The line-based and case-sensitive counts must both
// stay at zero while this case goes red, which is what makes the flattened
// case-insensitive count the only honest reading.
const backWrapped = afterBreaking((dir) => {
  edit(
    dir,
    "roles/pm.md",
    "Milestone states:",
    "Leave `milestones` out for small work — Small Work Has No\nMilestones.\n\nMilestone states:",
  );
});
const reintroduced = counts(backWrapped.broken, "small work has no milestones");
console.log(
  "      mutation 1 put it back wrapped and capitalised: flattened case-insensitive "
    + `${reintroduced.flatInsensitive}, flattened case-sensitive ${reintroduced.flatSensitive}, `
    + `line by line ${reintroduced.lineInsensitive}`,
);
check(
  "mutation 1: the contradiction coming back wrapped and capitalised turns this case red",
  backWrapped.failed.includes(banned("small work has no milestones")),
  `failed checks were ${JSON.stringify(backWrapped.failed)} — the sentence is back in the copy and this `
    + "case passed on it",
);
check(
  "mutation 1: only the flattened case-insensitive count sees it — the other three read zero",
  reintroduced.flatInsensitive === 1
    && reintroduced.flatSensitive === 0
    && reintroduced.lineInsensitive === 0
    && reintroduced.lineSensitive === 0,
  `flattened case-insensitive ${reintroduced.flatInsensitive}, flattened case-sensitive `
    + `${reintroduced.flatSensitive}, line by line ${reintroduced.lineInsensitive} / `
    + `${reintroduced.lineSensitive}. The mutation must be invisible to three of the four readings; if a `
    + "line-based or case-sensitive count moved, it did not reproduce the trap and proves nothing about "
    + "why this case flattens and lower-cases.",
);

// Mutation 2: change ONE of the two numbers and nothing else. This is the
// isolating mutation for DoD item 3: items 1 and 2 must stay green — the banned
// wordings are still absent, step 4 still says a short PRD needs no milestone
// section, the state file still says the array holds one entry — and the
// agreement assertion must be the only thing that goes red.
const disagree = afterBreaking((dir) => {
  edit(
    dir,
    "roles/pm.md",
    "small work has **one** milestone, this job itself",
    "small work has **two** milestones, this job and its follow-up",
  );
});
check(
  "mutation 2: the two places stating different numbers turns this case red",
  disagree.failed.includes(ID.agree),
  `failed checks were ${JSON.stringify(disagree.failed)} — step ${PRD_STEP} was changed to say two `
    + "milestones while the state file section still says one, and this case passed on it",
);
check(
  "mutation 2: item 3 is not a proxy — it is the ONLY check that mutation 2 turns red",
  disagree.failed.length === 1 && disagree.failed[0] === ID.agree,
  `failed checks were ${JSON.stringify(disagree.failed)}. Exactly one is expected. More than one means `
    + "the other assertions are also reading the number, so a green agreement check would be riding on "
    + "them instead of standing on its own; none means the disagreement is invisible here.",
);

// Mutation 3: edit the sentence T-82 was forbidden to touch. The exact-one count
// must catch it. Note the anchor carries the real line break of roles/pm.md: this
// sentence wraps after `No`, so an anchor written on one line would not be found
// and `edit` would throw instead of mutating.
const keptGone = afterBreaking((dir) => {
  edit(
    dir,
    "roles/pm.md",
    "It is cancelled. No\nmatter how small a change is, it gets a milestone",
    "It is cancelled. Whenever a change lands, it gets a milestone",
  );
});
check(
  "mutation 3: rewording step 1's protected sentence turns this case red",
  keptGone.failed.includes(ID.kept) && keptGone.failed.includes(ID.keptInStep1),
  `failed checks were ${JSON.stringify(keptGone.failed)} — the sentence T-82 DoD item 4 forbids touching `
    + "was reworded in the copy and this case passed on it",
);

done();
