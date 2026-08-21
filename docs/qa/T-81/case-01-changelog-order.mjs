// T-81 (checklist C-61) — DoD: PRD M1 item 15; T-81 item 1.
// It also closes `docs/qa/gaps.md` item 22.
//
// What it proves: `CHANGELOG.md` is ordered newest first, it carries the 0.9.0
// section this job wrote, and its top section agrees with `package.json`.
//
// ---------------------------------------------------------------------------
// WHY THIS FILE EXISTS AT ALL. Three facts about this file used to be pinned by
// `docs/qa/T-61/case-04-unreleased-is-at-the-top.mjs`: newest first, the version
// sections in descending order, and the top section lining up with
// `package.json`. That case was DELETED when 0.8.0 was released, because it was
// written as `headings[0] === "## unreleased"` — it pinned A MOMENT ("this work
// is not released yet") rather than A RULE. Releasing is exactly the act that
// makes such a pin wrong, so the pin had to go, and the two ordering checks that
// were only living inside it went with it. `docs/qa/gaps.md` item 22 records the
// hole and states the shape of the replacement in one line: rewrite the ordering
// checks so they DO NOT DEPEND ON THE UNRELEASED STATE.
//
// So the rule below has two branches and needs neither one to be today's:
//
//   * the top section is MARKED UNRELEASED -> the work is written down but the
//     version does not exist yet, so its number must be NEWER than the released
//     `package.json` version. That is today: `## 0.9.0 — unreleased` over a
//     `package.json` still holding 0.8.0, which PRD item 15 (corrected v6 -> v7)
//     requires this job to leave alone.
//   * the top section is NOT marked unreleased -> it is a released version, so
//     its number must EQUAL `package.json`. That is the day the user releases:
//     the word `unreleased` gets replaced by a date and `package.json` moves to
//     0.9.0 in the same act. This case must stay green that day, and mutation
//     proof (3) in the QA report is exactly that day, run in a copy.
//
// ---------------------------------------------------------------------------
// WHY THE VERSION IS PARSED INTO THREE NUMBERS. Sorting version strings as text
// is wrong the first time a minor number reaches ten: "0.10.0" < "0.9.0" as
// text, so a text comparator would call a correctly ordered file broken. This
// repository is at 0.9.0 and will meet 0.10.0, so the trap is not theoretical.
// Checks 1 and 2 below are a self-test of the comparator: 1 shows the numeric
// comparator gets that pair right, 2 shows the text comparison gets it wrong.
// Check 2 is not decoration — it proves the trap this case is built to avoid is
// real, so a later reader cannot "simplify" the comparator back into a string
// compare and still see a green run.
//
// ---------------------------------------------------------------------------
// WHY IT DOES NOT ASSERT "THE TOP SECTION IS EXACTLY 0.9.0". T-81 item 1 says
// there is a 0.9.0 section and it is at the top. Pinned literally, that
// sentence goes red the day 0.10.0 is written — the same mistake that killed
// the old case, and `gaps.md` item 22 (with item 18) asks for the opposite. So
// item 1 is covered by three checks that keep holding afterwards: the 0.9.0
// section EXISTS (check 4), the top section is NOT OLDER than 0.9.0 (check 5),
// and the sections are in strictly descending order (check 6). Today only
// 0.9.0 satisfies all three at once, which is item 1; tomorrow 0.10.0 sits on
// top of 0.9.0 and all three still hold. This reading was reported to the PM.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

// ------------------------------------------------------------------ helpers

/** Parse `major.minor.patch` out of a heading. Returns null when there is none. */
function parseVersion(heading) {
  const found = /(\d+)\.(\d+)\.(\d+)/.exec(heading);
  return found ? [Number(found[1]), Number(found[2]), Number(found[3])] : null;
}

/**
 * Compare two `[major, minor, patch]` triples NUMERICALLY.
 * Positive when `a` is newer than `b`, negative when older, 0 when equal.
 */
function compareVersions(a, b) {
  for (let part = 0; part < 3; part += 1) {
    if (a[part] !== b[part]) return a[part] - b[part];
  }
  return 0;
}

const show = (triple) => triple.join(".");

// ------------------------------------------------- 1 and 2: the comparator

const trap = ["0.10.0", "0.9.0"];
const [ten, nine] = trap.map(parseVersion);

check(
  `the numeric comparator says ${trap[0]} is newer than ${trap[1]}`,
  compareVersions(ten, nine) > 0,
  `compareVersions returned ${compareVersions(ten, nine)}, so this case would misjudge the order of every version after 0.9.x`,
);

