// T-64 DoD item 10 (and T-69 DoD item 1; PRD M1 DoD item 6, second half): the
// cancelled third lane is gone from the product files OUTSIDE `roles/pm.md` too —
// `host/crew.js`, `principles.md`, `README.md`, `README-zh.md` and `CLAUDE.md` —
// and it is gone from the PM prompt this plugin really assembles.
//
// WHY THIS CASE EXISTS AT ALL, AND WHY IT IS NOT A COPY OF case-02.
// `case-02-two-lanes-only.mjs` reads one file, `roles/pm.md`. That is the half of
// the change a person doing the work can see. The half nobody sees is
// `host/crew.js`, which used to carry (line 223 as this job found it, and note the
// plain backticks — the fourth trap below):
//
//     The `ask` and `quick` lanes work either way.
//
// and that line is part of the PM prompt, which SHIPS IN THE NPM PACKAGE. A
// session on a released version would have been told about a lane that no longer
// exists, with every markdown file in the repository saying the opposite. The
// PRD's DoD item 6 calls that "the invisible half" and says the change is not done
// without it.
//
// The wider reason: in this one job the same shape of mistake — one place changed,
// the other places that say the same thing not swept — happened FOUR times, and
// every one of them was caught by a person reading, not by a machine. Nothing in
// the suite checked "and the other files too". This case is the first machine
// check of that shape, which is why it deliberately reads five files and the
// assembled prompt rather than one file.
//
// THE THREE FALSE CHECKS THIS CASE HAD TO AVOID, each of which really happened
// somewhere in this job:
//
//   1. THE PINNED STRING MOVED. Prose here wraps at 80 or 100 columns, so a
//      sentence normally spans two or three lines and a line-by-line search for it
//      finds nothing while the sentence sits right there. Everything below is
//      matched on `flat()`ed text. The line-by-line count is still taken, and one
//      check compares the two, so a wrap can never hide a hit.
//   2. THE PIN WAS A PROXY. `grep -c 'quick' principles.md` is not a count of the
//      lane: `principles.md` and `README.md` each carry the ordinary English
//      phrase "a quick look" (about a researcher, not a lane), which is correct
//      English and stays. So for the four documents this case counts only hits
//      written the way a LANE NAME is written — backticked, or next to the word
//      "lane" — never the bare word.
//   3. THE FILE READ WAS NOT THE FILE JUDGED. Every check below names its own
//      file, and every read goes through `repoFile(<that file>)`.
//
// AND A FOURTH TRAP, THE ONE THIS CASE ALMOST FELL INTO. Both the PRD and the task
// table quote the offending line with BACKSLASHES in front of the backticks —
// The \`ask\` and \`quick\` lanes work either way. — because they are markdown and
// a backtick inside a backtick span has to be escaped there. The file itself has
// no backslashes: `host/crew.js` holds that sentence inside a DOUBLE-quoted
// JavaScript string, where a backtick needs no escape at all. So a check that
// copied the anchor as those documents spell it would hunt for a backslash before
// the backtick and never find anything, while the line sat in the file untouched.
// Checked by reading the sentence in `host/crew.js` byte for byte, not by trusting
// either document's rendering of it.
//
// Two things close it. The scan turns a backslash-escaped backtick back into a
// plain one before it looks, so either spelling is caught; and `host/crew.js` is
// additionally held to the task table's own command, `grep -n 'quick'
// host/crew.js` = 0 occurrences, which no spelling of the backticks can dodge.
//
// WHY `host/crew.js` GETS ZERO OCCURRENCES AND THE FOUR DOCUMENTS DO NOT.
// T-64's DoD cell 10 verifies with `grep -n 'quick' host/crew.js` = 0, and that is
// right for this file: it is not prose about history, it IS the shipped prompt, so
// there is no honest reason for the word to appear in it at all. The price is
// stated out loud: ordinary English ("a quick look") written into `host/crew.js`
// one day would go red here even though it means no harm. That is the DoD's rule,
// not this case's invention, and the fix then is a DoD change, not a weaker case.
//
// MENTION versus RULE, the distinction this job made five times.
// The PRD's DoD item 11, v6, settles it: a check that forbids a string must first
// separate "the words that TALK ABOUT the thing" from "the words that DO it".
// Forbidding the mention makes the check impossible to pass honestly and erases the
// record of the change — item 11 was written as "the path never appears" for five
// versions and could never have gone green, because the PRD itself has to name the
// old path to say what is being renamed. So a lane-shaped hit inside a sentence
// that says the lane was cancelled or removed is a MENTION and is allowed, and it
// is allowed on purpose: `principles.md` today keeps a whole paragraph explaining
// that the third lane is gone and why, and that paragraph is the only record in the
// repository of why the lane ever existed. Any other lane-shaped hit is a RULE — a
// file still teaching somebody to use a lane that does not exist — and goes red.
//
// WHAT COUNTS AS "the sentence", and why it is one sentence and not a paragraph.
// The judgement runs on the SENTENCE the hit sits in, cut out of the flattened
// text, and the failure detail prints that sentence so a red says exactly where to
// look. A wider window was tried first — 140 characters either side — and it went
// wrong immediately, on this very repository: appending a plain lane rule to the
// end of `CLAUDE.md` was excused as a mention because the file's last paragraph
// happens to contain the words "used to name the README only" 90 characters
// earlier. A cancellation word borrowed from an unrelated neighbouring sentence is
// exactly the false green this case is supposed to prevent, so the window is the
// sentence, and nothing outside it counts.
//
// THE PRICE, said plainly: an honest record split over two sentences — "The third
// lane is gone. It was called `quick`." — goes red here, because the sentence
// naming the lane carries no cancellation word of its own. That is a loud failure
// with an easy fix (say it in one sentence), and it is the safer of the two
// mistakes: the other one is silent.
//
// A sentence ends at `.`, `!`, `?` or their full-width forms FOLLOWED BY
// WHITESPACE, or at a `|`. Both halves of that matter. Requiring the whitespace
// keeps `0.9.0` and `README.md` from cutting a sentence in half, and `|` is a
// boundary because a markdown table row puts unrelated sentences side by side in
// neighbouring cells — `principles.md`'s lane table is exactly that shape.
//
// WHAT THIS CASE DOES NOT COVER, said out loud:
//
//   * `roles/pm.md` — that is `case-02`, deliberately not repeated here.
//   * A TRANSLATED lane name. `README-zh.md` writes the lane ids in English and
//     backticked (`` `ask` ``, `` `team` ``), so an English-only scan is the right
//     scan today; a Chinese rendering of the cancelled name would slip past.
//   * Whether the surviving two lanes are DESCRIBED correctly. This case only asks
//     that both names are still present, as a premise, so that deleting a whole
//     lane paragraph cannot pass as "the cancelled lane is gone".
//
// Reads five repository files and mounts `host/crew.js` on a fake context
// (`mountCrew`, which points DSH_HOME at a throwaway folder, installs no preset
// and reads no real `~/.dsh`). Writes nothing into the repository. Runs offline.

