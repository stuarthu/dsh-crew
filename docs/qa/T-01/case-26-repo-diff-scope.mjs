// Task T-01 — acceptance check 11.
// Read-only look at git. package.json may not be part of this job's change, and
// each task's commit may only hold the files that task owns.
//
// The DoD wording ("under host/ only host/git-guard.js") was written at version
// 4, before CRD 0003 handed host/crew.js to T-07. Both are listed here and the
// stale wording is printed as a note.
//
// Two things this case is careful about:
//
//  1. It searches the WHOLE history by marker (`git log -F --grep=…`, no `-n`),
//     never the last N commits. A fixed window slides past the evidence as the
//     project grows, and the case would then fail on every CI run for a reason
//     that is not a defect.
//  2. It tells "the history is not available here" apart from "the evidence is
//     gone", and when the history is not available it prints NO `ok` line for
//     anything that depends on the missing commits. A green line that checked
//     an empty set is worse than a red one.
import { spawnSync } from "node:child_process";
import { REPO, check, done } from "../lib/qa.mjs";

const run = (...args) => spawnSync("git", args, { cwd: REPO, encoding: "utf8" });
const git = (...args) => (run(...args).stdout ?? "").trim();

// This job's commits, found by the task markers in their subject lines, so an
// amended commit is still found.
const OWNED = {
  "(crew T-01, T-06)": ["roles/pm.md", "tools/verify-mount.mjs"],
  "(crew T-05)": ["host/git-guard.js", "tools/verify-guard.mjs"],
  "(crew T-07)": ["cordis.patch.yml", "host/crew.js"],
};
const ALLOWED_HOST = new Set(["host/git-guard.js", "host/crew.js"]);

// The two checks that are about the whole set of commits. They are only run
// when every commit above was found: over a partial or empty set they would be
// true without checking anything.
const SET_LEVEL = [
  "package.json is in none of this job's commits",
  "under host/ only the files a task owns changed",
];

// --- can this checkout answer the question at all? ---
// Three different reasons the commits may not be reachable, and only the last
// one means the acceptance evidence is really gone:
//   * this folder is not a git checkout (a tarball, an installed package);
//   * it is a shallow clone (`git clone --depth 1`) — the commits were never
//     fetched;
//   * the history is complete and the commits are not in it — a real defect.
const HISTORY_AVAILABLE = "the git history here can be searched for this job's commits";
let unavailable = "";
if (run("rev-parse", "--is-inside-work-tree").status !== 0) {
  unavailable = "this folder is not a git checkout: `git rev-parse --is-inside-work-tree` failed";
} else if (git("rev-parse", "--is-shallow-repository") === "true") {
  unavailable = "this is a shallow clone: `git rev-parse --is-shallow-repository` says true, "
    + `only ${git("rev-list", "--count", "HEAD") || "0"} commit(s) are present`;
}

if (unavailable) {
  check(HISTORY_AVAILABLE, false,
    `${unavailable}.\n      `
    + "This is NOT \"the acceptance evidence is gone\" — nothing was checked. Run\n      "
    + "`git fetch --unshallow` (or clone without --depth) and run this case again.\n      "
    + "CI uses fetch-depth: 0, so the history is there.");
  for (const what of [...Object.keys(OWNED).map(marker => `the commit for ${marker} touches only the files that task owns`), ...SET_LEVEL]) {
    console.error(`not run  ${what} — it depends on commits this checkout does not have`);
  }
  done();
}

check(HISTORY_AVAILABLE, true);

/**
 * Every commit reachable from HEAD whose SUBJECT line carries `marker`.
 *
 * `-F` makes the marker a plain string, so the brackets and the comma in
 * "(crew T-01, T-06)" are not read as a pattern. There is no `-n`: the search
 * covers the whole history, so it keeps working however many commits land on
 * top. `--grep` matches the whole message, so the subject is checked again here
 * to keep the original meaning — a marker in a commit body is not the commit.
 * HEAD is searched on purpose, not `--all`: the claim is that this job's work is
 * in the branch history, and `--all` would also accept a commit left on some
 * other branch.
 */
const commitsFor = (marker) => git("log", "--format=%H%x09%s", "-F", `--grep=${marker}`)
  .split("\n")
  .filter(line => line.includes("\t") && line.split("\t")[1].includes(marker));

const everyFile = new Set();
const missing = [];

for (const [marker, owned] of Object.entries(OWNED)) {
  const lines = commitsFor(marker);
  if (lines.length === 0) {
    missing.push(marker);
    check(`the commit for ${marker} touches only the files that task owns`, false,
      "the whole history was searched by marker (`git log -F --grep`, no -n limit) "
      + "and no commit carries it: this task's acceptance evidence is gone");
    continue;
  }
  if (lines.length > 1) console.log(`note  ${lines.length} commits carry ${marker}; all of them are checked`);
  for (const line of lines) {
    const [hash] = line.split("\t");
    const files = git("show", "--name-only", "--format=", hash).split("\n").filter(name => name.length > 0);
    for (const file of files) everyFile.add(file);
    check(`the commit for ${marker} ${hash.slice(0, 7)} touches only the files that task owns`,
      files.length === owned.length && owned.every(file => files.includes(file)),
      `owns ${owned.join(", ")}; touched ${files.join(", ") || "nothing"}`);
  }
}

const host = [...everyFile].filter(file => file.startsWith("host/"));

if (missing.length > 0) {
  for (const what of SET_LEVEL) {
    console.error(`not run  ${what} — it depends on the missing commit(s) for ${missing.join(", ")}`);
  }
} else {
  check(SET_LEVEL[0], !everyFile.has("package.json"), [...everyFile].join(", "));
  check(SET_LEVEL[1], host.every(file => ALLOWED_HOST.has(file)), host.join(", "));
  console.log(`note  host/ files across this job's commits: ${host.join(", ") || "none"}`);
  console.log("note  DoD check 11 still says host/git-guard.js is the only allowed file under host/;");
  console.log("note  CRD 0003 (DoD version 11) gives host/crew.js to T-07, so that wording is stale.");
}

done();