check(
  `comparing the same pair as text gets it wrong, so the numeric comparison is needed`,
  trap[0] < trap[1],
  "text comparison no longer puts 0.10.0 before 0.9.0 — re-check this case's reason for parsing three numbers",
);

// ------------------------------------------------------ read the two files

const changelog = repoFile("CHANGELOG.md");
const released = parseVersion(JSON.parse(repoFile("package.json")).version);

const headings = changelog.split("\n").filter((line) => line.startsWith("## "));
const sections = [];
for (const heading of headings) {
  const version = parseVersion(heading);
  if (version) sections.push({ heading: heading.trim(), version });
}

const skipped = headings.length - sections.length;
if (skipped > 0) {
  console.log(`note  ${skipped} of ${headings.length} "## " heading(s) carry no version number and are not part of the order`);
}
console.log(`note  ${sections.length} version section(s), newest heading: ${sections[0] ? sections[0].heading : "none"}`);
console.log(`note  package.json version: ${released ? show(released) : "unparsable"}`);

// ----------------------------------------------------- 3: not a vacuous run

check(
  "CHANGELOG.md has at least two version sections, so the order check judges something",
  sections.length >= 2,
  `found ${sections.length} version section(s) among ${headings.length} "## " heading(s) — an order check over fewer than two sections can never fail`,
);

if (sections.length === 0) {
  console.error("FAIL  no version section at all: the remaining checks cannot run");
  done();
}

// ------------------------------------------- 4 and 5: the 0.9.0 section (item 1)

const wanted = [0, 9, 0];

check(
  "CHANGELOG.md has a 0.9.0 section",
  sections.some((entry) => compareVersions(entry.version, wanted) === 0),
  `no "## " heading names 0.9.0; the headings are: ${sections.map((entry) => show(entry.version)).join(", ")}`,
);

check(
  "the top version section is not older than 0.9.0",
  compareVersions(sections[0].version, wanted) >= 0,
  `the newest section is ${sections[0].heading}, which is older than 0.9.0 — this job's entry is not on top`,
);

// --------------------------------------------------- 6: newest first, in order

const reversedPairs = [];
for (let index = 0; index + 1 < sections.length; index += 1) {
  const above = sections[index];
  const below = sections[index + 1];
  if (compareVersions(above.version, below.version) <= 0) {
    reversedPairs.push(`"${above.heading}" is above "${below.heading}"`);
  }
}

check(
  "the version sections run strictly newest first",
  reversedPairs.length === 0,
  `${reversedPairs.length} pair(s) in the wrong order: ${reversedPairs.join("; ")}`,
);

// ------------------------------- 7a and 7b: the top section against package.json
//
// The heading is flattened before the word is looked for, so a heading that
// wraps, or that spaces `unreleased` differently, is still read correctly.

const topIsUnreleased = /unreleased/i.test(flat(sections[0].heading));
const topMatchesPackage = released !== null && compareVersions(sections[0].version, released) === 0;

check(
  "the top section is either marked unreleased or names exactly the released version",
  topIsUnreleased || topMatchesPackage,
  `the top section is "${sections[0].heading}" with no "unreleased" mark, while package.json holds `
  + `${released ? show(released) : "an unparsable version"} — a dated section a reader can install must be the released version`,
);

// 7b is the tighter form of the same rule, and it is what keeps an unreleased
// section honest: `## 0.8.0 — unreleased` over a released 0.8.0 passes 7a on the
// word alone, and it is nonsense — that version is out. So: an unreleased
// section must be STRICTLY NEWER than what is released, and a released section
// must be EQUAL to it. Both branches are checked here, and neither is today's.
const consistent = released === null
  ? false
  : topIsUnreleased
    ? compareVersions(sections[0].version, released) > 0
    : compareVersions(sections[0].version, released) === 0;

check(
  `the top section's number fits its state: ${topIsUnreleased ? "unreleased, so newer than" : "released, so equal to"} package.json`,
  consistent,
  `the top section is "${sections[0].heading}" while package.json holds ${released ? show(released) : "an unparsable version"}`,
);

if (topIsUnreleased) {
  console.log(
    `note  the top section is unreleased: ${show(sections[0].version)} over released ${released ? show(released) : "?"}`
    + " — PRD M1 item 15 (v7) keeps package.json where it is, and this case stays green when the release moves it",
  );
}

done();
