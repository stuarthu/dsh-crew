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

import { PM_PERSONA_FILE, ROLES, readRoleText } from "../host/roles.js";

let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL  ${message}`); };
const ok = (message) => console.log(`ok    ${message}`);
const skip = (message) => console.log(`SKIP  ${message}`);

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
  // Every role must be unable to start further agents: that is what keeps the
  // crew flat and every member reachable from the PM.
  for (const required of ["subagent", "subagent_fork", ...toolNames]) {
    if (!role.deny.includes(required)) fail(`${role.toolName}: deny list is missing "${required}"`);
  }
}
if (failures === 0) ok("every role is denied all delegation tools (the crew stays flat)");

const reviewer = ROLES.find(role => role.key === "code_reviewer");
for (const writer of ["write", "edit", "str_replace_editor"]) {
  if (!reviewer.deny.includes(writer)) fail(`code reviewer must be denied "${writer}"`);
}

// --------------------------------------------------------------- real mount

let crew;
try {
  crew = await import("../host/crew.js");
} catch (error) {
  skip(`mount checks: dsh is not reachable from here (${error.code ?? "import failed"})`);
}

let SubagentConfig;
if (crew) {
  try {
    ({ Config: SubagentConfig } = await import("@deepseek-ai/dsh-tool-subagent"));
  } catch {
    SubagentConfig = undefined;
  }
}

/** Fake Cordis context: records what the plugin registers. */
function fakeContext() {
  const sections = [];
  const mounts = [];
  return {
    sections,
    mounts,
    effect: (fn) => fn(),
    systemPrompt: { section: (section) => sections.push(section) },
    plugin: (plugin, config) => mounts.push({ plugin, config }),
  };
}

if (crew) {
  const ctx = fakeContext();
  crew.apply(ctx, {});

  if (ctx.sections.length !== 1) fail(`expected 1 prompt section, got ${ctx.sections.length}`);
  else {
    const [section] = ctx.sections;
    if (section.name !== "crew:pm") fail(`prompt section name is "${section.name}"`);
    else if (!section.text.includes("product manager (PM)")) fail("PM section does not contain the PM role text");
    else if (!section.text.includes("crew_engineer")) fail("PM section does not list the real role tool names");
    else if (section.text.includes("{{")) fail("PM section contains {{ }}, which dsh would try to interpolate");
    else ok(`PM prompt section registered (order ${section.order}, ${section.text.length} chars)`);
  }

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

  try {
    crew.apply(fakeContext(), { limits: { liveAgents: 0 } });
    fail("liveAgents: 0 was accepted; it should throw");
  } catch (error) {
    ok(`bad limit rejected at load: ${error.message}`);
  }

  const custom = fakeContext();
  crew.apply(custom, { roleDeny: { engineer: ["subagent"] } });
  const engineer = custom.mounts.find(mount => mount.config.toolName === "crew_engineer");
  if (engineer?.config.toolFilter?.deny?.length !== 1) fail("roleDeny did not replace the shipped deny list");
  else ok("roleDeny replaces the shipped deny list");
}

console.log(failures === 0 ? "\nall mount checks passed" : `\n${failures} mount check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
