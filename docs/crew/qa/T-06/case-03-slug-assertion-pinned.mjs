// Task T-06 — acceptance check 46 (CRD 0002).
// The slug rule is pinned by tools/verify-mount.mjs: removing the pattern from
// roles/pm.md has to turn the check red and name the file. Done in a copy of the
// repository; the repository itself is never changed.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRepo, runCheck, cleanUp, check, done } from "../lib/qa.mjs";

const PATTERN = "^[a-z0-9]([a-z0-9-]*[a-z0-9])?$";

const dir = tempRepo();
try {
  const file = join(dir, "roles", "pm.md");
  const original = readFileSync(file, "utf8");

  const base = runCheck(dir, "tools/verify-mount.mjs");
  check("the untouched copy passes verify-mount", base.status === 0, base.out.slice(-600));
  check("the slug pattern is in roles/pm.md", original.includes(PATTERN));

  writeFileSync(file, original.split(PATTERN).join("<removed by QA>"));
  const broken = runCheck(dir, "tools/verify-mount.mjs");
  writeFileSync(file, original);

  check("removing the slug pattern turns verify-mount red", broken.status !== 0, broken.out.slice(-600));
  check("the failure names roles/pm.md", /FAIL[\s\S]*roles\/pm\.md/.test(broken.out), broken.out.slice(-600));
  check("the failure names the pattern itself",
    broken.out.includes(PATTERN), broken.out.slice(-600));
} finally {
  cleanUp(dir);
}

done();
