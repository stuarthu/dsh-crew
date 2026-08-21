// T-59, DoD item 12: the version line was not touched. This job does not release.
//
// What it proves, and this is the subtle one: the released-version box at the top
// of each README still describes the RELEASED package. It says eight roles while
// the role table below it says nine, and that is DELIBERATE — the PM ruled it
// stays. Adding the two new roles to that box would describe unreleased work as
// released, which is a worse error than a box that is behind. The whole box moves
// as one piece at the next release.
//
// So this case pins the box's version number, not its role count: it goes red if
// somebody bumps the version inside this job (which the PRD puts out of scope), and
// it stays green while the box legitimately lags behind the table. Reading it
// alongside `case-04`, which requires nine rows in the table, the deliberate
// mismatch is written down in a place a future reader will actually run.

import { check, done, readmes } from "./readmes.mjs";
import { repoFile } from "../lib/qa.mjs";

const version = JSON.parse(repoFile("package.json")).version;

for (const readme of readmes()) {
  const box = readme.text.split("\n").filter((line) => line.includes(version));

  check(
    `${readme.path}: the version box still names the released version ${version}`,
    box.length > 0,
    `no line in the file names ${version} — this job does not release, so the version must not move`,
  );

  check(
    `${readme.path}: no line claims a version newer than the released one`,
    !/\b0\.(?:[89]|1[0-9])\.\d+\b/.test(readme.text.replace(new RegExp(version.replace(/\./g, "\\."), "g"), "")),
    "a newer version number appears in the file",
  );
}

console.log(
  `note  the version box legitimately lags the role table: it belongs to released ${version}`
  + " and moves as one block at the next release (PM's ruling, not a defect)",
);

done();
