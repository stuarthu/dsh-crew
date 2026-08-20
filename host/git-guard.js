// dsh-crew git guard (host side).
//
// Blocks the shell commands that can push work off this machine or publish a
// package. The root agent — your own session, the PM — is trusted and passes
// straight through; every crew role (a child agent with a parent) stays fully
// guarded. It exists because a role rule written in prose is advice, while a
// `tools/execute` wrapper is the place a call is actually stopped.
//
// What it always refuses, from a crew role:
//   - `git push` of main / master / trunk / develop / HEAD, or with no branch
//     named (a bare `git push` can push whatever branch is checked out)
//   - any tag push, delete push, `--mirror`, `--all`, or force push
//   - `npm|pnpm|yarn|bun publish`, `npm dist-tag`, `gh release create`
//   - a push into a repo whose GitHub Actions CI runs on a branch push and
//     looks like it publishes (`.github/workflows` only — see the limits below)
//   - any shell command that names the approval file, the trusted root
//     included (a shell command only — see the limits below)
//
// What it allows once, per approval: a child's push of any other branch, but
// only while the one-shot approval file exists. You create that file yourself;
// the guard deletes it as soon as one push uses it, so one approval means one
// push.
//
// Honest limits. Two on the approval-file rule:
//   - A command that only MENTIONS the file name is refused, the root agent
//     included. `git commit -m "fix(guard): the push-ok substring false alarm"`
//     is blocked, and so are `grep -n push-ok config.yml` and
//     `git log --grep=push-ok`.
//   - A name the shell assembles from pieces still gets through:
//     `echo push-ok-flow | sed s/-flow// | xargs touch` is not stopped. The old
//     substring check did stop that one; this one does not. Nothing really
//     changed for a determined agent, though — the old check was just as
//     useless against `touch pus''h-ok`.
//
// And three on the guard as a whole. Each one is a real hole, not a caveat:
//   - It reads command text. A determined agent could hide a push inside a
//     script file or change the remote first. It is a strong seat belt, not a
//     locked door. Your dsh approval prompts remain the real gate.
//   - It wraps `bash` and `pwsh` and nothing else (SHELL_TOOLS), so the
//     approval-file rule holds for shell commands only. A role that has `write`
//     or `edit` — the engineer does — can create the approval file as a plain
//     file write, and this middleware never sees that call. The gate there is
//     dsh's own approval prompt for writing a file, not this guard. That is also
//     why a refused CHILD is never told how to create the file: the steps go to
//     your own session only (howToApprove and ASK_THE_USER below).
//   - The publishing scan reads `.github/workflows` and nothing else, and
//     branchPushTriggers() understands GitHub's `on: push:` shape. GitLab,
//     CircleCI, Jenkins and Azure Pipelines are outside it, on purpose:
//     stretching GitHub trigger logic half-way onto another CI system would
//     produce false alarms, and a false alarm is worse than no alarm, because it
//     teaches you to say yes without reading. So this guard is a GitHub-only
//     backstop for child agents. The wider check is the PM's own judgement, in
//     step 17 of roles/pm.md, which reads `.gitlab-ci.yml`,
//     `.circleci/config.yml`, `Jenkinsfile` and `azure-pipelines.yml` too.

import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";

import { expandHome } from "./roles.js";

export const name = "dsh-crew-git-guard";
export const inject = ["tools"];

/** Shell tools whose command text this guard reads. */
const SHELL_TOOLS = new Set(["bash", "pwsh"]);

/** One-shot approval file. You create it; the guard consumes it. */
export const PUSH_OK_FILE = join(homedir(), ".dsh", "crew", "push-ok");

/** Branch names a crew agent may never push. */
const PROTECTED_BRANCHES = ["main", "master", "trunk", "develop", "HEAD"];

/** The exact steps the user (not an agent) takes to approve one push. */
function howToApprove(approvalFile) {
  return `To allow ONE push of a work branch, the USER runs this in their own terminal:\n`
    + `  mkdir -p ${join(approvalFile, "..")} && touch ${approvalFile}\n`
    + `Then ask again. The approval is used up by that single push.`;
}

/**
 * What a refused CHILD is told instead of those steps. It names no command and
 * no file on purpose: a role that can write files could follow the recipe
 * without this guard ever seeing it, so the recipe goes to the user's own
 * session only.
 */
const ASK_THE_USER = "Ask the user for approval. Only the user can give it, and the steps are deliberately not repeated here.";

/** Deny the call with a message the model can act on. */
function block(reason) {
  const message = `dsh-crew git guard blocked this command: ${reason}`;
  return {
    content: [{ type: "text", text: `Error: ${message}` }],
    isError: true,
    error: { message, info: { name: "CrewGitGuardError", code: "CREW_GIT_BLOCKED" } },
  };
}

