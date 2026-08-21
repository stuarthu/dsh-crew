// T-42, DoD item 5b (1 of 3): the SAME publishing workflow under a different
// name must stay green.
//
// T-41 and T-43 pinned the release workflow by the name `publish.yml`. Renaming
// it is allowed — the trusted-publisher setting on npmjs.com names the workflow
// file, so a rename is a real, correct change — and the old pin reddened a file
// that was still perfectly right. A gate that reds correct files teaches people
// to stop reading it. T-44 made the pin read the FOLDER and decide by content.

import { check, done, tempRepo, runCheck, cleanUp, rename, expectGreen, okLines, saidOk } from "../lib/qa.mjs";

const OK = "workflow files under .github/workflows/ carry a live `npm publish`";
const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green");
  check("the copy's `ok` line names publish.yml as the publisher", okLines(base).some((line) => line.includes(OK) && line.includes("publish.yml")), base.out);

  rename(dir, ".github/workflows/publish.yml", ".github/workflows/release.yml");
  const run = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(run, "the release workflow renamed, contents untouched, stays green");
  // Not just green: the pin has to say it read the renamed file, or a green would
  // only mean it found nothing to check.
  check(
    "and the `ok` line names release.yml, so the pin really read the renamed file",
    okLines(run).some((line) => line.includes(OK) && line.includes("release.yml")),
    run.out,
  );
  check("the push-CI pin is unaffected by the rename", saidOk(run, ".github/workflows/test.yml runs npm test on a push"), run.out);
} finally {
  cleanUp(dir);
}
done();
