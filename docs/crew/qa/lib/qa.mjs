// Shared helpers for the crew QA cases. This file is NOT a case: the runners
// only execute files named `case-*.mjs`.
//
// Everything here is read-only against the repository. Anything that has to
// change a file copies the repository into a throwaway folder first, and every
// helper that needs a home folder points DSH_HOME at a temporary folder, so no
// case ever reads or writes the real ~/.dsh.

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

/** Repository root: <repo>/docs/crew/qa/lib -> up four. */
export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..");

/** Read one repository file as text. */
export const repoFile = (relative) => readFileSync(join(REPO, relative), "utf8");

/** The PM prompt file, the deliverable most checks are about. */
export const pm = () => repoFile("roles/pm.md");

/**
 * One numbered step of the PM prompt, from `N. **` to the next `N. **` at the
 * start of a line. Used so a check about step 17 cannot pass on text that only
 * appears in step 16.
 */
export function step(text, number) {
  const start = text.search(new RegExp(`^${number}\\. \\*\\*`, "m"));
  if (start === -1) throw new Error(`roles/pm.md has no step ${number}`);
  const rest = text.slice(start + 1);
  const end = rest.search(/\n\d+\. \*\*/);
  return end === -1 ? text.slice(start) : text.slice(start, start + 1 + end);
}

/** One `## heading` section of a markdown file, up to the next `## `. */
export function section(text, heading) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) throw new Error(`no "## ${heading}" section found`);
  const rest = text.slice(start + 3);
  const end = rest.indexOf("\n## ");
  return end === -1 ? text.slice(start) : text.slice(start, start + 3 + end);
}

/** Collapse every run of whitespace, so a prose check does not depend on where the line wraps. */
export const flat = (text) => text.replace(/\s+/g, " ");

const failures = [];
let passed = 0;

/** Assert one thing. `detail` is printed only when it fails. */
export function check(what, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`ok    ${what}`);
  } else {
    failures.push(what);
    console.error(`FAIL  ${what}${detail ? `\n      ${detail}` : ""}`);
  }
}

/** Print the totals and exit non-zero when anything failed. */
export function done() {
  if (failures.length === 0) {
    console.log(`\nall ${passed} check(s) passed`);
    process.exit(0);
  }
  console.error(`\n${failures.length} of ${passed + failures.length} check(s) failed: ${failures.join("; ")}`);
  process.exit(1);
}

/** A throwaway folder. Every case that writes anything uses one of these. */
export function tempDir(prefix = "crew-qa-") {
  return mkdtempSync(join(tmpdir(), prefix));
}

/**
 * Copy the parts of the repository the check scripts need into a throwaway
 * folder, so a case can break a file on purpose without touching the
 * repository. `node_modules` is symlinked, never copied: it is only read.
 *
 * @returns the folder holding the copy
 */
export function tempRepo() {
  const dir = tempDir("crew-qa-repo-");
  for (const entry of ["package.json", "cordis.patch.yml", "host", "roles", "preset", "tools"]) {
    cpSync(join(REPO, entry), join(dir, entry), { recursive: true });
  }
  const modules = join(REPO, "node_modules");
  if (existsSync(modules)) {
    try {
      symlinkSync(modules, join(dir, "node_modules"), "dir");
    } catch { /* the check scripts skip the dsh half without it */ }
  }
  return dir;
}

/**
 * Run one of the project's check scripts inside a copy of the repository, with
 * DSH_HOME pointed at a throwaway folder.
 *
 * @param dir - the copy made by tempRepo()
 * @param script - path of the script inside that copy, e.g. "tools/verify-mount.mjs"
 */
export function runCheck(dir, script) {
  const home = join(dir, "fake-home");
  mkdirSync(home, { recursive: true });
  const result = spawnSync(process.execPath, [script], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, DSH_HOME: home, HOME: home },
  });
  return { status: result.status, out: `${result.stdout ?? ""}${result.stderr ?? ""}` };
}

/** Remove a throwaway folder, whatever happened. */
export const cleanUp = (dir) => rmSync(dir, { recursive: true, force: true });

/**
 * Mount host/git-guard.js on a fake Cordis context and return a runner.
 *
 * The approval file lives in a throwaway folder and the commands run against a
 * folder with no CI files, so nothing here depends on this checkout and nothing
 * touches the real ~/.dsh/crew/push-ok.
 */
export async function mountGuard(config = {}) {
  const guard = await import(join(REPO, "host", "git-guard.js"));
  const dir = tempDir("crew-qa-guard-");
  const approvalFile = config.approvalFile ?? join(dir, "push-ok");
  const cleanRepo = join(dir, "no-ci-repo");
  mkdirSync(cleanRepo, { recursive: true });
  let handler;
  guard.apply({ on: (event, fn) => { if (event === "tools/execute") handler = fn; } }, { ...config, approvalFile });
  const ALLOWED = Symbol("allowed");
  /** @returns the string reason when blocked, or undefined when allowed. */
  const send = async (command, { root = false, workdir = cleanRepo } = {}) => {
    const exec = { name: "bash", arguments: { command, workdir } };
    if (!root) exec.parent = {};
    const result = await handler(exec, () => ALLOWED);
    return result === ALLOWED ? undefined : result.error.message;
  };
  return { send, approvalFile, dir, guard, cleanUp: () => cleanUp(dir) };
}

/** The phrase the approval-file rule — and only that rule — puts in its reason. */
export const APPROVAL_RULE = "it touches the push approval file";

/**
 * Mount host/crew.js on a fake Cordis context and collect what it registered
 * and what it wrote to the boot log — through `ctx.logger` and through the
 * `console.log` fallback both.
 *
 * The preset installer and the unfinished-job notice are switched off and the
 * jobs folder points at a throwaway path, so nothing under the real ~/.dsh is
 * read or written.
 */
export async function mountCrew(config = {}) {
  const crew = await import(join(REPO, "host", "crew.js"));
  const dir = tempDir("crew-qa-crew-");
  const logs = [];
  const sections = [];
  const ctx = {
    effect: (fn) => fn(),
    systemPrompt: {
      section: (section) => sections.push(section),
      context: () => {},
    },
    // `info` returns undefined, the way a real logger does — the plugin ends
    // that line with `?? console.log(note)`, so this is what a deployment sees.
    logger: () => ({ info: (line) => { logs.push(String(line)); } }),
  };
  if (config.logger === false) delete ctx.logger;
  const realLog = console.log;
  console.log = (...args) => logs.push(args.map(String).join(" "));
  let thrown;
  try {
    crew.apply(ctx, { installPreset: false, resumeNotice: false, jobsDir: join(dir, "jobs"), ...config.plugin });
  } catch (error) {
    thrown = error;
  } finally {
    console.log = realLog;
  }
  return { sections, logs, thrown, prompt: sections[0]?.text ?? "", cleanUp: () => cleanUp(dir) };
}
