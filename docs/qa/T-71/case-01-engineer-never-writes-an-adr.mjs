// T-71 (checklist C-53) — DoD: T-71 item 5.
//
// What it proves: an engineer never writes an ADR, and the four places that say
// so do not contradict each other.
//
// ---------------------------------------------------------------------------
// WHY ONE CASE AND NOT FOUR. T-71 item 5 was corrected by the PM on 2026-08-21:
// the first version of the cell put an ADR under `docs/decisions/adr/` on the
// WRITABLE side of `roles/engineer.md` ("on small work, which has no architect,
// the ADR is the engineer's"), which contradicted the authoritative table in
// `principles.md`. The engineer of T-71 refused to write the contradiction,
// reported it, and the PM moved the ADR to the non-writable side. So the cell now
// names three existing documents that must agree with the new text, and the value
// of the cell is exactly that: each of the three is correct on its own, and
// NOBODY LOOKING AT ONE OF THEM CAN SEE WHETHER THE OTHERS STILL AGREE. Split
// this into three cases, one file per document, and the crew is back where it
// started — every file green, the set of them inconsistent. That failure mode is
// `docs/qa/gaps.md` item 32.
//
// THE FOUR PLACES, and where the fourth comes from. T-71 item 5's own words name
// three: (1) the `## Who writes which document` table in `principles.md`, ADR row,
// whose cell reads `the architect; the PM on small work and for a bug's ADR` and
// names no engineer; (2) the short copy of that table in `roles/pm.md`, same row;
// (3) `roles/engineer.md`'s own bug-fixing section, which says the PM decides and
// writes the decision into an ADR and only then wakes the engineer to build. The
// fourth is the text this task WROTE — the never-yours paragraph in
// `roles/engineer.md`'s write-set section — and it is judged here too, because a
// new paragraph that contradicted the three would be exactly the defect this job
// exists to remove.
//
// ---------------------------------------------------------------------------
// POSITION, NOT PRESENCE. `roles/engineer.md` holds `docs/decisions/adr/` TWICE
// (lines 174 and 271 at the time of writing), and `tools/verify-mount.mjs:592`
// REQUIRES the path to be there — deleting it turns the project's own check red.
// So "the path appears" proves nothing at all about which side of the write set
// it sits on, and a case that counted occurrences would stay green while the ADR
// moved back to the writable side. This case therefore splits the write-set
// section in two and asserts on the two halves separately.
//
// HOW THE SPLIT IS MADE, and why not with a prose anchor. The section reads:
// a lead-in sentence, then the bullet list of what the engineer MAY write, then
// every paragraph about what it may not. The obvious anchor — the closing
// sentence "That is the whole list: two classes, and nothing else." — is real
// prose that a later edit may legitimately reword, and a pin on it would go red
// over words no DoD item protects. So the split is STRUCTURAL: everything up to
// and including the last line of the first bullet run is the granting half;
// everything after it, up to the first `### ` subsection, is the forbidding half.
// A bullet is a bullet whatever the sentences around it say.
//
// ---------------------------------------------------------------------------
// WHY THE REASON IS JUDGED BY STRUCTURE AND NOT WORD FOR WORD. T-71 item 5 says
// "a ban with no reason behind it does not count as done: the next person will
// simply walk around it". It also quotes `principles.md`:
// `an options list written by the person who decided can be reshaped into a case
// for the decision`. That quotation is verified here — in `principles.md`, where
// the cell says it lives (check 10) — and it is NOT required of
// `roles/engineer.md`, which paraphrases it ("the one who already decided"). The
// cell asks for a verbatim quotation in ONE place only: the options section of an
// ADR must quote the engineer's `Q-` file rather than summarise it. Pinning the
// sentence word for word inside `roles/engineer.md` as well would be a check that
// is red from the day it is written, and `docs/qa/gaps.md` item 31 records what
// people do when they meet a permanently red check: they widen the assertion, or
// they change the file. So the reason is judged as a shape — a causal connective,
// plus the pair of ideas the reason is built from (who DECIDES, and who writes the
// OPTIONS) — which a bare "you may not write one" fails on both counts.
//
// ---------------------------------------------------------------------------
// HOW "WHO WRITES AN ADR" IS READ OUT OF PROSE. Two of the four places are table
// cells under the column header `Who writes it`, so the whole cell is the answer.
// The other two are sentences, and the rule used on them is deliberately narrow:
// a role counts as a writer only when the role word stands immediately before a
// writing verb (`the PM copies`, `The PM decides`, `an engineer writes`) or after
// a passive `written by`. Nothing else counts.
//
// That narrowness is the point, and the reason is a real sentence in the file:
// "Write the ADR yourself and you are both." is a WARNING against the engineer
// writing an ADR, and a looser rule — "does the word `you` appear near the word
// ADR" — would read it as a grant and go red on the very text that states the
// ban. The same trap sits in "the decision is written into a document before you
// build it". The price of the narrow rule is written down instead of hidden: a
// grant phrased with no verb next to the role ("the ADR is yours to write") is
// invisible to it. That is a real hole, it goes in the QA report, and check 5
// still catches the ordinary way such a grant would arrive — as a bullet on the
// writable side.
//
// Reads three repository files. Writes nothing, anywhere. Runs offline, and
// twice in a row gives the same answer.

