// Checks the role table, the role files, and — when dsh is reachable — the real
// mount: the PM prompt section, one delegation tool per role, and every role
// config validated against the actual config schema of
// @deepseek-ai/dsh-tool-subagent. Run it with:  node tools/verify-mount.mjs
//
// Why two levels: `@deepseek-ai/dsh-tool-subagent` cannot be imported from a
// bare npm install, because its peer `@deepseek-ai/dsh-tasks` is not published
// on the public registry. So on a machine with dsh installed this validates the
// configs for real, and on CI it says out loud which check it had to skip.
//
// To get the full check locally, link dsh's copy once:
//   mkdir -p node_modules/@deepseek-ai
//   ln -s ~/.dsh/profiles/node_modules/@deepseek-ai/dsh-tool-subagent \
//         node_modules/@deepseek-ai/dsh-tool-subagent

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PM_PERSONA_FILE, ROLES, readRoleText } from "../host/roles.js";

let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL  ${message}`); };
const ok = (message) => console.log(`ok    ${message}`);
const skip = (message) => console.log(`SKIP  ${message}`);
// How many times a string appears. A pinned string that must appear twice
// cannot be checked with `includes`, which stops at the first copy.
const copiesOf = (haystack, needle) => haystack.split(needle).length - 1;

// ------------------------------------------------------------- package shape

// Without `dsh.bundle.patch`, `dsh plugin add` installs the package and never
// applies cordis.patch.yml — the plugin is present but nothing loads it. That
// shipped once; this check is why it cannot ship again.
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
const patch = manifest.dsh?.bundle?.patch;
if (typeof patch !== "string") fail("package.json is missing dsh.bundle.patch, so dsh would never apply cordis.patch.yml");
else if (!existsSync(join(packageRoot, patch))) fail(`dsh.bundle.patch points at "${patch}", which does not exist`);
else ok(`package.json declares dsh.bundle.patch -> ${patch}`);

for (const shipped of ["host", "roles", "preset", "cordis.patch.yml"]) {
  if (!manifest.files?.includes(shipped)) fail(`package.json "files" is missing "${shipped}", so it would not be published`);
}

// ------------------------------------------------------------- crew preset

// The role tools live in this preset, and the preset is what makes their
// allow/deny names safe: every name is defined in the same file. So the preset
// must exist, must load the role module, and must NOT re-open another way to
// start an agent — that would break "only the PM starts agents".
const presetDir = join(packageRoot, "preset", "crew");
const presetYaml = join(presetDir, "agent.cordis.yml");
if (!existsSync(join(presetDir, "preset.yml"))) fail("preset/crew/preset.yml is missing");
if (!existsSync(presetYaml)) fail("preset/crew/agent.cordis.yml is missing");
else {
  const preset = readFileSync(presetYaml, "utf8");
  if (!preset.includes("dsh-crew/host/roles-preset.js")) fail("the crew preset does not load dsh-crew/host/roles-preset.js, so it would have no role tools");
  for (const escape of ["toolName: subagent", "dsh-tool-workflow", "dsh-tool-ralph", "provider: codex", "provider: claude-code"]) {
    if (new RegExp(`^\\s*[^#\\n]*${escape.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "m").test(preset)) {
      fail(`the crew preset still enables "${escape}" — a role could start its own agent through it`);
    }
  }
  if (!/dsh-tool-subagent-control/.test(preset)) fail("the crew preset lacks the subagent-control tools, so the PM could not message its crew");

  // Every tool an allow list names must be provided by this preset, or dsh
  // rejects the child at start. The package that registers each name:
  const PROVIDERS = {
    read: "dsh-tool-fs",
    write: "dsh-tool-fs",
    edit: "dsh-tool-fs",
    glob: "dsh-tool-fs-search",
    grep: "dsh-tool-fs-search",
    bash: "dsh-tool-bash",
    web_search: "dsh-tool-web",
  };
  for (const needed of ["dsh-tool-fs", "dsh-tool-fs-search", "dsh-tool-bash"]) {
    if (!preset.includes(needed)) fail(`the crew preset lacks ${needed}, which the roles' allow/deny names rely on`);
  }
  for (const role of ROLES) {
    for (const allowed of role.allow ?? []) {
      const provider = PROVIDERS[allowed];
      if (provider === undefined) fail(`${role.toolName}: allow list names "${allowed}", and this check does not know which package provides it — add it to PROVIDERS`);
      else if (!preset.includes(provider)) fail(`${role.toolName}: allow list names "${allowed}", but the crew preset does not load ${provider}, so every spawn would fail`);
    }
  }
  if (failures === 0) ok("crew preset loads the roles, keeps subagent-control, and re-opens no other way to start an agent");
}

if (manifest.dsh?.desktop?.presets?.[0]?.path !== "./preset/crew") fail("package.json does not declare the crew preset under dsh.desktop.presets");
// Every module named by a cordis row must be exported, or dsh cannot resolve it.
for (const [row, subpath] of [...readFileSync(join(packageRoot, patch ?? "cordis.patch.yml"), "utf8").matchAll(/name:\s*'dsh-crew\/([^']+)'/g)]) {
  if (manifest.exports?.[`./${subpath}`] === undefined) fail(`cordis.patch.yml loads "./${subpath}" but package.json "exports" does not expose it (${row.trim()})`);
}
if (failures === 0) ok("every module the patch loads is exported from package.json");

