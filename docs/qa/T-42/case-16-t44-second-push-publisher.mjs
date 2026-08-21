// T-42, DoD item 5b (2 of 3): a SECOND workflow that publishes on every branch
// push must go red, and the FAIL must name that file.
//
// This is the hole T-43 reported and T-44 closed: publish.yml stays untouched
// and perfect, so a pin that read that one file by name was green while the
// repository really published on every push to a branch. host/git-guard.js reads
// every workflow file, so the guard would still have refused a crew agent's
// push — the hole was in the pin, and the pin's job is to stop such a file
// existing at all.

import { check, done, tempRepo, runCheck, cleanUp, put, copyFile, edit, expectRed, expectGreen, saidOk, failLines } from "../lib/qa.mjs";

const OK = "workflow files under .github/workflows/ carry a live `npm publish`";
const NO_TAG_FILTER = "publishes and has no v* tag filter on its push trigger";

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green");

  put(dir, ".github/workflows/release.yml", `name: Release

on: push

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: npm publish --access public
`);
  const run = runCheck(dir, "tools/verify-mount.mjs");
  expectRed(run, ".github/workflows/release.yml", "a second workflow publishing on every push is red");
  check("and the FAIL is about the missing tag filter", failLines(run).some((line) => line.includes(NO_TAG_FILTER)), run.out);
  check("the good publish.yml cannot vouch for the folder: no `ok` line is printed", !saidOk(run, OK), run.out);
  check("and the FAIL does not blame publish.yml, which is untouched", !failLines(run).some((line) => line.includes("publish.yml")), run.out);
} finally {
  cleanUp(dir);
}

// The same point with two REAL publishers, one correct and one not: the FAIL
// must name only the broken file. `.yaml` counts too — GitHub reads it exactly
// like `.yml` — and the publish command here is a body line of a `run: |` block,
// the third of the three shapes the pin accepts.
const two = tempRepo();
try {
  put(two, ".github/workflows/release.yaml", `name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - run: |
          npm test
          npm publish --access public
`);
  const run = runCheck(two, "tools/verify-mount.mjs");
  expectRed(run, ".github/workflows/release.yaml", "a `.yaml` publisher with a branches filter is red");
  check("only the broken file is named", !failLines(run).some((line) => line.includes("publish.yml")), run.out);
} finally {
  cleanUp(two);
}

// And the folder-wide reading must not have cost the old certainty: publish.yml
// itself, broken, is still caught when a second correct publisher sits beside it.
const both = tempRepo();
try {
  put(both, ".github/workflows/publish-2.yml", copyFile(both, ".github/workflows/publish.yml"));
  edit(both, ".github/workflows/publish-2.yml", 'on:\n  push:\n    tags: ["v*"]\n', 'on:\n  push:\n    branches: [main]\n    tags: ["v*"]\n');
  const run = runCheck(both, "tools/verify-mount.mjs");
  expectRed(run, ".github/workflows/publish-2.yml", "one broken publisher among two is red");
  check("and no `ok` line claims the folder is fine", !saidOk(run, OK), run.out);
} finally {
  cleanUp(both);
}

// Two byte-identical correct publishers must stay green: two releases are odd,
// but neither of them can publish from a branch.
const twins = tempRepo();
try {
  put(twins, ".github/workflows/publish-2.yml", copyFile(twins, ".github/workflows/publish.yml"));
  const run = runCheck(twins, "tools/verify-mount.mjs");
  expectGreen(run, "two identical, correct publishers stay green");
  check("and the `ok` line names both of them", okLinesName(run, ["publish.yml", "publish-2.yml"]), run.out);
} finally {
  cleanUp(twins);
}

/** Does the publisher `ok` line name every one of these files? */
function okLinesName(run, names) {
  const line = run.out.split("\n").find((candidate) => candidate.startsWith("ok") && candidate.includes(OK));
  return line !== undefined && names.every((name) => line.includes(name));
}

done();
