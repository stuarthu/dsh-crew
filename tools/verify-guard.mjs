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

/** Run one command through the guard as a CREW ROLE (a child, with a parent). */
async function run(command, args = {}) {
  const result = await handler(
    { name: "bash", arguments: { command, workdir: cleanRepo, ...args }, parent: {} },
    () => ALLOWED,
  );
  return result === ALLOWED ? ALLOWED : result.error.message;
}

/** Run one command through the guard as the ROOT agent (the PM, no parent). */
async function runRoot(command, args = {}) {
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
  // CRD 0001: the approval file's name is matched as a whole file name. These
  // commands only contain `push-ok` inside a longer name, so they are not about
  // the approval file at all.
  ["git switch -c crew/push-ok-flow", false, "a branch name that only contains push-ok"],
  ["cat docs/push-okay.md", false, "push-okay.md is a different file"],
  ["grep -rn TODO src/push-ok-handler.js", false, "push-ok-handler.js is a different file"],
  // The other side of the same rule: a name that ENDS with push-ok. These are the
  // only cases that prove the pattern's left-hand boundary does anything.
  ["cat docs/pre-push-ok", false, "a longer name that only ends with push-ok"],
  ["touch my-push-ok", false, "a different file whose name only ends with push-ok"],
  ["cat docs/pre-push-ok && ls docs", false, "ends with push-ok, and something follows it"],
  // The full path gets the same whole-name rule as the bare name, so a
  // neighbouring file or folder is not mistaken for the approval file.
  [`ls ${approvalFile}.bak`, false, "a backup file next to the approval file"],
  // CRD 0001: these really do name the approval file, so they stay blocked.
  ["touch push-ok", true, "the approval file by its bare name"],
  ["rm push-ok", true, "deleting the approval file"],
  ["echo x >push-ok", true, "the bare name with no space before it"],
  ["rm -f ./push-ok", true, "a relative path to the approval file"],
  // The realistic self-approval spellings. These pin the rule itself: adding a
  // quote or a `$` to the boundary set would let one of them through.
  ["touch \"push-ok\"", true, "the bare name in double quotes"],
  ["touch 'push-ok'", true, "the bare name in single quotes"],
  ["touch $HOME/.dsh/crew/push-ok", true, "the $HOME form; expandHome never expands it, so this rests on the name match"],
  ["python3 -c \"open('push-ok','w')\"", true, "written by a program, name still spelled out"],
  ["echo push-ok | xargs touch", true, "the name passed through a pipe"],
];

let failures = 0;

