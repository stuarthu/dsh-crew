// Task T-01 — acceptance check 11.
// Read-only look at git. package.json may not be part of this job's change, and
// each task's commit may only hold the files that task owns.
//
// The DoD wording ("under host/ only host/git-guard.js") was written at version
// 4, before CRD 0003 handed host/crew.js to T-07. Both are listed here and the
// stale wording is printed as a note.
import { spawnSync } from "node:child_process";
import { REPO, check, done } from "../lib/qa.mjs";

const git = (...args) => (spawnSync("git", args, { cwd: REPO, encoding: "utf8" }).stdout ?? "").trim();

// This job's commits, found by the task markers in their subject lines, so an
// amended commit is still found.
const OWNED = {
  "(crew T-01, T-06)": ["roles/pm.md", "tools/verify-mount.mjs"],
  "(crew T-05)": ["host/git-guard.js", "tools/verify-guard.mjs"],
  "(crew T-07)": ["cordis.patch.yml", "host/crew.js"],
};
const log = git("log", "--format=%H%x09%s", "-n", "60").split("\n").filter(line => line.length > 0);
const ALLOWED_HOST = new Set(["host/git-guard.js", "host/crew.js"]);
const everyFile = new Set();

for (const [marker, owned] of Object.entries(OWNED)) {
  const line = log.find(entry => entry.includes(marker));
  if (line === undefined) {
    check(`the commit for ${marker} is in the history`, false, "the acceptance evidence for this task is gone");
    continue;
  }
  const [hash] = line.split("\t");
  const files = git("show", "--name-only", "--format=", hash).split("\n").filter(name => name.length > 0);
  for (const file of files) everyFile.add(file);
  check(`${marker} ${hash.slice(0, 7)} touches only the files that task owns`,
    files.length === owned.length && owned.every(file => files.includes(file)),
    `owns ${owned.join(", ")}; touched ${files.join(", ")}`);
}

check("package.json is in none of this job's commits", !everyFile.has("package.json"),
  [...everyFile].join(", "));
const host = [...everyFile].filter(file => file.startsWith("host/"));
check("under host/ only the files a task owns changed", host.every(file => ALLOWED_HOST.has(file)),
  host.join(", "));
console.log(`note  host/ files across this job's commits: ${host.join(", ") || "none"}`);
console.log("note  DoD check 11 still says host/git-guard.js is the only allowed file under host/;");
console.log("note  CRD 0003 (DoD version 11) gives host/crew.js to T-07, so that wording is stale.");

done();
