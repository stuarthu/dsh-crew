// T-42, DoD item 5b, the ugly inputs T-44's own set covered and the three
// headline cases do not: an empty folder and a repository with nothing to
// publish. Both are about the pin failing OUT LOUD rather than throwing or
// falling silent — an exception here would take every check after it down with
// it, and a silent green would read exactly like a green that checked something.

import { check, done, tempRepo, runCheck, cleanUp, drop, editJson, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const NOTHING_PUBLISHES = "no workflow under .github/workflows/ runs `npm publish`";
const CHECKED_NOTHING = "there is no release to gate — this pin checked nothing";
const LATER = "PM prompt section registered";

// No .github folder at all. The package is not private, so it IS published from
// somewhere this check can no longer read: red.
const gone = tempRepo();
try {
  drop(gone, ".github");
  const run = runCheck(gone, "tools/verify-mount.mjs");
  expectRed(run, NOTHING_PUBLISHES, "no .github/workflows folder at all is red");
  check("the message says which files it read (none)", run.out.includes("workflow files read: none"), run.out);
  // The proof that it failed rather than threw: the run carried on to a check
  // far below this one.
  check(`the run carried on to later checks (ok ${LATER})`, saidOk(run, LATER), run.out);
} finally {
  cleanUp(gone);
}

// A repository with nothing to publish: the release workflow gone AND
// `private: true`, so `npm publish` would refuse anyway. Green — and it must say
// out loud that it pinned nothing, instead of an `ok` line claiming a tag-only
// release it never read.
const priv = tempRepo();
try {
  drop(priv, ".github/workflows/publish.yml");
  editJson(priv, "package.json", (manifest) => { manifest.private = true; });
  const run = runCheck(priv, "tools/verify-mount.mjs");
  expectGreen(run, "a private package with no publishing workflow stays green");
  check("and it says out loud that it checked nothing", saidOk(run, CHECKED_NOTHING), run.out);
  check("no `ok` line claims a tag-only release was pinned", !saidOk(run, "is tag-only on push"), run.out);
} finally {
  cleanUp(priv);
}

// The same repository WITHOUT the private flag: the release moved somewhere this
// check cannot read, which is the T-41 hole again.
const public_ = tempRepo();
try {
  drop(public_, ".github/workflows/publish.yml");
  const run = runCheck(public_, "tools/verify-mount.mjs");
  expectRed(run, NOTHING_PUBLISHES, "a public package with no publishing workflow is red");
  check("and the message names the files it did read", run.out.includes("workflow files read: test.yml"), run.out);
} finally {
  cleanUp(public_);
}
done();
