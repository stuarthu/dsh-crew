// Replays the real git-guard logic against a list of commands, so the rules can
// be checked without running dsh. Run it with:  node tools/verify-guard.mjs
//
// It mounts host/git-guard.js with a fake Cordis context that only captures the
// `tools/execute` handler, and points the approval file at a temporary path so
// your own ~/.dsh/crew/push-ok is never created or deleted.

import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import * as guard from "../host/git-guard.js";

const workdir = mkdtempSync(join(tmpdir(), "crew-guard-"));
const approvalFile = join(workdir, "push-ok");

let handler;
guard.apply({ on: (event, fn) => { if (event === "tools/execute") handler = fn; } }, { approvalFile });

const ALLOWED = Symbol("allowed");

// Every case names its own working folder: the checkout this test runs from has
// a publishing workflow of its own, and the guard reads the folder it is told
// about. A test that depended on the current folder would pass or fail by
// accident.
const cleanRepo = join(workdir, "clean-repo");
mkdirSync(cleanRepo, { recursive: true });

/** Run one command through the guard. Returns ALLOWED or the refusal text. */
async function run(command, args = {}) {
  const result = await handler(
    { name: "bash", arguments: { command, workdir: cleanRepo, ...args } },
    () => ALLOWED,
  );
  return result === ALLOWED ? ALLOWED : result.error.message;
}

const cases = [
  // [command, should be blocked?, note]
  ["git status", false, "reading git is fine"],
  ["git diff --stat", false, "reading a diff is fine"],
  ["npm test", false, "ordinary commands pass through"],
  ["git push", true, "bare push could push the checked-out branch"],
  ["git push origin", true, "no branch named"],
  ["git push origin main", true, "protected branch"],
  ["git push origin master", true, "protected branch"],
  ["git push upstream refs/heads/main", true, "protected branch, long ref"],
  ["git push origin crew/x --force", true, "force push"],
  ["git push -f origin crew/x", true, "force push, short flag"],
  ["git push --force-with-lease origin crew/x", true, "force push, lease"],
  ["git push origin --tags", true, "tag push"],
  ["git push origin v1.2.3 --follow-tags", true, "tag push"],
  ["git push origin --delete crew/x", true, "remote delete"],
  ["git push origin :crew/x", true, "remote delete, colon form"],
  ["git push --mirror origin", true, "mirror push"],
  ["npm publish", true, "publishing"],
  ["pnpm publish --access public", true, "publishing"],
  ["gh release create v1.0.0", true, "release"],
  [`touch ${approvalFile}`, true, "an agent may not approve itself"],
  ["echo hi > ~/.dsh/crew/push-ok", true, "an agent may not approve itself, by any path"],
];

let failures = 0;
for (const [command, shouldBlock, note] of cases) {
  const result = await run(command);
  const blocked = result !== ALLOWED;
  if (blocked !== shouldBlock) {
    failures += 1;
    console.error(`FAIL  ${command}\n      expected ${shouldBlock ? "blocked" : "allowed"} (${note}), got ${blocked ? `blocked: ${result}` : "allowed"}`);
  } else {
    console.log(`ok    ${shouldBlock ? "blocked" : "allowed"}  ${command}`);
  }
}

// A work-branch push: refused without approval, allowed once with it, and the
// approval is used up by that one push.
const before = await run("git push origin crew/my-job");
if (before === ALLOWED) { failures += 1; console.error("FAIL  work-branch push was allowed with no approval"); }
else console.log("ok    blocked  git push origin crew/my-job (no approval yet)");

writeFileSync(approvalFile, "");
const withApproval = await run("git push origin crew/my-job");
if (withApproval !== ALLOWED) { failures += 1; console.error(`FAIL  approved push was still blocked: ${withApproval}`); }
else console.log("ok    allowed  git push origin crew/my-job (approval present)");

if (existsSync(approvalFile)) { failures += 1; console.error("FAIL  the approval file was not used up"); }
else console.log("ok    approval file was used up by the push");

const second = await run("git push origin crew/my-job");
if (second === ALLOWED) { failures += 1; console.error("FAIL  a second push was allowed on one approval"); }
else console.log("ok    blocked  second push on the same approval");

/** Build a throwaway repository holding one workflow file. */
function repoWithWorkflow(name, yaml) {
  const repo = join(workdir, name);
  mkdirSync(join(repo, ".github", "workflows"), { recursive: true });
  writeFileSync(join(repo, ".github", "workflows", "release.yml"), yaml);
  return repo;
}

// A repository whose CI publishes when a BRANCH is pushed: refused even with an
// approval, because the push itself would ship a package.
const branchPublisher = repoWithWorkflow(
  "branch-publisher",
  "on:\n  push:\n    branches: ['**']\njobs:\n  release:\n    steps:\n      - run: npm publish\n",
);
writeFileSync(approvalFile, "");
const publishing = await run("git push origin crew/my-job", { workdir: branchPublisher });
if (publishing === ALLOWED) { failures += 1; console.error("FAIL  push allowed into a repo that publishes on a branch push"); }
else console.log("ok    blocked  push into a repo whose CI publishes on a branch push");

// The same repository with a bare `on: push` (every branch): still refused.
const barePublisher = repoWithWorkflow(
  "bare-publisher",
  "on:\n  push:\njobs:\n  release:\n    steps:\n      - run: npm publish\n",
);
const bare = await run("git push origin crew/my-job", { workdir: barePublisher });
if (bare === ALLOWED) { failures += 1; console.error("FAIL  push allowed into a repo with a bare on: push publisher"); }
else console.log("ok    blocked  push into a repo with a bare `on: push` publisher");

// Tag-only publishing (the normal safe release setup): a BRANCH push cannot
// start it, so the approved push goes through.
const tagPublisher = repoWithWorkflow(
  "tag-publisher",
  "on:\n  push:\n    tags: ['v*']\njobs:\n  publish:\n    steps:\n      - run: npm publish\n",
);
const tagOnly = await run("git push origin crew/my-job", { workdir: tagPublisher });
if (tagOnly !== ALLOWED) { failures += 1; console.error(`FAIL  approved branch push blocked in a tag-only publishing repo: ${tagOnly}`); }
else console.log("ok    allowed  approved branch push where CI publishes on tags only");

// Pushing the tag itself in that same repository is still refused.
writeFileSync(approvalFile, "");
const tagPush = await run("git push origin v1.0.0", { workdir: tagPublisher });
if (tagPush === ALLOWED) { failures += 1; console.error("FAIL  tag push allowed"); }
else console.log("ok    blocked  tag push, even in a tag-only publishing repo");

rmSync(workdir, { recursive: true, force: true });

console.log(failures === 0 ? "\nall guard checks passed" : `\n${failures} guard check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
