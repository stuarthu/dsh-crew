// Shared helpers for the crew QA cases. This file is NOT a case: the runners
// only execute files named `case-*.mjs`.
//
// Everything here is read-only against the repository. Anything that has to
// change a file copies the repository into a throwaway folder first, and every
// helper that needs a home folder points DSH_HOME at a temporary folder, so no
// case ever reads or writes the real ~/.dsh.

import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

/** Repository root: <repo>/docs/qa/lib -> up three. */
export const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

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
  try {
    // Everything a check running INSIDE the copy reads. `tools/verify-mount.mjs`,
    // `tools/verify-guard.mjs` and `tools/verify-tasks.mjs` are the scripts ever
    // run in a copy, and between them they read: package.json (plus the file its
    // `dsh.bundle.patch` names, cordis.patch.yml), every file under
    // `.github/workflows/`, preset/crew/*, host/*.js, roles/*.md,
    // tools/lib/boot-log.mjs and `docs/design/tasks.md`.
    //
    // A missing entry is not a harmless saving: the check goes red inside the
    // copy over something that is NOT true of the repository, and the case then
    // fails on its own premise instead of on the thing it tests. `.github` was
    // the entry this list forgot for exactly that reason — it is the only dotted
    // name needed here, and `git status` never lists it as untracked, so nothing
    // pointed at it until a new pin started reading it.
    //
    // `docs/design/tasks.md` is the second such entry: T-40's Verdicts gate
    // (tools/verify-tasks.mjs) reads it, and without the file that gate fails
    // with "tasks.md is missing" in every copy — which is a red about the copy,
    // not about the repository. Only that one file is copied, not all of `docs/`:
    // nothing a check reads lives elsewhere under it, and `docs/qa/` holds these
    // cases themselves, which no check in a copy ever runs.
    for (const entry of ["package.json", "cordis.patch.yml", "host", "roles", "preset", "tools", ".github", join("docs", "design", "tasks.md")]) {
      cpSync(join(REPO, entry), join(dir, entry), { recursive: true });
    }
    const modules = join(REPO, "node_modules");
    if (existsSync(modules)) {
      try {
        symlinkSync(modules, join(dir, "node_modules"), "dir");
      } catch { /* the check scripts skip the dsh half without it */ }
    }
  } catch (error) {
    // The caller's `finally { cleanUp(dir) }` only exists once this function has
    // returned, so a copy that throws half-way would leave its folder in /tmp
    // for ever. Remove it here and hand the error on unchanged.
    cleanUp(dir);
    throw error;
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

// ------------------------------------------------------- mutating a copy
//
// A pin is only a pin if breaking the thing it guards turns the run red. These
// four helpers do that breaking inside a tempRepo() copy. Every one of them
// throws when its anchor is not there, and that is the point: an edit that
// silently matched nothing would leave the copy correct, the check green, and
// the case reporting a pass for a pin it never touched. The five mutation sets
// in /tmp all guarded their own anchors the same way (`if (s === before) throw`)
// — this is that habit, kept.

/** Read one file out of a copy. */
export const copyFile = (dir, relative) => readFileSync(join(dir, relative), "utf8");

/**
 * Replace `from` with `to` in one file of a copy, exactly once.
 * @throws when `from` is not in the file, or is in it more than once
 */
export function edit(dir, relative, from, to) {
  const file = join(dir, relative);
  const text = readFileSync(file, "utf8");
  const first = text.indexOf(from);
  if (first === -1) throw new Error(`mutation anchor not found in ${relative}: ${JSON.stringify(from)}`);
  if (text.indexOf(from, first + from.length) !== -1) {
    throw new Error(`mutation anchor appears more than once in ${relative}, so the edit is ambiguous: ${JSON.stringify(from)}`);
  }
  writeFileSync(file, text.slice(0, first) + to + text.slice(first + from.length));
}

/**
 * Replace EVERY occurrence of `from` in one file of a copy. For a pin that
 * counts copies of a string, or a string a prompt repeats on purpose.
 * @returns how many were replaced
 * @throws when there were none
 */
export function editAll(dir, relative, from, to) {
  const file = join(dir, relative);
  const text = readFileSync(file, "utf8");
  const copies = text.split(from).length - 1;
  if (copies === 0) throw new Error(`mutation anchor not found in ${relative}: ${JSON.stringify(from)}`);
  writeFileSync(file, text.split(from).join(to));
  return copies;
}

/**
 * Leave exactly `keep` copies of `from` in one file of a copy and rewrite the
 * rest as `to`. Written for the count pins, which have a floor rather than an
 * exact number: the file may legitimately grow another copy, and a case that
 * hard-coded "remove two" would stop testing the floor the day it did.
 * @returns how many copies the file held before
 * @throws when it held fewer than `keep` already
 */
export function keepCopies(dir, relative, from, keep, to) {
  const file = join(dir, relative);
  const text = readFileSync(file, "utf8");
  const parts = text.split(from);
  if (parts.length - 1 < keep) {
    throw new Error(`${relative} holds only ${parts.length - 1} copy/copies of ${JSON.stringify(from)}, so ${keep} cannot be kept`);
  }
  let seen = 0;
  writeFileSync(file, parts.reduce((joined, part) => {
    seen += 1;
    return `${joined}${seen <= keep ? from : to}${part}`;
  }));
  return parts.length - 1;
}

/** Write a whole file into a copy, making its folder if needed. */
export function put(dir, relative, text) {
  const file = join(dir, relative);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, text);
}