// ---------------------------------------------------------------- role files

for (const fileName of [PM_PERSONA_FILE, ...ROLES.map(role => role.personaFile)]) {
  try {
    const text = readRoleText(fileName, undefined);
    if (text.length < 500) fail(`${fileName}: only ${text.length} chars; a role needs real instructions`);
    else ok(`${fileName}: loads (${text.length} chars, no "{{")`);
  } catch (error) {
    fail(error.message);
  }
}

// The other side of the same rule (CRD 0006). These three role files used to
// send a small job's decision about HOW to a **Decisions** section of the DoD.
// That file lives in the job folder and is dropped with it, so the decision was
// dropped too. Each file must now name the ADR folder instead. One path and one
// absent string per file — no prose, so a rewording cannot turn this red.
for (const fileName of ["engineer.md", "architect.md", "doc-reviewer.md"]) {
  const text = readRoleText(fileName, undefined);
  if (!text.includes("docs/decisions/adr/")) fail(`roles/${fileName} does not name docs/decisions/adr/ — CRD 0006 sends every decision about HOW to an ADR there, whatever the size of the job. Put the path back`);
  else if (text.includes("**Decisions** section")) fail(`roles/${fileName} still sends a small job's decision to a **Decisions** section of the DoD, which is dropped with the job folder. Point it at an ADR in docs/decisions/adr/ instead`);
  else ok(`roles/${fileName} sends a decision about HOW to docs/decisions/adr/`);
}

// `roles/qa.md` had no content pin at all: it went through the generic loop
// above, which only checks the length and `{{`, so the four rules CRD 0006 put
// in it could be deleted and every check stayed green. That CRD splits QA's
// files by how long they live — the plan is single-use and belongs in the job
// folder, the cases and the gap list stay in the repository — so each half gets
// its own pin. Paths and one phrase of a command only; no prose, so a rewording
// cannot turn this red. The two ABSENT strings can only come back by somebody
// writing the old rule again, which is exactly what they are here to catch.
{
  const text = readRoleText("qa.md", undefined);
  if (text.includes("docs/qa/<task-id>-plan.md")) fail("roles/qa.md sends QA's test plan to `docs/qa/<task-id>-plan.md`, inside the repository — that is the defect CRD 0006 fixed: the plan is single-use, so it lives in the job folder beside `state.json` and is dropped with it. Point it at `<job folder>/<task-id>-plan.md` instead");
  else if (!text.includes("<job folder>/<task-id>-plan.md")) fail("roles/qa.md does not name `<job folder>/<task-id>-plan.md` — QA's plan is single-use and lives beside `state.json` in the job folder, and with that path gone QA is told nowhere to write it. Put it back");
  else if (text.includes("commits your plan")) fail("roles/qa.md still says the PM `commits your plan` — the plan never enters the repository (CRD 0006); the PM commits QA's case files and nothing else. Remove that from roles/qa.md");
  else if (!text.includes("docs/qa/gaps.md")) fail("roles/qa.md does not name `docs/qa/gaps.md` — that is the one part of the plan that outlives the plan, and QA is the only role that knows why a thing could not be tested. Put the path back");
  else if (!text.includes("docs/qa/<task-id>/")) fail("roles/qa.md is missing `docs/qa/<task-id>/` — QA's cases stay in the repository whatever happens to the plan, one folder per task, so tidying the plan out must not take the cases with it. Put the path back");
  else if (!text.includes("docs/qa/run-all.sh")) fail("roles/qa.md is missing `docs/qa/run-all.sh` — the runner that finds every task's cases stays in the repository too; without it a case file is written and never run again. Put the path back");
  else ok("roles/qa.md keeps the plan in the job folder and the cases, the runner and the gap list in docs/qa/");
}

// CRD 0010, in the four role files that act on it. `DoD` is the name of a
// SECTION and never a file name: every milestone and every task row carries one,
// and a check now lives as an item inside it. So each of these files must name
// `docs/design/tasks.md` — the one task table, in both lanes, whoever types it —
// and must say `DoD section`, and must NOT name a file called `dod.md`.
//
// The absent string is the pin that matters. A DoD written as its own file lives
// in the job folder, is dropped with the job, and takes every check inside it
// along: this crew lost 75 acceptance checks that way in one hour, which is the
// evidence in the CRD. An absent string cannot go red from a rewording — it
// takes somebody writing the old rule back, which is exactly what it is here to
// catch. Two paths and one section name, so no prose is pinned.
for (const fileName of ["architect.md", "engineer.md", "qa.md", "doc-reviewer.md"]) {
  const text = readRoleText(fileName, undefined);
  if (text.includes("dod.md")) fail(`roles/${fileName} names a file called \`dod.md\` (at index ${text.indexOf("dod.md")}) — CRD 0010 forbids that file name anywhere, because a DoD file lives in the job folder and is dropped with it. \`DoD\` is a section of docs/design/prd.md or of a task row in docs/design/tasks.md. Point the role at those two files instead`);
  else if (!text.includes("docs/design/tasks.md")) fail(`roles/${fileName} does not name \`docs/design/tasks.md\` — CRD 0010 gives both lanes one task table in one place, with one shape; only the typist changes (the architect on big work, the PM on small work). Every task row and its DoD section live there, so a role that does not know the path cannot read its own task. Put it back`);
  else if (!text.includes("DoD section")) fail(`roles/${fileName} never says \`DoD section\` — that is the thing CRD 0010 creates: what "done" means and how somebody else checks it, written into the task row or the milestone. With the name gone the role no longer knows the section exists. Put it back`);
  else ok(`roles/${fileName} points at docs/design/tasks.md and knows the DoD section, and names no dod.md`);
}

