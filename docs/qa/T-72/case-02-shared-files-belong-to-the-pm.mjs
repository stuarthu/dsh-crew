// T-72 DoD items 7 and 8 (PRD requirement B6): in `roles/qa.md` the two SHARED
// files — `docs/qa/run-all.sh` and `docs/qa/gaps.md` — have changed owner. Both
// paths are still in the prompt, but their identity is now "the PM's file, which
// you report lines to" instead of "a file you write", and the prompt spells out
// the reason: many QA agents run at the same time, the last write wins, and
// nothing says a word.
//
// WHY THIS ONE MATTERS, AND WHY IT IS ABOUT THIS VERY ROUND.
// A QA round under the new shape starts many `crew_qa` agents at once, in one
// working tree. `docs/qa/gaps.md` and `docs/qa/run-all.sh` are one copy each,
// serving every task. If each agent wrote its own lines into them, they would
// write the same file at the same time and the last writer would win — and no
// runner, no exit code and no check would say a single word about the lines that
// vanished. That is the failure mode this rule exists for, and it is silent, so
// nothing except the prompt itself stands between the crew and it.
//
// WHY IT IS A PAIR OF NAILS AND NOT ONE.
// Two opposite mistakes break this rule, so a single assertion cannot hold it:
//   - deleting the two paths from the prompt. `tools/verify-mount.mjs` REQUIRES
//     them to be in `roles/qa.md`, and QA still has to know both facts about
//     them, so an over-eager fix that removes them is a defect of its own
//     (DoD item 8 says so in as many words).
//   - keeping the paths and quietly keeping the old identity. Every count of
//     both paths stays green while the prompt still tells QA to write them.
// So this case asserts the paths are PRESENT, asserts the ownership claim is
// ABSENT, and asserts the new identity is stated. Mutation 1 below removes only
// the identity half and leaves both paths untouched: without the paired nails
// that mutation is invisible.
//
// WHAT IT ASSERTS
//   1. `are the one who writes it there` is gone: 0 occurrences, flattened AND
//      ignoring case. All four numbers are printed.
//   2. A reverse anchor really is present, so a 0 above cannot come from a file
//      that was never read (see the note on `flat` below).
//   3. `docs/qa/gaps.md` appears at least once.
//   4. `docs/qa/run-all.sh` appears at least once.
//   5. The shared-file block can still be cut out of the prompt.
//   6. The ownership table's row for `docs/qa/gaps.md` says the file is the PM's
//      and does not say it is QA's.
//   7. The same for the row for `docs/qa/run-all.sh`.
//   8. The block says QA never writes either file.
//   9. The block says QA reports the lines and the PM writes them.
//  10. THE REASON IS REALLY THERE, AS STRUCTURE: one single paragraph of that
//      block carries all four parts of it — more than one writer, at the same
//      time, the last write wins, and no error. "Because they are shared" alone
//      must fail this.
//  11. No sentence naming either shared path claims that QA writes or owns it.
//  12. No text just after a mention of `docs/qa/run-all.sh` tells QA to write
//      that file when it is missing — which is exactly what the prompt said
//      before T-72.
//  13. Both paths appear in the numbered list of things QA may NOT touch, inside
//      the `## What you may write` section.
//
// WHY 10 IS A STRUCTURE CHECK AND NOT A STRING.
// DoD item 7 asks for the reason to be written down, and a reason is worth
// nothing when it is "because these files are shared" — that sentence gives a
// reader no way to see the cost, so the next person weighs it against being one
// turn faster and writes the file anyway. The three parts that make it a reason
// are the concurrency, the lost write and the SILENCE. So all four slots must
// land in ONE paragraph: scattering the words over the whole prompt does not
// pass, and neither does a paragraph that keeps only the word "shared".
//
// WHY EVERY MATCH IS ON FLATTENED TEXT, WHY THE COUNT IGNORES CASE, AND WHY
// THERE IS A REVERSE ANCHOR.
// This prompt is prose wrapped near 79 columns, so a line-based grep for any
// phrase longer than a few words reads 0 on a file that plainly says it. The
// count also ignores case, because a capitalised copy of a forbidden phrase is
// still that phrase in a prompt a model reads (`docs/qa/gaps.md` item 30). And
// the DoD item's own command is written `flat roles/qa.md | grep -o '...' | wc
// -l` — `flat` is NOT a program on this machine, so pasting that command prints
// `flat: command not found` and then a 0, a green that read nothing at all
// (`docs/qa/gaps.md` item 28). Check 2 exists so this file can never be that
// kind of green: it demands a string the prompt really does contain, so a 0 in
// check 1 is a fact about the prompt and not about an empty read.
//
// Reads one file: `roles/qa.md`. Everything it breaks, it breaks inside a
// throwaway copy of the repository, which it removes again. It writes nothing
// anywhere else and touches no network.