import { repoFile, flat, check, done, mountCrew } from "../lib/qa.mjs";

const CODE = "host/crew.js";
const DOCS = ["principles.md", "README.md", "README-zh.md", "CLAUDE.md"];
const SURVIVING = ["`ask`", "`team`"];

// The sentence T-64's DoD cell 10 and the PRD's DoD item 6 both name, spelled the
// way `host/crew.js` really spelled it: PLAIN backticks, because it sat inside a
// double-quoted JavaScript string. The two documents show it with backslashes
// only because markdown needs them — the fourth trap above.
const OLD_SENTENCE = "The `ask` and `quick` lanes work either way.";

// The Chinese word for "lane", the one `README-zh.md` uses around the lane ids.
// It is written as two code points rather than as the characters themselves
// because every case file in this repository is English and ASCII.
const LANE_WORD = "\u901a\u9053";

// A hit is "lane-shaped" when the cancelled name is written the way a lane name
// is written. Bare `quick` is NOT one of these patterns, on purpose: see false
// check 2 above.
const LANE_SHAPED = [
  ["backticked", /`quick`/gi],
  ["quick + lane", /\bquick\b.{0,3}lanes?\b/gi],
  ["lane + quick", /\blanes?\b.{0,14}?`?\bquick\b/gi],
  ["quick + lane (Chinese)", new RegExp(`\\bquick\\b.{0,3}${LANE_WORD}`, "gi")],
  ["lane (Chinese) + quick", new RegExp(`${LANE_WORD}.{0,3}\`?\\bquick\\b`, "gi")],
];

