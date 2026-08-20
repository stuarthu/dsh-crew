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