import { repoFile, flat, check, done } from "../lib/qa.mjs";

// --------------------------------------------------------------- the files

const ENGINEER = "roles/engineer.md";
const PRINCIPLES = "principles.md";
const PM = "roles/pm.md";

const engineer = repoFile(ENGINEER);
const principles = repoFile(PRINCIPLES);
const pm = repoFile(PM);

const ADR_PATH = "docs/decisions/adr/";

// ------------------------------------------------------------ small helpers

/**
 * One `## heading` section, up to the next `## `. Local copy rather than the
 * shared `section()` so the failure can name the file as well as the heading:
 * this case reads three files and a bare "no such section" would not say which.
 */
function topSection(text, heading, file) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) throw new Error(`${file} has no "## ${heading}" section — the file's shape moved`);
  const rest = text.slice(start + 3);
  const end = rest.indexOf("\n## ");
  return end === -1 ? text.slice(start) : text.slice(start, start + 3 + end);
}

/**
 * The write-set section of `roles/engineer.md`, cut in two at the end of its
 * first bullet run. See the header for why the cut is structural.
 *
 * @returns { grant, forbid } — the text before and after the cut
 */
function writeSetHalves(text) {
  const whole = topSection(text, "What you may write", ENGINEER);
  const sub = whole.indexOf("\n### ");
  const body = sub === -1 ? whole : whole.slice(0, sub);
  const lines = body.split("\n");
  let firstBullet = -1;
  let lastBullet = -1;
  for (const [index, line] of lines.entries()) {
    if (/^- /.test(line)) {
      if (firstBullet === -1) firstBullet = index;
      lastBullet = index;
      continue;
    }
    if (firstBullet === -1) continue;
    if (/^\s+\S/.test(line)) { lastBullet = index; continue; } // a wrapped bullet
    if (line.trim() === "") continue;
    break; // ordinary prose after the list: the run has ended
  }
  if (firstBullet === -1) {
    throw new Error(`${ENGINEER}'s write-set section holds no bullet list, so its two halves cannot be told apart — the section was rewritten in another shape`);
  }
  return {
    grant: lines.slice(0, lastBullet + 1).join("\n"),
    forbid: lines.slice(lastBullet + 1).join("\n"),
  };
}

/** Paragraphs of a text, blank-line separated, blanks dropped. */
const paragraphs = (text) => text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

/**
 * The `Who writes it` row for a decision about how, out of the one table in a
 * file whose header row is `| Class of document | Who writes it |`.
 *
 * Scoped to that table on purpose: `principles.md` holds a SECOND table row
 * matching "a decision about how" (the lane table, which lists the seven homes a
 * durable half moves to), and a whole-file search would pick whichever came
 * first.
 */