/** Delete a file or folder from a copy. @throws when it was not there */
export function drop(dir, relative) {
  const file = join(dir, relative);
  if (!existsSync(file)) throw new Error(`nothing to delete at ${relative} — the copy's shape moved`);
  rmSync(file, { recursive: true, force: true });
}

/** Rename a file inside a copy. @throws when the source is not there */
export function rename(dir, from, to) {
  if (!existsSync(join(dir, from))) throw new Error(`nothing to rename at ${from} — the copy's shape moved`);
  renameSync(join(dir, from), join(dir, to));
}

/** Rewrite one JSON file of a copy through a function. */
export function editJson(dir, relative, change) {
  const file = join(dir, relative);
  const value = JSON.parse(readFileSync(file, "utf8"));
  change(value);
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

// ------------------------------------------- the task table inside a copy

/** The one task table, as a path inside a copy. */
export const TASKS_MD = join("docs", "design", "tasks.md");

/**
 * Find the first `## T-<number>` section of a copy's task table that carries a
 * Verdicts line, and replace that line through `change`. Return `null` from
 * `change` to delete the line instead.
 *
 * The locator is deliberately dumb — it walks headings, skips fenced blocks and
 * stops at the first Verdicts line — because it only picks a line to break. What
 * the line MEANS is never decided here: every assertion is on what
 * tools/verify-tasks.mjs printed afterwards. A helper that judged the line
 * itself would be a second copy of the parser under test, and the cases would
 * pass or fail on the copy rather than on the real gate.
 *
 * It throws when it finds nothing, so a case dies loudly on a moved file instead
 * of quietly testing an unmutated copy.
 *
 * @returns the section id and the 0-based line index that was changed
 */
export function editFirstVerdicts(dir, change) {
  const lines = copyFile(dir, TASKS_MD).split("\n");
  let id;
  let fenced = false;
  for (const [index, line] of lines.entries()) {
    if (line.startsWith("```")) { fenced = !fenced; continue; }
    if (fenced) continue;
    if (/^#{1,2}\s/.test(line)) {
      const heading = /^##\s+(T-\d+(?:\s*\/\s*T-\d+)*)\b/.exec(line);
      id = heading ? heading[1] : undefined;
      continue;
    }
    if (id === undefined || !/^\s*-\s*\*\*Verdicts\*\*/.test(line)) continue;
    const replacement = change(line, id);
    if (replacement === null) lines.splice(index, 1);
    else lines[index] = replacement;
    put(dir, TASKS_MD, lines.join("\n"));
    return { id, index };
  }
  throw new Error(`no \`## T-<number>\` section with a Verdicts line found in ${TASKS_MD} — the file's shape moved`);
}

// --------------------------------------------- asserting on a check's run
//
// Never assert the exit code alone. A copy that cannot even start the script
// exits non-zero — `Cannot find module`, a syntax error, a mutation helper that
// threw — and an exit-code-only assertion reads that as "the pin caught it".
// T-40's harness hit exactly that and reported a pass on a case that was dying
// before the check ran. So a red is only a red when a `FAIL` line names the
// thing the case is about.

/** Every `FAIL  …` line of a run, in order. */
export const failLines = (run) => run.out.split("\n").filter((line) => line.startsWith("FAIL"));

/** Every `ok    …` line of a run, in order. */
export const okLines = (run) => run.out.split("\n").filter((line) => line.startsWith("ok"));

/** Did the run print an `ok` line containing this text? */
export const saidOk = (run, needle) => okLines(run).some((line) => line.includes(needle));

/**
 * The run must be red, and a `FAIL` line must name `needle`. Both halves, so a
 * script that crashed before it checked anything cannot pass as a caught pin.
 */
export function expectRed(run, needle, what) {
  const fails = failLines(run);
  const named = fails.filter((line) => line.includes(needle));
  check(
    what,
    run.status !== 0 && named.length > 0,
    `exit ${run.status}, ${fails.length} FAIL line(s), ${named.length} naming ${JSON.stringify(needle)}\n      ${(fails.length ? fails : run.out.trim().split("\n").slice(-6)).join("\n      ")}`,
  );
}

/** The run must be green: exit 0, and not one `FAIL` line. */
export function expectGreen(run, what) {
  const fails = failLines(run);
  check(
    what,
    run.status === 0 && fails.length === 0,
    `exit ${run.status}\n      ${(fails.length ? fails : run.out.trim().split("\n").slice(-6)).join("\n      ")}`,
  );
}

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
    // A logger shaped the way a real deployment registers one: `ctx.logger(name)`
    // hands back an object whose `info` returns undefined. host/crew.js sends
    // every boot-log line through its `bootLog` helper, which calls
    // `logger.info(note)` when such an `info` exists and `console.log(note)`
    // only when it does not — an if/else, so with this logger a deployment sees
    // each line exactly once and never on the console. (T-11 deleted the older
    // `logger.info(note) ?? console.log(note)` idiom, which said the line twice
    // on a host with a logger; tools/verify-mount.mjs now pins that it cannot
    // come back.) So the console.log swap below only ever catches the
    // no-logger path — see `config.logger === false`.
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