// The false-red rule, in the two files that carry it. A red that names a file
// another live task is writing is not a defect, and the role has to say so in a
// phrase the PM can recognise: `the tree was moving`. Both files put that phrase
// on a line of its own so it could be pinned, and neither was pinned — delete
// the whole section and every check stayed green, while the crew starts chasing
// other tasks' half-saved files as defects. Unlike the paths above this IS
// prose, and the pin is brittle on purpose, the same trade as ADR 0004: the
// failure message says out loud that a legitimate reword edits the prompt and
// this string in the same commit.
for (const fileName of ["engineer.md", "qa.md"]) {
  const text = readRoleText(fileName, undefined);
  if (!text.includes("the tree was moving")) fail(`roles/${fileName} is missing the string \`the tree was moving\` — that is the exact phrase the role must say when a red names a file another live task owns, and it is what keeps a moving tree from being reported as a defect. The section has been dropped, or the phrase was reworded. This one is prose and this pin is brittle on purpose (see docs/decisions/adr/0004-parallel-anchor-string.md): put the rule back, or update this string in tools/verify-mount.mjs in the same commit`);
  else ok(`roles/${fileName} tells the role to say "the tree was moving" instead of reporting a false red`);
}

const toolNames = ROLES.map(role => role.toolName);
if (new Set(toolNames).size !== toolNames.length) fail(`duplicate role tool names: ${toolNames.join(", ")}`);
else ok(`role tool names are unique: ${toolNames.join(", ")}`);

for (const role of ROLES) {
  if (["subagent", "subagent_fork"].includes(role.toolName)) fail(`role tool "${role.toolName}" collides with a stock dsh tool`);
  if ((role.allow === undefined) === (role.deny === undefined)) fail(`${role.toolName}: a role needs exactly one of allow / deny`);

  if (role.allow !== undefined) {
    // An allow list closes everything it does not name. No allow-list role may
    // name a shell or a way to start an agent — a shell alone can write files,
    // run the code and reach the network.
    for (const forbidden of ["bash", "pwsh", "subagent", "workflow", "ralph", ...toolNames]) {
      if (role.allow.includes(forbidden)) fail(`${role.toolName}: allow list names "${forbidden}", which defeats the point of the allow list`);
    }
    // A reviewer judges something; it must not be able to change it. Other
    // allow-list roles (the researcher writes findings) may keep `write`.
    if (role.key.includes("review")) {
      for (const writer of ["write", "edit", "str_replace_editor"]) {
        if (role.allow.includes(writer)) fail(`${role.toolName}: a reviewer may not have "${writer}"`);
      }
      if (!role.allow.includes("read")) fail(`${role.toolName}: a reviewer must be able to read`);
    }
    continue;
  }

  // Every deny-list role must be unable to start another crew role: that is
  // what keeps the crew flat and every member reachable from the PM.
  for (const required of toolNames) {
    if (!role.deny.includes(required)) fail(`${role.toolName}: deny list is missing "${required}"`);
  }
  // dsh checks a denied name against the PRESET when the child starts, and a
  // name the crew preset does not define fails every spawn. The crew preset
  // removes these, so naming them here would be a self-inflicted outage.
  for (const absent of ["subagent", "subagent_fork", "workflow", "ralph", "str_replace_editor", "pwsh"]) {
    if (role.deny.includes(absent)) fail(`${role.toolName}: deny list names "${absent}", which the crew preset does not define — every spawn would fail`);
  }
}
if (failures === 0) ok("every role is denied all delegation tools (the crew stays flat)");

// The reviewer must stay read-only, and reading is all it may do. Two live
// tests forced this shape: a deny list let it write with `echo > file`, and
// even with the shell gone it still held workflow, ralph and desktop MCP tools.
const reviewer = ROLES.find(role => role.key === "code_reviewer");
if (reviewer.allow === undefined) fail("the code reviewer must use an allow list, not a deny list");
else if (!reviewer.allow.includes("read")) fail("the code reviewer must be allowed to read");
else ok(`code reviewer is read-only by allow list: ${reviewer.allow.join(", ")}`);

if (ROLES.find(role => role.key === "engineer").deny?.includes("bash")) {
  fail("the engineer must keep bash: it has to run the tests it writes");
}

// --------------------------------------------------------------- real mount

// Host plane: the PM section. Never installs the preset here — these checks
// must not write into anyone's harness home.
const crew = await import("../host/crew.js");