function whoWritesAnAdr(text, file) {
  const header = text.indexOf("| Class of document | Who writes it |");
  if (header === -1) throw new Error(`${file} has no "| Class of document | Who writes it |" table — the who-writes table moved or was renamed`);
  const rest = text.slice(header);
  const end = rest.search(/\n\s*\n/);
  const table = end === -1 ? rest : rest.slice(0, end);
  const rows = table.split("\n")
    .filter((line) => line.startsWith("|") && /decision about how/i.test(line))
    .map((line) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim()));
  if (rows.length !== 1) {
    throw new Error(`${file}'s who-writes table holds ${rows.length} rows for a decision about how, expected exactly 1 — the table's shape moved`);
  }
  return { klass: rows[0][0], writer: rows[0][1] };
}

// --------------------------------------------- who a text says writes an ADR

const ROLE_WORDS = /\b(PM|architect|engineers?|you)\b/gi;

const roleOf = (word) => (/^PM$/.test(word) ? "PM" : (/^architect$/i.test(word) ? "architect" : "engineer"));

/** Every role named anywhere in a snippet. For a table cell, which IS the answer. */
function rolesNamed(snippet) {
  const found = new Set();
  for (const match of snippet.matchAll(new RegExp(ROLE_WORDS.source, "gi"))) found.add(roleOf(match[1]));
  return [...found].sort();
}

/** A sentence ends at `.`, `!` or `?` followed by whitespace, or at a `|`. */
const ends = (text, index) => text[index] === "|"
  || (/[.!?]/.test(text[index]) && /\s/.test(text[index + 1] ?? " "));

function sentences(text) {
  const out = [];
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    if (!ends(text, index)) continue;
    out.push(text.slice(start, index + 1).trim());
    start = index + 1;
  }
  if (start < text.length) out.push(text.slice(start).trim());
  return out.filter(Boolean);
}

const MENTIONS_ADR = /\bADRs?\b|docs\/decisions\/adr\/|decision record/i;
/** A role word standing immediately before a writing verb, bold markers allowed. */
const ACTIVE_WRITER = /\b(PM|architect|engineers?|you)\b(?:\s+\*{0,2}[\w-]+\*{0,2}){0,2}?\s+\*{0,2}(?:writes?|copies|copy|decides?)\b/gi;
const PASSIVE_WRITER = /\bwritten by\b([^.]*)/gi;

/**
 * Who a piece of prose says writes an ADR. Only the two narrow shapes described
 * in the header count, so a warning against the engineer writing one is not read
 * as a grant.
 *
 * @returns { roles, evidence } — sorted role names, and the phrases they came from
 */
function adrWritersInProse(text) {
  const roles = new Set();
  const evidence = [];
  for (const sentence of sentences(flat(text))) {
    if (!MENTIONS_ADR.test(sentence)) continue;
    for (const match of sentence.matchAll(new RegExp(ACTIVE_WRITER.source, "gi"))) {
      roles.add(roleOf(match[1]));
      evidence.push(match[0].trim());
    }
    for (const match of sentence.matchAll(new RegExp(PASSIVE_WRITER.source, "gi"))) {
      for (const role of rolesNamed(match[1])) {
        roles.add(role);
        evidence.push(`written by …${role}`);
      }
    }
  }
  return { roles: [...roles].sort(), evidence };
}

// ================================================================= premises
//
// An absent check passes on an empty file, so the files are proved real first.

for (const [file, text] of [[ENGINEER, engineer], [PRINCIPLES, principles], [PM, pm]]) {
  check(
    `${file} is present and is the real file, not a stub`,
    text.length >= 500,
    `only ${text.length} byte(s) — every check below would pass on nothing`,
  );
}

check(
  `${ENGINEER} still names \`${ADR_PATH}\` at least once`,
  engineer.includes(ADR_PATH),
  `tools/verify-mount.mjs requires the path in this file, and every position check below needs it to be there. Deleting the path is not how the ADR leaves the write set — moving it to the forbidding half is`,
);

// ============================================== the write set, by position

const { grant, forbid } = writeSetHalves(engineer);

