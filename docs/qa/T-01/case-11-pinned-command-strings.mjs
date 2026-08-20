// Task T-01 — acceptance checks 2, 17 and 27.
// Proves each pinned command string of the merge step is really in roles/pm.md
// AND that removing it on its own turns `node tools/verify-mount.mjs` red with
// roles/pm.md named in the output. The repository is copied to a temporary
// folder first; the repository's own files are never changed.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tempRepo, runCheck, cleanUp, check, done } from "../lib/qa.mjs";

// The four commands of decision H plus the three strings of W. The eighth
// pinned string is the job-slug pattern and belongs to T-06.
const PINNED = [
  "git merge --no-ff",
  "git branch -d crew/",
  "git push origin --delete",
  "git branch --merged main",
  "--ff-only",
  "origin/crew/",
  "publishCheck",
];

const dir = tempRepo();
try {
  const file = join(dir, "roles", "pm.md");
  const original = readFileSync(file, "utf8");

  const base = runCheck(dir, "tools/verify-mount.mjs");
  check("the untouched copy passes verify-mount", base.status === 0, base.out.slice(-600));

  for (const pinned of PINNED) {
    check(`roles/pm.md contains ${pinned}`, original.includes(pinned));
    writeFileSync(file, original.split(pinned).join("<removed by QA>"));
    const broken = runCheck(dir, "tools/verify-mount.mjs");
    writeFileSync(file, original);
    check(`removing ${pinned} turns verify-mount red`, broken.status !== 0, broken.out.slice(-600));
    check(`the failure for ${pinned} names roles/pm.md`,
      /FAIL[\s\S]*roles\/pm\.md/.test(broken.out), broken.out.slice(-600));
  }
} finally {
  cleanUp(dir);
}

done();