// Agent plane: the role tools. Needs dsh, which a bare npm install cannot
// provide, so this half is skipped out loud on CI.
let roles;
try {
  roles = await import("../host/roles-preset.js");
} catch (error) {
  skip(`role-tool mount checks: dsh is not reachable from here (${error.code ?? "import failed"})`);
}

let SubagentConfig;
if (roles) {
  try {
    ({ Config: SubagentConfig } = await import("@deepseek-ai/dsh-tool-subagent"));
  } catch {
    SubagentConfig = undefined;
  }
}

/** Fake Cordis context: records what the plugin registers, and what it logs. */
function fakeContext() {
  const sections = [];
  const contexts = [];
  const mounts = [];
  const logs = [];
  const loggerLogs = [];
  const consoleLogs = [];
  return {
    sections,
    contexts,
    mounts,
    // `logs` is every boot-log line, whichever path wrote it. The two lists
    // beside it record WHICH path took each line, which is how a line said
    // twice — once through the logger and once through the console — is caught.
    logs,
    loggerLogs,
    consoleLogs,
    effect: (fn) => fn(),
    systemPrompt: {
      section: (section) => sections.push(section),
      context: (context) => contexts.push(context),
    },
    plugin: (plugin, config) => mounts.push({ plugin, config }),
    // A deployment may hand the plugin a logger or none at all, so a boot-log
    // line has two paths out. This is the logger half; applyCapturingLogs below
    // catches the console.log half, so a case that reads `logs` passes because
    // the code really logged, not by accident.
    logger: () => ({
      info: (line) => {
        loggerLogs.push(String(line));
        logs.push(String(line));
      },
    }),
  };
}

/**
 * Mount the host plugin and collect every boot-log line it wrote, through
 * `ctx.logger` or through the `console.log` fallback.
 *
 * @param config - plugin config for this mount
 * @param logger - `true` for the recording logger, `false` for a host that
 *   registers none, or any other value to put in `ctx.logger`: a logger that is
 *   not a function, or one that hands back nothing, or one with no `info`
 * @returns the fake context, with `logs` holding both paths' lines and
 *   `loggerLogs` / `consoleLogs` saying which path each line took
 */
function applyCapturingLogs(config, { logger = true } = {}) {
  const ctx = fakeContext();
  if (logger === false) delete ctx.logger;
  else if (logger !== true) ctx.logger = logger;
  const realLog = console.log;
  console.log = (...args) => {
    const line = args.map(String).join(" ");
    ctx.consoleLogs.push(line);
    ctx.logs.push(line);
  };
  try {
    crew.apply(ctx, config);
  } finally {
    console.log = realLog;
  }
  return ctx;
}

