// Task T-05 — acceptance check 28.
// Deletes the pattern's left-hand boundary in a COPY of the repository and shows
// that `node tools/verify-guard.mjs` goes red — so half the fix really is under
// test. The repository itself is never changed.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRepo, runCheck, cleanUp, check, done } from "../lib/qa.mjs";

const dir = tempRepo();
try {
  const file = join(dir, "host", "git-guard.js");
  const original = readFileSync(file, "utf8");

  const base = runCheck(dir, "tools/verify-guard.mjs");
  check("the untouched copy passes verify-guard", base.status === 0, base.out.slice(-800));

  const LEFT = "(^|${boundary})(";
  check("the pattern really has a left-hand boundary", original.includes(LEFT),
    "the pattern in host/git-guard.js does not look the way this case expects");
  writeFileSync(file, original.replace(LEFT, "("));
  const broken = runCheck(dir, "tools/verify-guard.mjs");
  writeFileSync(file, original);

  check("without the left boundary verify-guard goes red", broken.status !== 0, broken.out.slice(-800));
  check("and it names a longer name that only ends with push-ok",
    /FAIL[\s\S]*push-ok/.test(broken.out), broken.out.slice(-800));
} finally {
  cleanUp(dir);
}

done();
