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

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PM_PERSONA_FILE, ROLES, readRoleText } from "../host/roles.js";

let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL  ${message}`); };
const ok = (message) => console.log(`ok    ${message}`);
const skip = (message) => console.log(`SKIP  ${message}`);

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
  return {
    sections,
    contexts,
    mounts,
    logs,
    effect: (fn) => fn(),
    systemPrompt: {
      section: (section) => sections.push(section),
      context: (context) => contexts.push(context),
    },
    plugin: (plugin, config) => mounts.push({ plugin, config }),
    // The plugin writes boot-log lines as
    //   ctx.logger?.("dsh-crew")?.info?.(note) ?? console.log(note)
    // so a real deployment may take either path. This covers the logger half;
    // applyCapturingLogs below covers the console.log fallback, so a case that
    // reads `logs` passes because the code really logged, not by accident.
    logger: () => ({ info: (line) => logs.push(String(line)) }),
  };
}

/**
 * Mount the host plugin and collect every boot-log line it wrote, through
 * `ctx.logger` or through the `console.log` fallback.
 *
 * @param config - plugin config for this mount
 * @param logger - false to mount on a host that registers no `ctx.logger`
 * @returns the fake context, with `logs` holding both paths' lines
 */
function applyCapturingLogs(config, { logger = true } = {}) {
  const ctx = fakeContext();
  if (!logger) delete ctx.logger;
  const realLog = console.log;
  console.log = (...args) => ctx.logs.push(args.map(String).join(" "));
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

console.log(failures === 0 ? "\nall mount checks passed" : `\n${failures} mount check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