{
  const ctx = fakeContext();
  crew.apply(ctx, { installPreset: false });

  if (ctx.mounts.length !== 0) fail(`the host plugin mounted ${ctx.mounts.length} plugin(s); role tools belong in the preset`);
  if (ctx.sections.length !== 1) fail(`expected 1 prompt section, got ${ctx.sections.length}`);
  else {
    const [section] = ctx.sections;
    if (section.name !== "crew:pm") fail(`prompt section name is "${section.name}"`);
    else if (!section.text.includes("product manager (PM)")) fail("PM section does not contain the PM role text");
    else if (!section.text.includes("crew_engineer")) fail("PM section does not list the real role tool names");
    else if (section.text.includes("{{")) fail("PM section contains {{ }}, which dsh would try to interpolate");
    // The merge-and-clean-up step has to survive a rewrite of the PM prompt: a
    // squash merge would drop every task's test-first history, a branch deleted
    // only locally leaves the remote one behind, and a delete with no proof
    // throws work away. `--ff-only` is the only allowed way to catch local
    // `main` up with the remote (a force push never is), `origin/crew/` is the
    // proof that reads the REMOTE work branch, and `publishCheck` is the
    // record of which CI files were read before a `main` push. The eighth
    // string is the job-slug pattern: that slug is interpolated into a file
    // path and into nearly every git command of the merge step, and the PM's
    // own session is the one the git guard trusts, so the shape rule is the
    // only thing that keeps those commands one command. All eight must stay
    // spelled out. Commands, one field name and one pattern only — pinning
    // prose would turn every small rewording red.
    else if (!section.text.includes("git merge --no-ff") || !section.text.includes("git branch -d crew/")
      || !section.text.includes("git push origin --delete") || !section.text.includes("git branch --merged main")
      || !section.text.includes("--ff-only") || !section.text.includes("origin/crew/")
      || !section.text.includes("publishCheck")
      || !section.text.includes("^[a-z0-9]([a-z0-9-]*[a-z0-9])?$")) fail("PM section is missing the merge and clean-up strings `git merge --no-ff`, `git branch -d crew/`, `git push origin --delete`, `git branch --merged main`, `--ff-only`, `origin/crew/` and `publishCheck`, or the job-slug pattern `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$` — put them back in roles/pm.md");
    // `git push origin --delete` has to appear TWICE, and the presence check
    // above cannot see that: once as the command the PM runs itself, and once
    // in the fallback it hands the user when the guard or the remote refuses
    // that delete. Dropping either copy leaves a real hole — no way to delete
    // the remote branch, or no way for the user to finish the delete by hand —
    // while every presence check stays green. Two engineers proved that
    // separately, so the count is pinned. It counts a command, not prose, so a
    // rewording cannot trip it.
    else if (copiesOf(section.text, "git push origin --delete") < 2) fail("PM section holds only 1 copy of `git push origin --delete` — the string is there, but one of the two copies is gone. It belongs in roles/pm.md twice: once as the command the PM runs, and once in the fallback command it gives the user when that delete is refused. Put the missing copy back");
    // Step 9's parallel rule carries no command, so none of the strings above
    // pins it: the whole paragraph could be deleted and all four checks stayed
    // green. It is pinned anyway, because losing it is invisible — no check, no
    // error, just a job where the PM hands tasks out one at a time again and
    // the user waits four times as long. Unlike the eight strings above this is
    // prose, and it IS brittle on purpose: reword the bold heading of that
    // paragraph and this check goes red, so whoever rewords it edits this
    // string in the same commit. `Parallel is the default` would not do for
    // step 9 — that is step 10's own rule, which the next check pins on its own.
    else if (!section.text.includes("Parallel by default")) fail("PM section is missing the string `Parallel by default` — step 9's parallel rule (one crew_engineer per task, all the calls in one message) has been dropped from roles/pm.md, or its heading was reworded. Put the rule back, or update this string in tools/verify-mount.mjs in the same commit");
    // Step 10's parallel rule is the same hole one step later, and it was left
    // open when step 9's was closed: delete the paragraph that starts the code
    // review, the security review and QA in one message, and all four checks
    // stayed green. So it gets its own pin. `Parallel is the default` is the
    // anchor because it appears exactly once in roles/pm.md, in step 10. This
    // is prose as well, and brittle on purpose for the same reason as the check
    // above: reword that sentence and this check goes red, so a legitimate
    // reword edits the prompt and this string in one commit.
    else if (!section.text.includes("Parallel is the default")) fail("PM section is missing the string `Parallel is the default` — step 10's parallel rule (the code review, the security review and QA started in one message, with running them in order named in the summary as the exception) has been dropped from roles/pm.md, or that sentence was reworded. Put the rule back, or update this string in tools/verify-mount.mjs in the same commit");
    // CRD 0006 splits the crew's documents by how long they live. Three of the
    // homes it names are PATHS, so they can be pinned without pinning prose,
    // and each one is where something lands that would otherwise vanish with
    // the job folder: `docs/decisions/adr/` holds a decision about HOW (now
    // whatever the size of the job, so the PM writes it when there is no
    // architect), `principles.md` holds a rule the crew must keep, and
    // `docs/qa/gaps.md` holds QA's "what I could not test here". This check only
    // proves the three paths are SOMEWHERE in the prompt. It is not a guard on
    // the closing migration step, and never was: the **Hard rules** section
    // repeats `principles.md` and `docs/qa/gaps.md`, and step 11 now names
    // `docs/qa/gaps.md` as well because the PM has to stage it — so the
    // migration step could be deleted with all three paths still present. The
    // count below is that step's own pin.
    else if (!section.text.includes("docs/decisions/adr/") || !section.text.includes("principles.md")
      || !section.text.includes("docs/qa/gaps.md")) fail("PM section is missing one of the three decision homes `docs/decisions/adr/`, `principles.md` and `docs/qa/gaps.md` — CRD 0006 puts every decision about HOW in an ADR whatever the size of the job, and makes the PM move a rule to principles.md and QA's untestable gaps to docs/qa/gaps.md before a single-use document is dropped. Put the missing path back in roles/pm.md");
    // Step 18's closing migration step — move what is durable out of a
    // single-use document before it is dropped — carried no pin of its own, and
    // the presence check above cannot be one: delete that whole paragraph and
    // all three of its paths are still somewhere else in the prompt, so every
    // check stayed green while "not needed any more" quietly became "lost".
    // Proved by mutation, not assumed.
    //
    // The count closes it, on the same reasoning as the two-copies pin on
    // `git push origin --delete`: `docs/qa/gaps.md` appears THREE times in
    // roles/pm.md and each copy does a different job — step 11 stages the file
    // so the standing gap list is committed, step 18 fills it before the plan is
    // dropped, and the **Hard rules** summary states the rule. No two of them
    // sit in the same paragraph, so dropping any one is a real hole with nothing
    // else covering it. Counted, not eyeballed, because `includes` stops at the
    // first copy.
    //
    // It counts a PATH, not prose, so a reworded sentence inside the migration
    // step stays green — deliberately unlike the `Parallel by default` and `the
    // tree was moving` pins (ADR 0004, ADR 0007), which had no path or command
    // to hold on to. This one does, so it does not pay their brittleness.
    else if (copiesOf(section.text, "docs/qa/gaps.md") < 3) fail(`PM section holds only ${copiesOf(section.text, "docs/qa/gaps.md")} copy/copies of \`docs/qa/gaps.md\`, and it needs 3 — one of them has been dropped from roles/pm.md. The three are: step 11, which STAGES the file so the gap list is committed; step 18's closing migration step, which FILLS it before a single-use document is dropped (the most likely loss: that paragraph is the only place the five destinations — principles.md, an ADR, a CRD, the commit message, the gap list — are listed, and deleting it leaves every other check green); and the **Hard rules** summary of the same rule. Put the missing copy back`);
    // The two strings CRD 0006 replaced, pinned as ABSENT. A how-decision on a
    // small job used to go into a **Decisions** section of the DoD — a file in
    // the job folder, dropped when the job ends, so the decision went with it.
    // And roles/pm.md said "Only the architect writes an ADR", which flatly
    // contradicts a PM that writes the ADR itself on small work. Neither string
    // can come back by a reword: it takes someone writing the old rule again.
    else if (section.text.includes("**Decisions** section")) fail("PM section still sends a decision to a **Decisions** section of the DoD — the DoD lives in the job folder and is dropped with it, so CRD 0006 moved every decision about HOW to an ADR in docs/decisions/adr/. Remove that instruction from roles/pm.md");
    else if (section.text.includes("Only the architect writes an ADR")) fail("PM section still says `Only the architect writes an ADR` — CRD 0006 makes the PM write it when the job has no architect, so that line contradicts the rule around it. Remove it from roles/pm.md");
    // CRD 0010. Both lanes now open with the same document, `docs/design/prd.md`
    // — a short one for small work, the same file with milestones for big work —
    // and both keep the task table in `docs/design/tasks.md`. Two paths, pinned
    // present.
    else if (!section.text.includes("docs/design/prd.md")
      || !section.text.includes("docs/design/tasks.md")) fail("PM section is missing `docs/design/prd.md` or `docs/design/tasks.md` — CRD 0010 gives both lanes the same opening document and the same task table, so the PM briefs a role for small work with the same two paths as for big work. Put the missing path back in roles/pm.md");
    // The same section name the four role files carry, so the PM and the crew
    // mean one thing by it. This is a NAME, not prose — like `publishCheck`
    // above — but it proves only that the name is somewhere in the prompt, not
    // that step 4 still tells the PM to write one per task and per milestone.
    // The known limit of ADR 0004 applies: a second copy of the string anywhere
    // would let step 4's rule be deleted with this pin still green.
    else if (!section.text.includes("DoD section")) fail("PM section never says `DoD section` — CRD 0010 makes every milestone and every task row carry one, and that section is the only place a check lives now: what \"done\" means, and how somebody else checks it. With the name gone the PM has nowhere to write it. Put it back in roles/pm.md");
    // Two ABSENT strings for the two shapes CRD 0010 removed. Neither can come
    // back by a rewording; it takes somebody writing the old rule again.
    //
    // `dod.md`: a DoD written as its own file lived in the job folder, was
    // dropped with the job, and took every check inside it along — 75 of them in
    // one hour, which is the evidence that forced the CRD. The pin is the bare
    // file name, so it catches every path it could be written as.
    else if (section.text.includes("dod.md")) fail(`PM section names a file called \`dod.md\` (at index ${section.text.indexOf("dod.md")}) — CRD 0010 forbids that file name anywhere, whichever path it is written as (~/.dsh/crew/jobs/<job-slug>/dod.md, docs/design/dod.md, docs/crew/dod.md). \`DoD\` is a section of docs/design/prd.md or of a task row in docs/design/tasks.md, never a file: a file in the job folder is dropped with the job, and this crew lost 75 acceptance checks that way in one hour. Take the path out of roles/pm.md`);
    // The flat numbered acceptance-check list. A check is now an item in the DoD
    // section of the task or the milestone it belongs to, so a CRD records "4
    // items added to T-05's DoD" and never "acceptance checks 18-21" — a number
    // that points into a flat table nobody keeps. That table is what made three
    // of this job's own checks go stale or contradict each other.
    else if (section.text.includes("Acceptance checks — a numbered list")) fail("PM section still tells the PM to write `Acceptance checks — a numbered list` — CRD 0010 removed the flat numbered list. A check is an item inside the DoD section of the task or milestone it belongs to, and it is named that way (\"item 2 of T-05's DoD\"), because a global number points into a table that goes stale. Remove that line from roles/pm.md");
    else ok(`PM prompt section registered (order ${section.order}, ${section.text.length} chars)`);
  }

  // The unfinished-job notice: registered as a dynamic context, and quiet when
  // there is no job to report. A prompt must never fail because of a job file,
  // so the provider is also pointed at a folder that does not exist.
  const [jobs] = ctx.contexts;
  if (ctx.contexts.length !== 1) fail(`expected 1 dynamic context, got ${ctx.contexts.length}`);
  else if (jobs.name !== "crew:jobs") fail(`dynamic context name is "${jobs.name}"`);
  else if (typeof jobs.text !== "function") fail("the job notice must be a provider, so it is re-read every turn");
  else {
    const quiet = fakeContext();
    crew.apply(quiet, { installPreset: false, jobsDir: "/nonexistent/crew/jobs" });
    if (quiet.contexts[0].text({}) !== "") fail("with no job folder the notice must contribute nothing");
    else ok(`unfinished-job notice registered (order ${jobs.order}, silent when there is no job)`);
  }

  const off = fakeContext();
  crew.apply(off, { installPreset: false, resumeNotice: false });
  if (off.contexts.length !== 0) fail("resumeNotice: false should register no context");
  else ok("resumeNotice: false turns the notice off");

  try {
    crew.apply(fakeContext(), { installPreset: false, limits: { liveAgents: 0 } });
    fail("liveAgents: 0 was accepted; it should throw");
  } catch (error) {
    ok(`bad limit rejected at load: ${error.message}`);
  }

  // CRD 0003 removed `limits.agentsPerJob`: a job may use as many crew agents as
  // it needs. A profile written before that still carries the setting, and that
  // value is not WRONG the way `liveAgents: 0` is wrong — the product dropped
  // the setting. So the mount must go on (a throw would stop somebody's session
  // from starting over a line that used to be legal) and must say one line in
  // the boot log, or the user never learns the line can go.
  let legacy;
  try {
    legacy = applyCapturingLogs({ installPreset: false, limits: { agentsPerJob: 30 } });
    if (legacy.sections.length !== 1) fail(`limits.agentsPerJob: 30 registered ${legacy.sections.length} prompt section(s), expected 1`);
    else ok("limits.agentsPerJob is accepted without throwing, and the mount goes on");
  } catch (error) {
    fail(`limits.agentsPerJob: 30 threw instead of being accepted — ${error.message}`);
  }
  const legacyNote = (legacy?.logs ?? []).find(line => line.includes("agentsPerJob"));
  if (legacyNote === undefined) {
    fail(`limits.agentsPerJob: 30 said nothing about the setting in the boot log, so the user cannot know it is gone (logged: ${JSON.stringify(legacy?.logs ?? [])})`);
  } else ok(`legacy limits.agentsPerJob named in the boot log: ${legacyNote}`);

  // Not every host registers a logger, and the note is the only way the user
  // learns the setting can go — so it must also come out of the console.log
  // fallback the plugin ends that line with.
  const noLogger = applyCapturingLogs({ installPreset: false, limits: { agentsPerJob: 30 } }, { logger: false });
  if (!noLogger.logs.some(line => line.includes("agentsPerJob"))) fail("on a host with no ctx.logger the removed-setting note never reached the boot log");
  else ok("removed-setting note also reaches a host with no ctx.logger");

  // ONE note, ONE line. QA found the boot log saying every note twice: the old
  // call site handed the note to the logger and then fell back to the console
  // as well, because a real logger's `info()` returns undefined and `??` reads
  // that as "nothing happened". Counted here, not eyeballed, on every shape of
  // host a deployment may hand the plugin.
  const timesSaid = (ctx, marker) => (ctx?.logs ?? []).filter(line => line.includes(marker)).length;

  const saidWithLogger = timesSaid(legacy, "agentsPerJob");
  if (saidWithLogger !== 1) {
    fail(`with a logger the removed-setting note was written ${saidWithLogger} time(s), expected exactly 1 (logged: ${JSON.stringify(legacy?.logs ?? [])})`);
  } else if (legacy.loggerLogs.length !== 1 || legacy.consoleLogs.length !== 0) {
    fail(`with a logger the note must go through the logger only (logger: ${JSON.stringify(legacy.loggerLogs)}, console: ${JSON.stringify(legacy.consoleLogs)})`);
  } else ok("with a logger the removed-setting note is said exactly once, through the logger");

  const saidWithoutLogger = timesSaid(noLogger, "agentsPerJob");
  if (saidWithoutLogger !== 1) {
    fail(`on a host with no ctx.logger the removed-setting note was written ${saidWithoutLogger} time(s), expected exactly 1 (logged: ${JSON.stringify(noLogger.logs)})`);
  } else ok("with no ctx.logger the removed-setting note is said exactly once, through console.log");

  // A host may also register something that is not a function, or a logger that
  // hands back nothing usable. Each of those must still say the note once — not
  // zero times, and not twice, and never by throwing the mount away.
  for (const [label, logger] of [
    ["a ctx.logger that is not a function", {}],
    ["a ctx.logger that hands back nothing", () => undefined],
    ["a ctx.logger with no info()", () => ({})],
  ]) {
    let odd;
    try {
      odd = applyCapturingLogs({ installPreset: false, limits: { agentsPerJob: 30 } }, { logger });
    } catch (error) {
      fail(`${label}: the mount threw instead of saying the note once — ${error.message}`);
      continue;
    }
    const said = timesSaid(odd, "agentsPerJob");
    if (said !== 1) fail(`${label}: the removed-setting note was written ${said} time(s), expected exactly 1 (logged: ${JSON.stringify(odd.logs)})`);
    else ok(`${label}: the note still comes out once, through console.log`);
  }

  // The idiom must not come back by copy-paste. Every boot-log line goes
  // through one helper now, so no call site in host/crew.js may end in a
  // fallback to the console after the logger already had the line.
  const crewSource = readFileSync(join(packageRoot, "host", "crew.js"), "utf8");
  if (/\?\?\s*console\.log/.test(crewSource)) {
    fail("host/crew.js still writes a boot-log line as logger-then-`?? console.log`, which says it twice on a host with a logger");
  } else ok("no boot-log call site in host/crew.js falls through to console.log after the logger");

  // The PM prompt is built from the limits, so it is where a limit that no
  // longer exists would keep being promised to the PM. Defaults after CRD 0003:
  // 20 agents awake at the same time, review rounds unchanged at 3.
  const promptText = ctx.sections[0]?.text ?? "";
  if (/agentsPerJob|agents for one job/.test(promptText)) fail("the PM prompt still names a per-job agent limit, which CRD 0003 removed");
  else if (!promptText.includes("crew agents awake at the same time: 20")) fail("the PM prompt does not carry the default of 20 crew agents awake at the same time");
  else if (!promptText.includes("review rounds before you bring the disagreement to the user: 3")) fail("the PM prompt does not carry the default of 3 review rounds");
  else ok("PM prompt has no per-job limit, and defaults to 20 agents awake and 3 review rounds");
}