// Every case runs inside this block so the `finally` below always removes the
// temporary folder, even when a case throws.
try {
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

  // CRD 0001: a work branch whose name contains `push-ok` is an ordinary branch.
  // With an approval present (written just above, and not used up by the refused
  // tag push) a child may push it.
  const okFlowChild = await run("git push origin crew/push-ok-flow");
  if (okFlowChild !== ALLOWED) { failures += 1; console.error(`FAIL  approved push of crew/push-ok-flow was blocked: ${okFlowChild}`); }
  else console.log("ok    allowed  git push origin crew/push-ok-flow (approval present)");

  // The root agent (the PM, your own session) passes straight through: any git
  // push, tag, force, delete, mirror — and publishing — are all allowed.
  const rootCases = [
    ["git push", "bare push"],
    ["git push origin main", "main push"],
    ["git push origin v1.0.0", "tag push"],
    ["git push -f origin main", "force push"],
    ["git push origin --delete crew/x", "remote delete"],
    ["git push --mirror origin", "mirror push"],
    ["npm publish", "publishing"],
    ["gh release create v1.0.0", "release"],
    // CRD 0001: the bug this fixes — the PM's own merge step used to be blocked
    // on a job branch whose name contains `push-ok`.
    ["git push origin crew/push-ok-flow", "a branch name that only contains push-ok"],
  ];
  for (const [command, note] of rootCases) {
    const result = await runRoot(command);
    if (result !== ALLOWED) { failures += 1; console.error(`FAIL  ${command}\n      expected allowed for the root agent (${note}), got blocked: ${result}`); }
    else console.log(`ok    allowed  ${command} (root agent: ${note})`);
  }

  // Even the root agent may not write the approval file: only the user's own hand
  // approves a child's push.
  const rootTouch = await runRoot(`touch ${approvalFile}`);
  if (rootTouch === ALLOWED) { failures += 1; console.error("FAIL  root agent was allowed to write the approval file"); }
  else console.log("ok    blocked  root agent writing the approval file");

  // CRD 0001: every way of naming the approval file is refused for the root agent
  // too, not only the full path.
  const rootApprovalCases = ["touch push-ok", "rm push-ok", "echo x >push-ok", "rm -f ./push-ok"];
  for (const command of rootApprovalCases) {
    const result = await runRoot(command);
    if (result === ALLOWED) { failures += 1; console.error(`FAIL  ${command}\n      expected blocked for the root agent (it names the approval file), got allowed`); }
    else console.log(`ok    blocked  ${command} (root agent naming the approval file)`);
  }

  // `trustRootAgent: false` restores the old behaviour: the root agent is guarded
  // exactly like a child.
  let strictHandler;
  guard.apply({ on: (event, fn) => { if (event === "tools/execute") strictHandler = fn; } }, { approvalFile, trustRootAgent: false });
  const strictRun = async (command) => {
    const result = await strictHandler({ name: "bash", arguments: { command, workdir: cleanRepo } }, () => ALLOWED);
    return result === ALLOWED ? ALLOWED : result.error.message;
  };
  const strictMain = await strictRun("git push origin main");
  if (strictMain === ALLOWED) { failures += 1; console.error("FAIL  trustRootAgent:false allowed a root main push"); }
  else console.log("ok    blocked  root main push with trustRootAgent:false");

  // CRD 0001: the approval file is configurable, so its name may hold characters
  // that mean something in a pattern. A name like `push+ok.flag` must be matched
  // as plain text, not as a pattern.
  const oddFile = join(workdir, "push+ok.flag");
  let oddHandler;
  guard.apply({ on: (event, fn) => { if (event === "tools/execute") oddHandler = fn; } }, { approvalFile: oddFile });
  const oddRun = async (command) => {
    const result = await oddHandler({ name: "bash", arguments: { command, workdir: cleanRepo } }, () => ALLOWED);
    return result === ALLOWED ? ALLOWED : result.error.message;
  };
  const oddNamed = await oddRun("touch push+ok.flag");
  if (oddNamed === ALLOWED) { failures += 1; console.error("FAIL  an approval file whose name holds pattern characters was not protected"); }
  else console.log("ok    blocked  touch push+ok.flag (name with pattern characters)");

  const oddOther = await oddRun("touch pushhhokxflag");
  if (oddOther !== ALLOWED) { failures += 1; console.error(`FAIL  a different file name was read as a pattern match: ${oddOther}`); }
  else console.log("ok    allowed  touch pushhhokxflag (a different file, not a pattern match)");

  // A folder-shaped `approvalFile` must fail loudly AT MOUNT. With `~/.dsh/crew/`
  // the protected name would silently become `crew`, so `git push origin
  // crew/my-job` would be refused while the real approval file was left wide open
  // for any agent to create.
  const folderShapes = [`${workdir}/`, `${workdir}\\`];
  for (const shape of folderShapes) {
    let thrown;
    try {
      guard.apply({ on: () => {} }, { approvalFile: shape });
    } catch (error) {
      thrown = error;
    }
    if (thrown === undefined) {
      failures += 1;
      console.error(`FAIL  approvalFile "${shape}" mounted without an error; the guard would protect the wrong name`);
    } else if (!/approvalFile/.test(thrown.message) || !/file path/.test(thrown.message)) {
      failures += 1;
      console.error(`FAIL  the error for approvalFile "${shape}" does not say how to fix it: ${thrown.message}`);
    } else {
      console.log(`ok    threw    approvalFile "${shape}" (a folder, not a file)`);
    }
  }

  // The same check must not reject an ordinary file path.
  let plainMountFailed;
  try {
    guard.apply({ on: () => {} }, { approvalFile });
  } catch (error) {
    plainMountFailed = error;
  }
  if (plainMountFailed !== undefined) { failures += 1; console.error(`FAIL  a normal approval file path was rejected at mount: ${plainMountFailed.message}`); }
  else console.log("ok    mounted  a normal approval file path");

  // Mounted with NO config at all, so the approval file is the real
  // `~/.dsh/crew/push-ok`. Only non-push commands are sent, and `existsSync` /
  // `rmSync` both sit behind the `git push` test: the first command returns at
  // "not a git push", the second returns at the name check. So nothing under
  // the real `~/.dsh` is read, created or deleted by this check.
  let defaultHandler;
  guard.apply({ on: (event, fn) => { if (event === "tools/execute") defaultHandler = fn; } }, {});
  const defaultResult = await defaultHandler(
    { name: "bash", arguments: { command: "cat docs/pre-push-ok", workdir: cleanRepo }, parent: {} },
    () => ALLOWED,
  );
  if (defaultResult !== ALLOWED) { failures += 1; console.error(`FAIL  the default approval file blocked a longer name: ${defaultResult.error.message}`); }
  else console.log("ok    allowed  cat docs/pre-push-ok (default approval file, nothing on disk touched)");

  const defaultNamed = await defaultHandler(
    { name: "bash", arguments: { command: "touch push-ok", workdir: cleanRepo }, parent: {} },
    () => ALLOWED,
  );
  if (defaultNamed === ALLOWED) { failures += 1; console.error("FAIL  the default approval file was not protected by its bare name"); }
  else console.log("ok    blocked  touch push-ok (default approval file, nothing on disk touched)");

} finally {
  rmSync(workdir, { recursive: true, force: true });
}

console.log(failures === 0 ? "\nall guard checks passed" : `\n${failures} guard check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
