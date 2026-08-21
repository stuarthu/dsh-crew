// T-42, DoD item 5b (3 of 3): a workflow whose only `npm publish` is a COMMENT
// must stay green, and must not be counted as a publisher.
//
// This is the T-37 hole — `#` is not whitespace — inside T-44's new folder-wide
// scan. A note about what somebody might add one day cannot publish anything, so
// judging it as a release would red a correct file. test.yml is the live proof
// that this matters: its own comments discuss publishing at length.

import { check, done, tempRepo, runCheck, cleanUp, put, expectGreen, okLines } from "../lib/qa.mjs";

const OK = "workflow files under .github/workflows/ carry a live `npm publish`";

/** The publisher `ok` line, or "" when it was not printed. */
const publisherLine = (run) => okLines(run).find((line) => line.includes(OK)) ?? "";

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green");
  check("the copy counts 1 publisher out of the folder", publisherLine(base).includes("1 of 2 workflow files"), base.out);

  // A workflow that runs on every branch push and only TALKS about publishing.
  put(dir, ".github/workflows/notes.yml", `name: Notes

on: push

jobs:
  notes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      # TODO: one day this could publish a canary build
      # run: npm publish --tag canary
      - run: echo nothing to do
`);
  const run = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(run, "a workflow whose only `npm publish` is a comment stays green");
  check("the file is counted in the folder (3 read)", publisherLine(run).includes("of 3 workflow files"), run.out);
  check("but it is NOT counted as a publisher (still 1)", publisherLine(run).startsWith("ok    1 of 3"), run.out);
  check("and notes.yml is not named as a publisher", !publisherLine(run).includes("notes.yml"), run.out);
} finally {
  cleanUp(dir);
}

// The same point for a workflow that does real work on every branch push and
// simply is not a release: normal, correct, and it must not be judged as one.
const lint = tempRepo();
try {
  put(lint, ".github/workflows/lint.yml", `name: Lint

on: push

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: npm run lint
`);
  const run = runCheck(lint, "tools/verify-mount.mjs");
  expectGreen(run, "a non-publishing workflow on every push stays green");
  check("and it is not named as a publisher", !publisherLine(run).includes("lint.yml"), run.out);
} finally {
  cleanUp(lint);
}
done();
