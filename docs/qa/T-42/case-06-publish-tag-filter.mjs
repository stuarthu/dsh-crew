// T-42, DoD item 3 (T-41's pins, part 1 of 3): a publishing workflow must be
// tag-only on push. `npm publish` is the one action in this repository that
// cannot be undone, and host/git-guard.js lets a crew agent push an ordinary
// branch precisely BECAUSE it reads this file as tag-only — so a branch trigger
// here would leave the guard waving through pushes that each cut a release.

import { check, done, tempRepo, runCheck, cleanUp, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const OK = "workflow files under .github/workflows/ carry a live `npm publish`";
const NO_TAG_FILTER = "publishes and has no v* tag filter on its push trigger";
const PUBLISH_YML = ".github/workflows/publish.yml";
const TRIGGER = 'on:\n  push:\n    tags: ["v*"]\n';

const withTrigger = (replacement, assert) => {
  const dir = tempRepo();
  try {
    edit(dir, PUBLISH_YML, TRIGGER, replacement);
    assert(runCheck(dir, "tools/verify-mount.mjs"));
  } finally {
    cleanUp(dir);
  }
};

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green (so a red below is the mutation)");
  check(`the copy says: ok ${OK}`, saidOk(base, OK), base.out);
} finally {
  cleanUp(dir);
}

// Red: no filter at all — every branch push would publish.
withTrigger("on: push\n", (run) => {
  expectRed(run, NO_TAG_FILTER, "a bare `on: push` on the publisher is red");
  check("and no `ok` line claims the folder is tag-only", !saidOk(run, OK), run.out);
});
// Red: the filter is gone and only a comment quotes it. A whole-file `includes`
// pin would have been green here — that is why this one is line-anchored.
withTrigger('on:\n  push:\n    # tags: ["v*"]\n', (run) => expectRed(run, NO_TAG_FILTER, "a commented-out tag filter is red"));
// Red: a tag filter that is not the v-glob the `ok` line claims.
withTrigger('on:\n  push:\n    tags: ["release-*"]\n', (run) => expectRed(run, NO_TAG_FILTER, "a non-v tag glob is red"));
// Red: a branches filter beside the tag filter. This is the T-43 shape: the pin
// and the guard read the same lines, and the guard would go on calling it
// tag-only.
withTrigger('on:\n  push:\n    branches: [main]\n    tags: ["v*"]\n', (run) => {
  expectRed(run, "filters branches as well as v* tags on its push trigger", "a `branches:` filter beside the tag filter is red");
});
// Red: no push trigger this pin can read at all — it must say so, not fall
// silent, because the guard reads the same shape to decide the same question.
withTrigger("on:\n  workflow_dispatch:\n", (run) => {
  expectRed(run, "has no `push:` trigger this pin can read", "a publisher with no push trigger is red");
});

// Red: `branches-ignore:` is the other spelling of "a branch push starts this
// run", and host/git-guard.js's branchPushTriggers() treats the two the same.
withTrigger('on:\n  push:\n    branches-ignore: [docs]\n    tags: ["v*"]\n', (run) => {
  expectRed(run, "filters branches as well as v* tags on its push trigger", "a `branches-ignore:` filter beside the tag filter is red");
});
// Red: the tag filter moved out of the `push:` block. Only the push trigger's own
// filters decide what a branch push can do, so a `tags:` under another trigger
// leaves the push unfiltered.
withTrigger("on:\n  push:\n  pull_request:\n    tags: [\"v*\"]\n", (run) => {
  expectRed(run, NO_TAG_FILTER, "a `tags:` filter under another trigger does not count");
});

// Green: a commented-out `branches:` cannot start anything. `#` is not
// whitespace, so it must not trip the branch filter — the mirror image of the
// commented-out tag filter above, which must not satisfy one.
withTrigger('on:\n  push:\n    # branches: [main]\n    tags: ["v*"]\n', (run) => {
  expectGreen(run, "a commented-out `branches:` filter stays green");
});
// Green: YAML 1.1 reads a bare `on` as the boolean true, so `"on":` is a legal
// spelling of the same key. A walk that could not see it would be blind to the
// whole trigger — which is exactly where a `branches:` filter would hide.
withTrigger('"on":\n  push:\n    tags: ["v*"]\n', (run) => {
  expectGreen(run, 'the quoted `"on":` key stays green (a walk that missed it would be blind to the trigger)');
});
// And the quoted key must not become a blind spot: the same file with a branches
// filter under it is still red.
withTrigger('"on":\n  push:\n    branches: [main]\n    tags: ["v*"]\n', (run) => {
  expectRed(run, "filters branches as well as v* tags on its push trigger", 'a `branches:` filter under a quoted `"on":` key is still red');
});

// Green: the block spelling of the same filter, and a tightened but still legal
// v-glob. A `branches:` under `pull_request:` is a sibling, not a branch push.
withTrigger('on:\n  push:\n    tags:\n      - "v*"\n', (run) => {
  expectGreen(run, "the block spelling of the tag filter stays green");
  check(`block tags: still ok ${OK}`, saidOk(run, OK), run.out);
});
withTrigger('on:\n  push:\n    tags: ["v[0-9]*"]\n', (run) => expectGreen(run, "a tightened v-glob `v[0-9]*` stays green"));
withTrigger('on:\n  push:\n    tags: ["v*"]\n  pull_request:\n    branches: [main]\n', (run) => {
  expectGreen(run, "a `branches:` filter under `pull_request:` stays green (it is not a branch push)");
});

done();
