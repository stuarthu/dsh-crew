// T-110 DoD items 1 and 2: the `### Changed` block of the unreleased section
// tells the user, in their own words, that a question can now be left undecided
// and that "not in scope" is now a short list of things with a real cost.
//
// What it proves: the one file a user reads to find out what changed says what
// changed. This job nearly shipped without it — none of the first sixteen DoD
// items named `CHANGELOG.md`, and no task owned the file, while the READMEs were
// being edited to tell users about a new option they now have. A change the user
// is told about everywhere except the change log is a change they find by
// accident.
//
// WHY THE ANCHORS ARE CONCEPTS AND NOT SENTENCES. DoD item 6 requires this
// section to be written in the user's language and NOT to copy the authoritative
// paragraphs. So a case pinning the canonical wording here would be pinning the
// exact thing the DoD forbids. Every check below names a thing that must be SAID;
// none of them dictates how. The two strings the DoD itself gives — `leave it
// undecided`, and `not in scope` with `real cost` — are pinned as given.
//
// What it does NOT prove: that the entry reads well, or that a user would
// understand it. That is DoD item 6 and it belongs to a doc reviewer.
//
// PINNING STYLE: FLATTENED (the entries are wrapped prose) and sliced to the
// `### Changed` block of the `0.10.0` section only, the release this entry
// shipped in — an entry under any other version must not be able to answer for
// this one. The section is found by its heading, not by being on top: the next
// version's section goes on top of it, and that does not make this entry go
// missing (T-136; ADR 0018, ADR 0028).

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("CHANGELOG.md");

/** The version this job's entry shipped in. */
const VERSION = "0.10.0";

/** The `## 0.10.0 — …` section, up to the next `## `. The space after the version is the boundary. */
function shippedSection(source) {
  const lines = source.split("\n");
  const first = lines.findIndex((line) => line.startsWith(`## ${VERSION} `));
  if (first === -1) throw new Error(`CHANGELOG.md has no \`## ${VERSION} \` section`);
  const next = lines.findIndex((line, index) => index > first && /^## /.test(line));
  return { heading: lines[first], text: lines.slice(first, next === -1 ? lines.length : next).join("\n") };
}

/** One `### ` block inside a section. */
function subSection(section, name) {
  const lines = section.split("\n");
  const first = lines.findIndex((line) => line.trim() === `### ${name}`);
  if (first === -1) return null;
  const next = lines.findIndex((line, index) => index > first && /^### /.test(line));
  return lines.slice(first, next === -1 ? lines.length : next).join("\n");
}

const shipped = shippedSection(text);
const changed = subSection(shipped.text, "Changed");

console.log(`section: ${shipped.heading}`);

check(
  `the ${VERSION} section has a \`### Changed\` block`,
  changed !== null,
  "this job changed how the interview behaves; with no Changed block the entry has nowhere correct to live",
);

if (changed === null) done();

const words = flat(changed);
console.log(`### Changed: ${changed.length} characters over ${changed.split("\n").length} lines`);

// `### Changed` must come after `### Added`, per the DoD.
const added = subSection(shipped.text, "Added");
if (added !== null) {
  check(
    "`### Changed` sits after `### Added`",
    shipped.text.indexOf("### Added") < shipped.text.indexOf("### Changed"),
    "the two blocks are in the wrong order for this file's shape",
  );
}

// ------------------------------------------------------------- DoD item 1
check(
  "the Changed block carries the string the DoD names: `leave it undecided`",
  /leave it undecided/i.test(words),
  "the option the user gains is not named in the change log",
);

check(
  "it says the option appears beside the recommended answer, on a question that qualifies",
  /recommended/i.test(words) && /option/i.test(words),
  "a user has to know WHERE they will meet this, or they will not recognise it when they do",
);

check(
  "it states the test a question has to pass, in user terms",
  /what gets built/i.test(words) && /what gets released/i.test(words),
  "without the test the user cannot tell why one question offers the option and the next does not",
);

check(
  "it warns that merely being able to start without the answer is not enough",
  /not\b[^.]{0,40}enough/i.test(words),
  "this is the half the second security review moved from standard to counter-example;"
    + " a change log that omits it teaches the user the rule that was just rejected",
);

check(
  "it says a question that fails the test is not offered the option, and the user is told why",
  /not offered/i.test(words) && /one line/i.test(words),
  "the user needs to know that a missing option is deliberate, not an oversight",
);

check(
  "it says what taking the option buys: the thing is recorded nowhere in the opening document",
  /nowhere/i.test(words),
  "the promise is the reason the option is worth anything",
);

check(
  "it names all three places it will not be recorded",
  /interview settled/i.test(words) && /not in scope/i.test(words) && /still undecided/i.test(words),
  "a user who later finds the item under one of the three has been told something untrue",
);

check(
  "it says the user can ask later and reopen nothing",
  /reopening nothing|nothing about it\s+was ever written down/i.test(words),
  "this is the benefit in the user's own terms; without it the entry describes a mechanism and no gain",
);

// ------------------------------------------------------------- DoD item 2
check(
  'the Changed block carries the two strings the DoD names for "not in scope"',
  /not in scope/i.test(words) && /real cost/i.test(words),
  "the second half of what changed is not in the change log",
);

check(
  "it gives all three costs that put a line on that list",
  /built a second time|built again/i.test(words)
    && /(take back|undone)/i.test(words)
    && /(safety guard|permission rule)/i.test(words),
  "the third cost — weakening a safety guard or a permission rule — was added by the second security review;"
    + " a list of two teaches the user the older, narrower rule",
);

check(
  "it gives the undoable cost by example",
  /package published/i.test(words) && /tag pushed/i.test(words) && /data deleted/i.test(words),
  "abstract costs are not something a reader can recognise in a real list",
);

check(
  "it says what now stays OFF the list",
  /did not get\s*to|merely did not/i.test(words),
  "this is the change; a description of the inclusion rule alone says nothing new",
);

check(
  "it tells the user what the shorter list means for them: on it is a wall, off it just ask",
  /\bwall\b/i.test(words) && /just ask/i.test(words),
  "without this the user has been told about a rewrite of an internal rule and given no use for it",
);

done();