if (roles) {
  const ctx = fakeContext();
  roles.apply(ctx, {});

  if (ctx.mounts.length !== ROLES.length) fail(`expected ${ROLES.length} role mounts, got ${ctx.mounts.length}`);
  for (const { plugin, config } of ctx.mounts) {
    const label = config.toolName ?? "(unnamed)";
    if (plugin?.name !== "tool-subagent") fail(`${label}: mounted plugin is "${plugin?.name}", expected tool-subagent`);
    if (typeof config.persona !== "string" || config.persona.length < 100) fail(`${label}: persona text is missing or suspiciously short`);
    if (config.backgroundMode !== "continuable") fail(`${label}: backgroundMode must be continuable so the PM can message it`);
    if (config.maxDepth !== 1) fail(`${label}: maxDepth must be 1 so only the root PM can start roles`);
    if (config.provider !== "spawn") fail(`${label}: provider must be spawn`);

    if (SubagentConfig === undefined) {
      skip(`${label}: config not validated against tool-subagent's schema (dsh not installed here)`);
      continue;
    }
    try {
      SubagentConfig(config); // the real schema: throws on any bad field
      ok(`${label}: config accepted by tool-subagent (maxDepth ${config.maxDepth}, deny ${config.toolFilter?.deny?.length ?? 0} tools)`);
    } catch (error) {
      fail(`${label}: tool-subagent rejected the config — ${error.message}`);
    }
  }

  const custom = fakeContext();
  roles.apply(custom, { roleDeny: { engineer: ["crew_engineer"] } });
  const engineer = custom.mounts.find(mount => mount.config.toolName === "crew_engineer");
  if (engineer?.config.toolFilter?.deny?.length !== 1) fail("roleDeny did not replace the shipped deny list");
  else ok("roleDeny replaces the shipped deny list");
}

