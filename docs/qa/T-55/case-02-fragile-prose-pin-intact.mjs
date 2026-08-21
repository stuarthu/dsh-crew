// T-55, DoD item 3: the prose string `the tree was moving` is still there, word
// for word.
//
// What it proves: T-55 added a signpost without disturbing anything else. This
// task was flagged in the task table as the one most likely to break somebody
// else's pin, because several of them hang on this file: `tools/verify-mount.mjs`
// pins this exact sentence, and `ADR 0004` and `ADR 0007` say that kind of pin is
// DELIBERATELY FRAGILE — a change of wording is supposed to go red, so that the
// person changing the prose has to come and change the check in the same commit.
//
// Why a second copy of a pin verify-mount.mjs already holds: that check is a
// project check, and this one is a QA case in the regression set that
// `docs/qa/run-all.sh` runs for every future task. The two fail at different
// moments and are read by different people. The task table asked for both.
//
// PINNING STYLE: this is the one pin here that is LINE-BASED on purpose — it is a
// fixed noun phrase that sits inside one line of the file, and the check that
// guards it in `tools/verify-mount.mjs` is line-based too. A flattened check would
// pass on a version where the sentence had been rewrapped in a way the project
// check rejects, and this case must not be softer than the check it doubles.

import { check, done, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/engineer.md");

check(
  "the fragile prose pin `the tree was moving` is intact, on one line",
  text.split("\n").some((line) => line.includes("the tree was moving")),
  "the string tools/verify-mount.mjs pins is gone or was rewrapped — ADR 0004 and ADR 0007 make this pin fragile on purpose",
);

for (const needle of ["docs/decisions/adr/", "docs/design/tasks.md", "DoD section"]) {
  check(
    `the string \`${needle}\`, also pinned by verify-mount.mjs, is intact`,
    text.includes(needle),
    "another role's check would go red over this",
  );
}

check(
  "the file still contains no `dod.md`",
  !text.includes("dod.md"),
  "`DoD` is the name of a section, never of a file",
);

check(
  "the file still contains no `{{`",
  !text.includes("{{"),
  "dsh would try to interpolate it at mount time",
);

done();