// A sentence carrying one of these is talking ABOUT the cancelled lane, not
// telling anybody to use it.
const CANCELLED = /\bgone\b|\bcancel|\bremoved\b|\bdropped\b|\bdeleted\b|no longer\b|used to\b|there is no\b|\bwas the third\b/i;

/** A sentence end: `.!?` and their full-width forms before whitespace, or a table cell wall. */
const BOUNDARY = /[.!?\u3002\uff01\uff1f]/;

/** Turn a backslash-escaped backtick back into a plain one, so both spellings match. */
const unescapeBackticks = (text) => text.replace(/\\`/g, "`");

/** Is this position the end of a sentence? */
const ends = (text, i) => text[i] === "|" || (BOUNDARY.test(text[i]) && /\s/.test(text[i + 1] ?? " "));

/** The one sentence of `text` that holds position `at`. */
function sentenceAround(text, at) {
  let start = 0;
  for (let i = at; i > 0; i -= 1) {
    if (ends(text, i)) { start = i + 1; break; }
  }
  let end = text.length;
  for (let i = at; i < text.length; i += 1) {
    if (ends(text, i)) { end = i + 1; break; }
  }
  return text.slice(start, end).trim();
}

/**
 * Every lane-shaped hit in one text, judged.
 *
 * Several patterns catch the same words — `` `quick` lanes `` matches both the
 * backticked pattern and the "quick + lane" one — so a hit is keyed by WHERE THE
 * NAME ITSELF is, not by where the pattern started. Without that, one occurrence
 * would be counted two or three times and the exactness of the controls below
 * would be meaningless.
 *
 * @returns array of { pattern, match, sentence, mention }
 */
function laneHits(text) {
  const found = new Map();
  for (const [pattern, regex] of LANE_SHAPED) {
    for (const match of text.matchAll(regex)) {
      const at = (match.index ?? 0) + match[0].toLowerCase().indexOf("quick");
      const sentence = sentenceAround(text, at);
      if (!found.has(at)) found.set(at, { pattern, match: match[0], sentence, mention: CANCELLED.test(sentence) });
    }
  }
  return [...found.entries()].sort(([a], [b]) => a - b).map(([, hit]) => hit);
}

/** The hits that are a rule and not a mention — the ones that must not exist. */
const rules = (text) => laneHits(text).filter((hit) => !hit.mention);

/** How a red reads: which pattern, what it matched, and the words around it. */
const show = (hits) => hits.map((hit) => `[${hit.pattern}] ${JSON.stringify(hit.match)} in sentence: ${JSON.stringify(hit.sentence.slice(0, 400))}`).join("\n      ");

// --------------------------------------------------------------- the premise
//
// Every file below must still name BOTH surviving lanes. Without this, a file
// whose whole lane paragraph had been deleted would sail through every check
// after it: nothing left to find is not the same as the right thing left.

for (const file of [CODE, ...DOCS]) {
  const text = flat(unescapeBackticks(repoFile(file)));
  const missing = SURVIVING.filter((lane) => !text.includes(lane));
  check(
    `${file} still names both surviving lanes`,
    missing.length === 0,
    `missing: ${missing.join(", ")} — the lane text was deleted rather than corrected, so the checks below would pass on nothing`,
  );
}

// ------------------------------------------------- host/crew.js, the invisible half

const codeRaw = repoFile(CODE);
const codeFlat = flat(unescapeBackticks(codeRaw));

const bareHits = [...codeRaw.matchAll(/quick/gi)];
const bareLines = codeRaw
  .split("\n")
  .map((line, index) => [index + 1, line])
  .filter(([, line]) => /quick/i.test(line))
  .map(([number, line]) => `${CODE}:${number}: ${line.trim()}`);
check(
  `${CODE} holds no occurrence of the cancelled lane's name at all (T-64 DoD cell 10: grep = 0)`,
  bareHits.length === 0,
  `${bareHits.length} occurrence(s):\n      ${bareLines.join("\n      ")}`,
);

check(
  `${CODE} no longer carries the old sentence ${JSON.stringify(OLD_SENTENCE)}`,
  !codeFlat.includes(OLD_SENTENCE),
  `the PM prompt still promises a lane that does not exist — this is the half of the change that ships in the npm package`,
);

const codeRules = rules(codeFlat);
check(
  `${CODE} has no lane-shaped use of the cancelled name`,
  codeRules.length === 0,
  show(codeRules),
);

// ---------------------------------------------------- the four reader-facing files

for (const file of DOCS) {
  const raw = repoFile(file);
  const hits = laneHits(flat(raw));
  const bad = hits.filter((hit) => !hit.mention);
  check(
    `${file} has no lane-shaped use of the cancelled name outside a sentence saying it was cancelled`,
    bad.length === 0,
    `${hits.length} lane-shaped hit(s), ${bad.length} of them a rule rather than a mention:\n      ${show(bad)}`,
  );
}

// -------------------------------------------- the wrap guard (count it twice)
//
// The counts above are taken on flattened text. This asks the same question line
// by line and compares: the flattened scan must find at least as much as the
// line-based one, or a hit is being missed by the very method used above.

const wrapTrouble = [CODE, ...DOCS].filter((file) => {
  const raw = unescapeBackticks(repoFile(file));
  const perLine = raw.split("\n").reduce((total, line) => total + laneHits(line).length, 0);
  return laneHits(flat(raw)).length < perLine;
});
check(
  "the flattened scan finds every lane-shaped hit the line-by-line scan finds",
  wrapTrouble.length === 0,
  `flattening lost a hit in: ${wrapTrouble.join(", ")} — the scan method itself is wrong, not the files`,
);

// ------------------------------------------- the prompt the plugin really assembles
//
// The strongest of these checks. The three above read files; this one reads the
// text a real session is given, which is `roles/pm.md` plus the runtime-facts
// section `host/crew.js` builds. A lane name reintroduced anywhere on that path
// is caught here even if it never appears in a shape the file scans expect.
//
// A mention is allowed here for the same reason as in the documents: the
// cancellation note in `roles/pm.md` is part of this text.

const crew = await mountCrew();
try {
  check(
    "host/crew.js registers a PM prompt section that names both surviving lanes",
    crew.prompt.length > 0 && SURVIVING.every((lane) => flat(crew.prompt).includes(lane)),
    `${crew.sections.length} section(s), ${crew.prompt.length} characters; thrown: ${crew.thrown ?? "nothing"}`,
  );

  const promptRules = rules(flat(crew.prompt));
  check(
    "the assembled PM prompt has no lane-shaped use of the cancelled name",
    promptRules.length === 0,
    show(promptRules),
  );

  // ------------------------------------------------------- negative controls
  //
  // A pin nobody has seen fail is not a pin. These put the offending text back —
  // in memory, never in a file — and require the scan above to catch it. The last
  // one is the opposite control: the cancellation note must stay legal, so this
  // case can never be "green because it forbids the record of the change".

  // Each control asks for ONE MORE rule-shaped hit than the text already had,
  // never for exactly one. A control written as "exactly one" would itself go red
  // in a tree where the real fault is present — reporting "the scan is broken"
  // when the scan had just worked perfectly — and that noise is what makes people
  // stop believing a case.
  const oneMore = (what, base, broken, why) => check(
    what,
    rules(broken).length === rules(base).length + 1,
    `${rules(base).length} rule-shaped hit(s) before, ${rules(broken).length} after — ${why}`,
  );

  oneMore(
    "control: the old host/crew.js sentence put back is caught",
    codeFlat,
    `${codeFlat} ${OLD_SENTENCE}`,
    "the scan cannot see the very line this case exists for",
  );

  for (const file of DOCS) {
    const base = flat(repoFile(file));
    oneMore(
      `control: a reintroduced lane rule in ${file} is caught`,
      base,
      `${base} Use the \`quick\` lane for a typo.`,
      "a rule added to this file would not be noticed",
    );
  }

  oneMore(
    "control: the old sentence reaching the assembled prompt is caught",
    flat(crew.prompt),
    `${flat(crew.prompt)} ${OLD_SENTENCE}`,
    "a lane name arriving through the prompt would not be noticed",
  );

  const mention = "There used to be a third lane, `quick`, for the smallest work. That lane is gone.";
  const mentionHits = laneHits(mention);
  check(
    "control: an honest record that the lane was cancelled is allowed to name it",
    mentionHits.length === 1 && mentionHits[0].mention && rules(mention).length === 0,
    `${mentionHits.length} hit(s), mention=${mentionHits[0]?.mention} — this case would be forbidding the record of the change, which the PRD's DoD item 11 (v6) refuses`,
  );
} finally {
  crew.cleanUp();
}

done();