import { repoFile, flat, check, done, tempRepo, cleanUp, copyFile, edit } from "../lib/qa.mjs";

const TARGET = "roles/qa.md";

/** The phrase that carried the old ownership, gone since T-72. */
const OLD_CLAIM = "are the one who writes it there";

/**
 * A string the prompt must really contain. Its only job is to prove the text
 * was read, so a 0 for OLD_CLAIM means something. Checked verbatim against the
 * source file before this case was written.
 */
const READ_PROOF = "what I could not test here, and why";

const GAPS = "docs/qa/gaps.md";
const RUN_ALL = "docs/qa/run-all.sh";

// ------------------------------------------------------------------- reading

/** Collapse whitespace and drop the markdown markers, so a nail cannot miss on `*` or a backtick. */
const bare = (text) => flat(text).replace(/[`*_\\]/g, "");

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

/** Every count as one readable line, so a reader can see which greps would lie. */
const fourNumbers = (seen) =>
  `${seen.flattened} flattened with case, ${seen.flattenedAnyCase} flattened any case, `
  + `${seen.byLine} line by line with case, ${seen.byLineAnyCase} line by line any case`;

/**
 * The block that carries the ownership rule: from the table row naming
 * `docs/qa/run-all.sh` down to the next `## ` heading. Scoped on purpose — the
 * reason has to sit beside the rule it explains, not somewhere else in the file.
 */
function sharedBlock(text) {
  const lines = text.split("\n");
  const start = lines.findIndex((line) => /^\s*\|\s*`docs\/qa\/run-all\.sh`/.test(line));
  if (start === -1) return "";
  let end = start + 1;
  while (end < lines.length && !/^##\s/.test(lines[end])) end += 1;
  return lines.slice(start, end).join("\n");
}

/** The row of the ownership table whose first cell names `path`, as bare cells. */
function ownershipRow(text, path) {
  const line = text
    .split("\n")
    .find((candidate) => /^\s*\|/.test(candidate) && candidate.includes(`\`${path}\``));
  if (line === undefined) return null;
  return bare(line).split("|").map((cell) => cell.trim()).filter((cell) => cell !== "");
}

/** Every sentence of the prompt, bare, with table rows cut apart as their own pieces. */
const sentences = (text) =>
  bare(text)
    .split(/(?<=[.!?;])\s+/)
    .flatMap((piece) => piece.split(/(?=\| )/));

/**
 * The numbered list of things QA may not touch, inside `## What you may write`.
 * Continuation lines are joined back on, so a path on the second line of an item
 * still counts.
 */
function forbiddenList(text) {
  const lines = text.split("\n");
  const heading = lines.findIndex((line) => /^##\s+What you may write/.test(line));
  if (heading === -1) return "";
  let at = -1;
  for (let index = heading + 1; index < lines.length; index += 1) {
    if (/^##\s/.test(lines[index])) break;
    if (/may not/i.test(lines[index])) { at = index; break; }
  }
  if (at === -1) return "";
  const items = [];
  for (let index = at + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim() === "") { if (items.length > 0) continue; else continue; }
    if (/^\d+\.\s/.test(line) || /^\s+\S/.test(line)) { items.push(line); continue; }
    break;
  }
  return bare(items.join(" "));
}

// ------------------------------------------------------ the four reason slots
//
// Four separate readings of the same sentence, kept apart so a failure names the
// half that went missing rather than "the reason is gone".

const SLOTS = [
  { name: "more than one writer", test: /(many|two|several|more than one)\s+(qa\s+)?(agents?|qa)\b/i },
  { name: "at the same time", test: /at the same time|at once|in parallel|concurrently|simultaneously/i },
  { name: "the last write wins", test: /last write would win|last write wins|latest write wins|later write wins|second (writer|one|write) wins/i },
  { name: "and no error", test: /nothing would say a word|nothing says a word|no error|without (an )?error|says nothing|not even an error/i },
];

/** The bare paragraph of `block` carrying the most reason slots, and which ones. */
function bestReasonParagraph(block) {
  let best = { hit: [], missing: SLOTS.map((slot) => slot.name), text: "" };
  for (const paragraph of block.split(/\n\s*\n/)) {
    const flatParagraph = bare(paragraph);
    const hit = SLOTS.filter((slot) => slot.test.test(flatParagraph)).map((slot) => slot.name);
    if (hit.length > best.hit.length) {
      best = {
        hit,
        missing: SLOTS.filter((slot) => !slot.test.test(flatParagraph)).map((slot) => slot.name),
        text: flatParagraph,
      };
    }
  }
  return best;
}

// ------------------------------------------------------------ ownership claims
//
// The ABSENT half. Each pattern is one way of saying "this file is yours to
// write", and each is checked only inside a sentence that names one of the two
// shared paths — the prompt is full of sentences about files that ARE QA's, and
// those must stay. The first pattern is the wording the prompt really carried
// before T-72; the others are the ways the same claim can come back.

const CLAIMS = [
  /you are the one who write/i,
  /you write (it|them|either|that file|those)/i,
  /which you write/i,
  /\b(is|are) yours\b/i,
  /yours to write/i,
  /you own\b/i,
  /you maintain\b/i,
  /you update\b/i,
  /written by you\b/i,
  /you (also )?add (the )?(line|lines|entr)/i,
];

/** Sentences naming a shared path that claim QA writes or owns it. */
function ownershipClaims(text) {
  const shared = /docs\/qa\/(gaps\.md|run-all\.sh)/;
  const found = [];
  for (const sentence of sentences(text)) {
    if (!shared.test(sentence)) continue;
    for (const claim of CLAIMS) {
      if (claim.test(sentence)) found.push(`${claim} in ${JSON.stringify(sentence.slice(0, 160))}`);
    }
  }
  return found;
}

/**
 * The old rule, which lived just after a mention of the shared runner:
 * "If it is missing, write it once." The window looks FORWARD only — the
 * paragraph before this one is about QA's own `run.sh`, which QA may still write
 * when it is missing, and that sentence must not be mistaken for this one.
 */
const OLD_RUNNER_RULES = [/if it is missing,? write it/i, /write it once/i, /do not edit it again/i];

function oldRunnerRule(text) {
  const flatText = bare(text);
  const found = [];
  let at = 0;
  while ((at = flatText.indexOf(RUN_ALL, at)) !== -1) {
    const window = flatText.slice(at, at + 240);
    for (const rule of OLD_RUNNER_RULES) {
      if (rule.test(window)) found.push(`${rule} in ${JSON.stringify(window.slice(0, 160))}`);
    }
    at += RUN_ALL.length;
  }
  return found;
}

// ------------------------------------------------------------------ the audit
//
// One pure function over the file's text, so the deliberately broken copies below
// are judged by exactly the code that runs in the suite.

const ID = {
  oldGone: `the old ownership claim "${OLD_CLAIM}" is gone from ${TARGET} (flattened, any case)`,
  readProof: `${TARGET} really was read: the reverse anchor is present`,
  gapsThere: `${TARGET} still names ${GAPS}`,
  runAllThere: `${TARGET} still names ${RUN_ALL}`,
  block: "the shared-file block, from the ownership table to the next heading, can still be cut",
  gapsRow: `the ownership table says ${GAPS} is the PM's, not QA's`,
  runAllRow: `the ownership table says ${RUN_ALL} is the PM's, not QA's`,
  neverWrite: "the block says QA never writes either of the two shared files",
  reportInstead: "the block says QA reports the lines and the PM writes them",
  reason: "one paragraph of the block carries the whole reason: more than one writer, at the same time, the last write wins, and no error",
  noClaim: "no sentence naming either shared file claims QA writes or owns it",
  noOldRunnerRule: `no text just after a mention of ${RUN_ALL} tells QA to write that file when it is missing`,
  forbidden: "both shared files are in the numbered list of things QA may not touch",
};

function audit(text) {
  const results = [];
  const add = (id, ok, detail = "") => results.push({ id, ok, detail });

  const seen = counts(text, OLD_CLAIM);
  add(
    ID.oldGone,
    seen.flattenedAnyCase === 0,
    `${fourNumbers(seen)}. This is the sentence that used to make ${GAPS} QA's own file. While it is `
      + "in the prompt, every QA agent of a round is told to write one shared file, so the round's "
      + "last writer silently deletes the other agents' gap lines. Note the four numbers: whenever "
      + "they disagree, every grep reading the smaller one is lying about this file.",
  );

  const proof = counts(text, READ_PROOF);
  add(
    ID.readProof,
    proof.flattenedAnyCase >= 1,
    `the reverse anchor ${JSON.stringify(READ_PROOF)} was found ${proof.flattenedAnyCase} time(s) `
      + `(${fourNumbers(proof)}). Without it a 0 above could just as well mean "no text was read at `
      + 'all" — which is what the DoD item\'s own command does, because `flat` is not a program.',
  );

  const gaps = counts(text, GAPS);
  const runAll = counts(text, RUN_ALL);
  add(
    ID.gapsThere,
    gaps.flattened >= 1,
    `${GAPS} appears ${gaps.flattened} time(s). DoD item 8 requires it to stay: `
      + "tools/verify-mount.mjs demands the path, and QA has to know where its gap lines end up. "
      + "Changing the owner is not deleting the path.",
  );
  add(
    ID.runAllThere,
    runAll.flattened >= 1,
    `${RUN_ALL} appears ${runAll.flattened} time(s). DoD item 8 requires it to stay: QA has to know `
      + "the shared runner finds its folder by itself, and that its own run.sh is what to check when "
      + "the folder is missing from the output.",
  );

  const block = sharedBlock(text);
  add(
    ID.block,
    block.length > 200,
    `the block cut from the ownership table row for ${RUN_ALL} to the next heading is `
      + `${block.length} characters. The rule and its reason live there, so everything below this `
      + "line is about that block and nowhere else in the file.",
  );
  const bareBlock = bare(block);

  for (const [path, id] of [[GAPS, ID.gapsRow], [RUN_ALL, ID.runAllRow]]) {
    const row = ownershipRow(text, path);
    const owner = row === null ? "" : row[row.length - 1];
    add(
      id,
      row !== null && /\bPM\b/.test(owner) && !/\byours?\b/i.test(owner),
      row === null
        ? `no row of the ownership table names ${path}, so the table no longer says who owns it`
        : `the row's last cell reads ${JSON.stringify(owner)}. It has to name the PM and must not `
          + "say the file is QA's: the whole of DoD item 7 is that this one cell changed hands.",
    );
  }

  add(
    ID.neverWrite,
    /never write either file|never writes? either of them|you never write either/i.test(bareBlock),
    "the block never says plainly that QA writes neither file. A table cell saying whose it is can "
      + `be read as a note; the instruction has to be there too: ${JSON.stringify(bareBlock.slice(0, 200))}`,
  );
  add(
    ID.reportInstead,
    /report the lines/i.test(bareBlock) && /the PM writes them/i.test(bareBlock),
    "the block does not say what QA does INSTEAD of writing. A rule that only forbids leaves the gap "
      + `lines with nowhere to go, and a gap nobody gathered is lost either way: `
      + JSON.stringify(bareBlock.slice(0, 200)),
  );

  const reason = bestReasonParagraph(block);
  add(
    ID.reason,
    reason.missing.length === 0,
    `the best paragraph carries ${reason.hit.length} of the 4 parts of the reason. Missing: `
      + `${JSON.stringify(reason.missing)}. Its text: ${JSON.stringify(reason.text.slice(0, 260))}. `
      + '"Because they are shared" is not a reason — it gives a reader no way to see the cost, so the '
      + "next agent in a hurry weighs the rule against one saved turn. The cost is that the write is "
      + "lost AND nothing says a word, and all four parts have to be in one paragraph, because words "
      + "scattered over a prompt are not an argument.",
  );

  const claims = ownershipClaims(text);
  add(
    ID.noClaim,
    claims.length === 0,
    `${claims.length} sentence(s) naming a shared file still claim QA writes or owns it: `
      + `${claims.slice(0, 3).join(" || ")}. Every count of both paths stays green while such a `
      + "sentence is in the prompt — that is why this nail is paired with the two presence checks.",
  );

  const oldRules = oldRunnerRule(text);
  add(
    ID.noOldRunnerRule,
    oldRules.length === 0,
    `${oldRules.length} place(s) still tell QA to write the shared runner: `
      + `${oldRules.slice(0, 2).join(" || ")}. "Write it only if it is missing" was the old rule for `
      + "this file, and under a round of many agents it is a race with no error: two agents both find "
      + "it missing. QA's OWN run.sh is a different file and may still be written that way.",
  );

  const forbidden = forbiddenList(text);
  add(
    ID.forbidden,
    forbidden.includes(GAPS) && forbidden.includes(RUN_ALL),
    `the numbered list of things QA may not touch is ${forbidden.length} characters and names `
      + `${GAPS}: ${forbidden.includes(GAPS)}, ${RUN_ALL}: ${forbidden.includes(RUN_ALL)}. `
      + "The write-set list is where a role looks before it writes. A path missing from it is an "
      + `invitation, whatever the rest of the file says: ${JSON.stringify(forbidden.slice(0, 200))}`,
  );

  return results;
}

// --------------------------------------------------------------- the real file

const text = repoFile(TARGET);
const block = sharedBlock(text);
const reason = bestReasonParagraph(block);

console.log(`      "${OLD_CLAIM}" in ${TARGET}: ${fourNumbers(counts(text, OLD_CLAIM))}`);
console.log(`      "${READ_PROOF}" (reverse anchor): ${fourNumbers(counts(text, READ_PROOF))}`);
console.log(`      ${GAPS}: ${fourNumbers(counts(text, GAPS))}`);
console.log(`      ${RUN_ALL}: ${fourNumbers(counts(text, RUN_ALL))}`);
console.log(
  `      shared-file block: ${block.length} chars (${block.split("\n").length} lines); `
    + `reason slots found: ${reason.hit.length}/4 ${JSON.stringify(reason.hit)}`,
);
console.log(`      list of things QA may not touch: ${forbiddenList(text).length} chars`);

for (const result of audit(text)) check(result.id, result.ok, result.detail);

// ------------------------------------------------------------------ mutations
//
// Four breakages, each in its own throwaway copy of the repository, proving this
// audit goes red on exactly the things it claims to guard. Without them the case
// is a green light with no bulb in it. Every failure a mutation causes is printed
// as a `red:` line, so the report can quote the words a reader would really see.

/** Break one file of a fresh copy and return which audit checks failed. */
function afterBreaking(label, breakIt) {
  const dir = tempRepo();
  try {
    breakIt(dir);
    const broken = copyFile(dir, TARGET);
    const failed = audit(broken).filter((result) => !result.ok);
    for (const result of failed) {
      console.log(`      red: ${label}: ${result.id}\n           ${result.detail.slice(0, 220)}`);
    }
    return { failed: failed.map((result) => result.id), broken };
  } finally {
    cleanUp(dir);
  }
}

// Mutation 1: THE ONE THIS CASE EXISTS FOR. Both paths stay exactly where they
// are, every count of them is unchanged, and only the ownership cell flips back
// to QA. This is the change a hurried edit makes, and every check that merely
// counts a path is green on it.
const flipped = afterBreaking("mutation 1", (dir) => {
  edit(dir, TARGET, "| runs every task's cases, past and present | **the PM's** |",
    "| runs every task's cases, past and present | yours |");
  edit(dir, TARGET, "| the standing list of what no runnable case can check | **the PM's** |",
    "| the standing list of what no runnable case can check | yours |");
});
check(
  "mutation 1: flipping both ownership cells back to QA, with both paths untouched, turns this case red",
  flipped.failed.includes(ID.gapsRow)
    && flipped.failed.includes(ID.runAllRow)
    && !flipped.failed.includes(ID.gapsThere)
    && !flipped.failed.includes(ID.runAllThere),
  `failed checks were ${JSON.stringify(flipped.failed)}. Both presence checks must still pass and `
    + "both ownership checks must fail — that pair is the whole point of DoD items 7 and 8 together.",
);

// Mutation 2: the old sentence comes back, Capitalised And Wrapped across three
// lines — so a case-sensitive count reads 0 and a line-based count reads 0 too.
// Only a flattened, case-insensitive count sees it, and this case must.
const returned = afterBreaking("mutation 2", (dir) => {
  edit(
    dir,
    TARGET,
    "and **the PM writes it** for the reason the shared-file\nsection gives.",
    "and **you**\nAre The One Who\nWrites It There.",
  );
});
check(
  "mutation 2: a capitalised, line-wrapped copy of the old ownership sentence turns this case red",
  returned.failed.includes(ID.oldGone) && returned.failed.includes(ID.noClaim),
  `failed checks were ${JSON.stringify(returned.failed)}. A grep with neither -i nor a flattening `
    + "step reads 0 on this copy, so a case built on the DoD item's literal command would call it "
    + "green while the prompt tells QA to write the shared gap list.",
);

// Mutation 3: the reason is replaced by the empty version of itself. The word
// "shared" and the sentence about many agents stay; the mechanism — the lost
// write and the silence — goes. A string check for "shared" is green here.
const vague = afterBreaking("mutation 3", (dir) => {
  edit(
    dir,
    TARGET,
    "If each wrote its own line they would write the\nsame file at once, **the last write would win, and nothing would say a word** —\n"
      + "the runner still runs, still prints a green total, and the total is simply\nmissing one task's cases.",
    "They belong to the PM because they are shared.",
  );
});
check(
  "mutation 3: replacing the reason with \"because they are shared\" turns this case red",
  vague.failed.includes(ID.reason) && !vague.failed.includes(ID.gapsRow),
  `failed checks were ${JSON.stringify(vague.failed)}. DoD item 7 asks for the reason to be written `
    + "down, and the reason is the lost write plus the silence. The ownership checks stay green here, "
    + "which is precisely why the reason needs a check of its own.",
);

// Mutation 4: the gap list is dropped from the numbered list of things QA may not
// touch. Nothing else moves, so the path is still in the file four more times and
// every count of it is unchanged — the write-set list is the one place that
// notices.
const unlisted = afterBreaking("mutation 4", (dir) => {
  edit(dir, TARGET, "8. the **standing gap list**, `docs/qa/gaps.md`.", "8. the **standing gap list**.");
});
check(
  "mutation 4: dropping the gap list from the may-not-touch list turns this case red while every path count stays green",
  unlisted.failed.includes(ID.forbidden) && !unlisted.failed.includes(ID.gapsThere),
  `failed checks were ${JSON.stringify(unlisted.failed)}. The path count is still green on this copy, `
    + "so a case that only counted paths would have missed the one list a role reads before it writes.",
);

done();
