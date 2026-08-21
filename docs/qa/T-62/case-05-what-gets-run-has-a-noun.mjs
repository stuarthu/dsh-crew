// T-62, DoD item 4: "what gets run" is named with a noun — the unit test files
// the test engineer wrote — and, where the project's own test command runs those
// files, the project's test command.
//
// SCOPE, and this is the point of the case. The DoD cell says outright: do NOT
// count the whole file. `grep -c 'unit test' roles/pm.md` was already 4 when
// T-56 handed the file over, so a whole-file count is automatically true and
// proves nothing about T-62. This case counts inside step 4 of the flow ONLY.
// That scoping instruction came from T-56's own engineer, who spotted that the
// obvious check could not fail.
//
// PINNING STYLE: slice LINE-BASED (`flowItem(4)`), sentences FLATTENED.

import { check, done, flat, flowItem, pm } from "./paired.mjs";

const fourth = flat(flowItem(4));

check(
  "step 4 of the flow names the unit tests as what gets run",
  (fourth.match(/unit test/g) ?? []).length >= 1,
  "step 4 does not say `unit test` — vague here costs the whole signal",
);

check(
  "it names WHOSE unit tests: the ones the test engineer wrote",
  fourth.includes("the unit test files the test engineer wrote"),
  "step 4 does not name the author of the files it runs",
);

check(
  "it says to run the project's test command where that command runs those files",
  fourth.includes("the project's test command"),
  "step 4 does not offer the project's own test command",
);

check(
  "it says why being vague here is expensive",
  fourth.includes("vague here costs the whole signal"),
  "the reason for naming a noun is missing",
);

// The guard on this case's own premise: if the slice were ever empty or the whole
// file were counted by mistake, the checks above would pass on text from step 4
// of the PM prompt (a different thing entirely) or on T-56's passage. So prove
// the slice really is smaller than the file.
check(
  "the slice this case counted is a slice, not the whole file",
  flowItem(4).length < pm().length / 10,
  `the slice is ${flowItem(4).length} characters of a ${pm().length}-character file — too large to be one step`,
);

done();