// -------------------------------------------- the .bak note, said once

// The plugin's other boot-log line: the one naming the files an upgrade kept as
// `.bak`. It only happens on a real install, so this runs against a throwaway
// DSH_HOME and never reads or writes the user's own ~/.dsh.
{
  const homes = [];

  /** A harness home holding a crew preset dsh-crew wrote one version ago, with a file the user edited. */
  const upgradeHome = () => {
    const home = mkdtempSync(join(tmpdir(), "crew-mount-home-"));
    homes.push(home);
    const target = join(home, ".agent-presets", "crew");
    mkdirSync(target, { recursive: true });
    writeFileSync(join(target, ".installed-by-dsh-crew"), "0.0.1\n");
    // Different from the shipped file, so the upgrade has something to keep.
    writeFileSync(join(target, "agent.cordis.yml"), "# my own roleAllow edit\n");
    return home;
  };

  /** Mount with the preset installer on, pointed at `home`. */
  const upgradeIn = (home, options) => {
    const previous = process.env.DSH_HOME;
    process.env.DSH_HOME = home;
    try {
      return applyCapturingLogs({}, options);
    } finally {
      if (previous === undefined) delete process.env.DSH_HOME;
      else process.env.DSH_HOME = previous;
    }
  };

  try {
    const withLogger = upgradeIn(upgradeHome());
    const saidWith = withLogger.logs.filter(line => line.includes(".bak")).length;
    if (saidWith !== 1) {
      fail(`with a logger the upgrade's .bak note was written ${saidWith} time(s), expected exactly 1 (logged: ${JSON.stringify(withLogger.logs)})`);
    } else if (withLogger.consoleLogs.length !== 0) {
      fail(`with a logger the .bak note must not also go to console.log (console: ${JSON.stringify(withLogger.consoleLogs)})`);
    } else ok("with a logger the upgrade's .bak note is said exactly once, through the logger");

    const withoutLogger = upgradeIn(upgradeHome(), { logger: false });
    const saidWithout = withoutLogger.logs.filter(line => line.includes(".bak")).length;
    if (saidWithout !== 1) {
      fail(`on a host with no ctx.logger the upgrade's .bak note was written ${saidWithout} time(s), expected exactly 1 (logged: ${JSON.stringify(withoutLogger.logs)})`);
    } else ok("with no ctx.logger the upgrade's .bak note is said exactly once, through console.log");
  } finally {
    // A check that leaves folders in /tmp behind is a check nobody wants twice.
    for (const home of homes) rmSync(home, { recursive: true, force: true });
  }
}

console.log(failures === 0 ? "\nall mount checks passed" : `\n${failures} mount check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
