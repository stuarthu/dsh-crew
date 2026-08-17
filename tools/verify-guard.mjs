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

/** Run one command through the guard. Returns ALLOWED or the refusal text. */
async function run(command, args = {}) {
  const result = await handler(
    { name: "bash", arguments: { command, ...args } },
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

// A repository whose CI publishes on push: refused even with an approval.
const repo = join(workdir, "repo");
mkdirSync(join(repo, ".github", "workflows"), { recursive: true });
writeFileSync(join(repo, ".github", "workflows", "release.yml"), "on:\n  push:\n    branches: ['**']\njobs:\n  release:\n    steps:\n      - run: npm publish\n");
writeFileSync(approvalFile, "");
const publishing = await run("git push origin crew/my-job", { workdir: repo });
if (publishing === ALLOWED) { failures += 1; console.error("FAIL  push allowed into a repo that publishes on push"); }
else console.log("ok    blocked  push into a repo whose CI publishes on push");

rmSync(workdir, { recursive: true, force: true });

console.log(failures === 0 ? "\nall guard checks passed" : `\n${failures} guard check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