check(
  `${ENGINEER}: the writable half names the product files the task row names`,
  /product files/i.test(grant) && /task row/i.test(grant),
  `the first of the two writable classes is missing from:\n      ${flat(grant).slice(0, 400)}`,
);

check(
  `${ENGINEER}: the writable half names the unit test files`,
  /unit test files/i.test(grant),
  `the second of the two writable classes is missing from:\n      ${flat(grant).slice(0, 400)}`,
);

// The sharpest check in the file: T-71 item 5's first version put an ADR HERE,
// as a third bullet. If it ever comes back, this is what goes red.
const adrInGrant = [...flat(grant).matchAll(/\bADRs?\b|docs\/decisions\/adr\//gi)].map((match) => match[0]);
check(
  `${ENGINEER}: the writable half mentions no ADR at all — the write set is two classes, not three`,
  adrInGrant.length === 0,
  `${adrInGrant.length} ADR mention(s) on the writable side: ${adrInGrant.map((hit) => JSON.stringify(hit)).join(", ")}\n      ${flat(grant).slice(0, 500)}`,
);

check(
  `${ENGINEER}: the forbidding half names \`${ADR_PATH}\` — the fifth thing that is never the engineer's`,
  forbid.includes(ADR_PATH),
  `the path is somewhere else in the file, which says nothing about the write set. The forbidding half reads:\n      ${flat(forbid).slice(0, 500)}`,
);

const NEVER_YOURS = [
  ["the opening document of the job", /opening document/i],
  ["the engineer's own task row, including the line saying which files it owns", /task row/i],
  ["the DoD items in that row", /DoD items?/],
  ["everything under `docs/qa/`", /docs\/qa\//],
];

for (const [what, pattern] of NEVER_YOURS) {
  check(
    `${ENGINEER}: the forbidding half names ${what}`,
    pattern.test(forbid),
    "T-71 item 5 asks for five things on the forbidding side; this is one of the four besides the ADR",
  );
}

// ================================================ the reason, judged by shape

const adrParagraph = paragraphs(forbid).find((part) => part.includes(ADR_PATH));

check(
  `${ENGINEER}: one paragraph of the forbidding half carries \`${ADR_PATH}\``,
  adrParagraph !== undefined,
  "the path is in that half but in no paragraph of its own, so the reason cannot be located",
);

const adrText = flat(adrParagraph ?? "");

check(
  `${ENGINEER}: that paragraph gives a REASON, not a bare ban`,
  /\breason\b|\bbecause\b|\bso\b|\bwhy\b/i.test(adrText),
  `no causal connective in:\n      ${adrText.slice(0, 500)}\n      T-71 item 5: a ban with no reason behind it does not count as done — the next person walks around it`,
);

check(
  `${ENGINEER}: the reason is the right one — who DECIDES must not write the OPTIONS`,
  /decid/i.test(adrText) && /options/i.test(adrText),
  `the paragraph reasons about something else. Both ideas must be there:\n      ${adrText.slice(0, 500)}`,
);

// The verbatim sentence T-71 item 5 quotes, checked where the cell says it lives.
const REASON_IN_PRINCIPLES = "an options list written by the person who decided can be reshaped into a case for the decision";

check(
  `${PRINCIPLES} carries the sentence T-71 item 5 quotes as the reason, word for word`,
  flat(principles).includes(REASON_IN_PRINCIPLES),
  `${JSON.stringify(REASON_IN_PRINCIPLES)} is not in the flattened file. This is the source of the rule; ${ENGINEER} paraphrases it, which item 5 allows`,
);

check(
  `${ENGINEER}: the engineer's own output is named — \`<job folder>/inbox/Q-<number>.md\``,
  flat(engineer).includes("<job folder>/inbox/Q-<number>.md"),
  "item 5: the engineer's half of the split is the `Q-` file, and the file has to say where it goes",
);

// ======================================= place 1 and place 2: the two tables

const principlesRow = whoWritesAnAdr(principles, PRINCIPLES);
const pmRow = whoWritesAnAdr(pm, PM);

const CELL = "the architect; the PM on small work and for a bug's ADR";

check(
  `${PRINCIPLES}: the who-writes table says an ADR is written by ${JSON.stringify(CELL)}`,
  principlesRow.writer === CELL,
  `the row reads ${JSON.stringify(principlesRow.writer)}. This table is the source every other copy is judged against`,
);

check(
  `${PM}: the short copy of that table carries the same row, character for character`,
  pmRow.writer === principlesRow.writer,
  `${PRINCIPLES}: ${JSON.stringify(principlesRow.writer)}\n      ${PM}:          ${JSON.stringify(pmRow.writer)}\n      One of the two was edited and the other was not. ${PRINCIPLES} is the source and ${PM} is the copy`,
);

// ================================== place 3: the engineer's own bug section

const bugSection = topSection(engineer, "When you fix a bug: find at least two ways first", ENGINEER);

check(
  `${ENGINEER}: the bug-fixing section says the PM copies the engineer's options into the ADR`,
  /\bPM copies\b/.test(flat(bugSection)),
  "item 5's third place: the options are the engineer's text and the ADR is the PM's document. Without this sentence the split has no second half",
);

check(
  `${ENGINEER}: the bug-fixing section says the PM decides and the decision goes into an ADR under \`${ADR_PATH}\``,
  /\bPM decides\b/.test(flat(bugSection)) && flat(bugSection).includes(`an ADR at \`${ADR_PATH}`),
  `the third place no longer says who writes the decision down:\n      ${flat(bugSection).slice(-600)}`,
);

check(
  `${ENGINEER}: and the engineer builds only after that document exists`,
  /before you build it/.test(flat(bugSection)) && /Build what the document says/.test(flat(bugSection)),
  "the order is the whole point of the third place: decide, write it down, then build",
);

// =============================================== the four places, side by side
//
// This is the check the cell exists for. Nobody reading one of the four can see
// whether the others still agree, so they are compared here in one place.
//
// Note what is NOT asserted: that the four sets are IDENTICAL. The bug-fixing
// section legitimately names only the PM, because a bug's ADR is the PM's by the
// same table row; demanding "architect" there would be a red over correct text.
// What must hold is that no place hands the engineer an ADR, and that every place
// hands it to somebody.

const places = [
  [`${PRINCIPLES} → who-writes table, ADR row`, rolesNamed(principlesRow.writer), principlesRow.writer],
  [`${PM} → short table, ADR row`, rolesNamed(pmRow.writer), pmRow.writer],
  ...(() => {
    const bug = adrWritersInProse(bugSection);
    const writeSet = adrWritersInProse(forbid);
    return [
      [`${ENGINEER} → bug-fixing section`, bug.roles, bug.evidence.join(" / ")],
      [`${ENGINEER} → write-set section`, writeSet.roles, writeSet.evidence.join(" / ")],
    ];
  })(),
];

const show = (rows) => rows
  .map(([name, roles, from]) => `${name}: [${roles.join(", ") || "nobody"}]  from ${JSON.stringify(String(from).slice(0, 160))}`)
  .join("\n      ");

const silent = places.filter(([, roles]) => roles.length === 0);
check(
  "all four places really do claim an owner for an ADR",
  silent.length === 0,
  `${silent.length} place(s) name nobody, so the agreement check below would pass on silence:\n      ${show(places)}`,
);

const hands_to_engineer = places.filter(([, roles]) => roles.includes("engineer"));
check(
  "the four places agree: an ADR is the architect's or the PM's, and never the engineer's",
  hands_to_engineer.length === 0,
  `${hands_to_engineer.length} place(s) hand an ADR to the engineer:\n      ${show(hands_to_engineer)}\n      All four:\n      ${show(places)}`,
);

const strangers = places.filter(([, roles]) => roles.some((role) => role !== "architect" && role !== "PM"));
check(
  "and no fifth role has appeared in any of the four",
  strangers.length === 0,
  `a role outside {architect, PM} is named as an ADR writer:\n      ${show(strangers)}`,
);

done();
