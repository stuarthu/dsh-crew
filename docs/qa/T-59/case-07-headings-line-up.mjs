// T-59, DoD item 8: `README-zh.md` says the same thing as `README.md` — the
// sections correspond one for one.
//
// What it proves: the Chinese page has not fallen behind. `CLAUDE.md` requires the
// two to be written in one commit, English first, and the failure this guards is
// the ordinary one: somebody adds a section to the English page and the Chinese
// reader silently gets a smaller product. The check is on the SHAPE of the two
// documents — how many headings and at which levels, in order — because the words
// are meant to differ and the structure is not.
//
// PINNING STYLE: LINE-BASED. A `## ` heading cannot wrap.
//
// What this does NOT prove, honestly: that the corresponding sections say the same
// thing. That is a doc reviewer's job, and the same-count check is exactly the
// mechanical half — it catches a section added to one file and not the other,
// which is the failure that actually happens.

import { check, done, headings, readmes } from "./readmes.mjs";

const [english, chinese] = readmes();
const enHeadings = headings(english.text);
const zhHeadings = headings(chinese.text);

check(
  "both READMEs have the same number of sections",
  enHeadings.length === zhHeadings.length,
  `README.md has ${enHeadings.length}, README-zh.md has ${zhHeadings.length}`
    + `\n      EN: ${enHeadings.join(" / ")}`
    + `\n      ZH: ${zhHeadings.join(" / ")}`,
);

const level = (line) => (line.match(/^#+/) ?? [""])[0].length;
const mismatches = [];
for (let index = 0; index < Math.min(enHeadings.length, zhHeadings.length); index += 1) {
  if (level(enHeadings[index]) !== level(zhHeadings[index])) {
    mismatches.push(`#${index + 1}: ${enHeadings[index]} || ${zhHeadings[index]}`);
  }
}

check(
  "the heading levels line up one for one, in order",
  mismatches.length === 0,
  mismatches.join("\n      "),
);

check(
  "the two files cross-link to each other",
  english.text.includes("README-zh.md") && chinese.text.includes("README.md"),
  "one of the two pages does not point at the other",
);

console.log(`note  ${enHeadings.length} section(s) in each README, levels aligned`);

done();