/** Whitespace-separated tokens, so `-f` is matched as a flag and not inside a word. */
function tokensOf(command) {
  return command.split(/\s+/).filter(token => token.length > 0);
}

/** Quote a configured file name so it is read as text, not as a pattern. */
function escapeForRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build the whole-file-name pattern for one approval file, once per mount.
 * A character that can be part of a longer file name on either side means the
 * command is talking about a different file: `/push-ok` and `>push-ok` name
 * the approval file, `push-ok-flow` and `push-okay` do not. `approvalFile` is
 * configurable, so both its name and its full path are escaped first.
 */
function approvalNamePattern(approvalFile) {
  const boundary = "[^A-Za-z0-9._+\\-]";
  const name = escapeForRegExp(basename(approvalFile));
  const full = escapeForRegExp(approvalFile);
  return new RegExp(`(^|${boundary})(${name}|${full})($|${boundary})`);
}

/**
 * Find the reason to refuse a `git push`, or undefined when only the one-shot
 * approval is missing (the caller handles that case).
 */
function pushRefusal(command, tokens) {
  const pushAt = tokens.findIndex(token => token === "push");
  const args = tokens.slice(pushAt + 1);
  const flags = args.filter(arg => arg.startsWith("-"));
  const refs = args.filter(arg => !arg.startsWith("-"));

  if (flags.some(flag => flag === "-f" || flag.startsWith("--force"))) {
    return "force pushing rewrites history that other people may already have.";
  }
  if (flags.includes("--mirror") || flags.includes("--all")) {
    return "pushing every ref at once is never part of one task.";
  }
  if (flags.includes("--delete") || refs.some(ref => ref.startsWith(":"))) {
    return "deleting a remote branch or tag is not something an agent should do.";
  }
  if (flags.includes("--tags") || flags.includes("--follow-tags") || /\brefs\/tags\/|\btag\b/.test(command)) {
    return "pushing a tag can trigger a release in many repositories.";
  }

  // `git push` / `git push origin`: no branch named, so the checked-out branch
  // is pushed — which may be main.
  if (refs.length < 2) {
    return "no branch was named, so this could push whatever branch is checked out. Name the work branch, for example: git push origin team/my-job.";
  }

  const target = refs[refs.length - 1].split(":").pop();
  if (PROTECTED_BRANCHES.some(branch => target === branch || target?.endsWith(`/${branch}`))) {
    return `"${target}" is a protected branch. Only the user pushes it.`;
  }
  // A version-shaped ref (`v1.2.3`, `1.2.3`) is nearly always a release tag, and
  // pushing one is how most projects start a release.
  if (/^v?\d+\.\d+(\.\d+)?([-.+].*)?$/.test(target ?? "")) {
    return `"${target}" looks like a release tag. Cutting a release is the user's decision.`;
  }
  return undefined;
}

/**
 * Does a BRANCH push start this workflow? A tag-only trigger
 * (`on: push: tags: [...]` with no `branches:`) cannot be started by pushing a
 * branch, and tag-only publishing is the normal safe release setup — treating it
 * as dangerous would block every ordinary push in those repositories.
 *
 * Text scanning, not YAML parsing: when the shape is unclear this answers "yes"
 * so the guard errs towards refusing.
 *
 * @param text - the workflow file contents
 * @returns true when a branch push can start it
 */
function branchPushTriggers(text) {
  const lines = text.split(/\r?\n/);
  const onAt = lines.findIndex(line => /^on\s*:/.test(line));
  if (onAt === -1) return false;

  // Inline forms: `on: push`, `on: [push, pull_request]`.
  const inline = lines[onAt].slice(lines[onAt].indexOf(":") + 1).trim();
  if (inline.length > 0) return /\bpush\b/.test(inline);

  // Block form: read the lines indented under `on:` and find the `push:` key.
  const pushAt = lines.findIndex((line, index) => index > onAt && /^\s+push\s*:/.test(line));
  if (pushAt === -1) return false;
  const pushIndent = lines[pushAt].search(/\S/);

  const body = [];
  for (let index = pushAt + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.trim().length === 0) continue;
    if (line.search(/\S/) <= pushIndent) break; // back out to a sibling key
    body.push(line);
  }
  const block = body.join("\n");

  // `push:` with nothing under it means every branch.
  if (block.trim().length === 0) return true;
  if (/^\s*branches(-ignore)?\s*:/m.test(block)) return true;
  // Only tags (and maybe paths) listed: a branch push cannot start it.
  if (/^\s*tags(-ignore)?\s*:/m.test(block)) return false;
  return true;
}

/**
 * Best-effort check for CI that publishes when a BRANCH is pushed. Coarse on
 * purpose: it would rather refuse a safe push and let the user do it by hand
 * than let an agent trigger a release.
 *
 * GitHub Actions only. It reads `.github/workflows` and nothing else, because
 * branchPushTriggers() below reads GitHub's `on: push:` shape; a GitLab,
 * CircleCI, Jenkins or Azure Pipelines file would be judged by rules that do
 * not fit it, and a false alarm teaches the user to say yes without reading.
 * This is the GitHub-only backstop for child agents. The wider scan is the PM's
 * own, in step 17 of roles/pm.md.
 *
 * @param cwd - folder the command runs in
 * @returns the workflow file name that looks like a publisher, or undefined
 */
function publishingWorkflow(cwd) {
  const dir = join(cwd, ".github", "workflows");
  if (!existsSync(dir)) return undefined;
  let entries;
  try {
    entries = readdirSync(dir).filter(entry => /\.ya?ml$/i.test(entry));
  } catch {
    return undefined; // unreadable folder: nothing to prove, stay quiet
  }
  for (const entry of entries) {
    let text;
    try {
      text = readFileSync(join(dir, entry), "utf8");
    } catch {
      continue;
    }
    const publishes = /\b(npm|pnpm|yarn|bun)\s+publish\b|semantic-release|release-please|gh\s+release\s+create|JS-DevTools\/npm-publish/i.test(text);
    if (publishes && branchPushTriggers(text)) return entry;
  }
  return undefined;
}

export function apply(ctx, config) {
  if (config?.enabled === false) return;

  // Configurable so the checks can be exercised without touching the real
  // approval file in your home folder (see tools/verify-guard.mjs).
  const approvalFile = config?.approvalFile ? expandHome(config.approvalFile) : PUSH_OK_FILE;

  // A folder-shaped setting must fail loudly HERE, at mount. `~/.dsh/crew/`
  // would leave `crew` as the protected name: every `crew/...` branch push
  // refused as "you touched the approval file", and the real approval file not
  // protected at all, so any agent could approve itself.
  if (approvalFile.endsWith("/") || approvalFile.endsWith("\\") || basename(approvalFile).length === 0) {
    throw new Error(
      `dsh-crew: approvalFile "${approvalFile}" must be a file path, not a folder — the guard would protect the wrong name. `
      + `Remove the trailing slash and name the file itself, for example "~/.dsh/crew/push-ok".`,
    );
  }

  // Built once per mount, not once per command: a broken pattern must break
  // startup, not every later `bash` call with an unrelated message.
  const approvalName = approvalNamePattern(approvalFile);

  // The root agent (your own session, the PM) has no parent execution token;
  // every crew role does. When true (the default), its git and publishing
  // commands pass straight through. Set false to guard the PM exactly like
  // every child.
  const trustRootAgent = config?.trustRootAgent !== false;

  ctx.on("tools/execute", async (exec, next) => {
    if (!SHELL_TOOLS.has(exec.name)) return next();
    const command = exec.arguments?.command;
    if (typeof command !== "string" || command.length === 0) return next();

    const tokens = tokensOf(command);

    // The root agent is your own session; every crew role carries a parent.
    const isRootAgent = exec.parent === undefined;

    // Only your own session is told how to create the approval file. A child is
    // told to ask you, with no command it could copy.
    const approvalHelp = isRootAgent ? howToApprove(approvalFile) : ASK_THE_USER;

    // No SHELL COMMAND may name the approval file, the trusted PM included, and
    // this rule sits above the root bypass for that reason. It is not a wall:
    // this middleware only reads `bash` and `pwsh`, so a role that has `write`
    // or `edit` can create that file without the guard seeing it. dsh's own
    // approval prompt for writing a file is the gate there.
    if (approvalName.test(command)) {
      return block(`it touches the push approval file. Only the user creates it.\n${approvalHelp}`);
    }

    // The trusted root agent (your own session) passes straight through.
    if (trustRootAgent && isRootAgent) return next();

    if (/\b(npm|pnpm|yarn|bun)\s+publish\b|\bnpm\s+dist-tag\b|\bgh\s+release\s+create\b/.test(command)) {
      return block("publishing a package or creating a release is the user's decision, never an agent's.");
    }

    const isGitPush = tokens.includes("git") && tokens.includes("push");
    if (!isGitPush) return next();

    const refusal = pushRefusal(command, tokens);
    if (refusal !== undefined) return block(refusal);

    const cwd = typeof exec.arguments?.workdir === "string" ? exec.arguments.workdir : process.cwd();
    const workflow = publishingWorkflow(cwd);
    if (workflow !== undefined) {
      return block(
        `.github/workflows/${workflow} runs on push and looks like it publishes or releases. `
        + `A branch push here could ship a package, so the user must do this push by hand.`,
      );
    }

    if (!existsSync(approvalFile)) {
      return block(`pushing needs the user's approval first.\n${approvalHelp}`);
    }

    // Use the approval up BEFORE the push runs: a crash mid-push must not leave
    // a second push approved.
    try {
      rmSync(approvalFile);
    } catch {
      return block("the push approval file could not be used up, so the push was not run. Try approving again.");
    }
    return next();
  });
}
