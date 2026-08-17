// Mounts host/crew.js against a fake Cordis context and checks the result:
// the PM prompt section is registered, one delegation tool is mounted per role,
// and every role config passes the REAL config schema of
// @deepseek-ai/dsh-tool-subagent. Run it with:  node tools/verify-mount.mjs
//
// This catches the failures that would otherwise appear only when dsh starts:
// a broken role file, a bad limit, or a config field the subagent tool rejects.

import { Config as SubagentConfig } from "@deepseek-ai/dsh-tool-subagent";

import * as crew from "../host/crew.js";
import { ROLES } from "../host/roles.js";

let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL  ${message}`); };
const ok = (message) => console.log(`ok    ${message}`);

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

const ctx = fakeContext();
crew.apply(ctx, {});

// 1. The PM section.
if (ctx.sections.length !== 1) fail(`expected 1 prompt section, got ${ctx.sections.length}`);
else {
  const [section] = ctx.sections;
  if (section.name !== "crew:pm") fail(`prompt section name is "${section.name}"`);
  else if (!section.text.includes("product manager (PM)")) fail("PM section does not contain the PM role text");
  else if (!section.text.includes("crew_engineer")) fail("PM section does not list the real role tool names");
  else if (section.text.includes("{{")) fail("PM section contains {{ }}, which dsh would try to interpolate");
  else ok(`PM prompt section registered (order ${section.order}, ${section.text.length} chars)`);
}

// 2. One delegation tool per role, each config valid for tool-subagent.
if (ctx.mounts.length !== ROLES.length) fail(`expected ${ROLES.length} role mounts, got ${ctx.mounts.length}`);
for (const { plugin, config } of ctx.mounts) {
  const label = config.toolName ?? "(unnamed)";
  if (plugin?.name !== "tool-subagent") fail(`${label}: mounted plugin is "${plugin?.name}", expected tool-subagent`);
  try {
    SubagentConfig(config); // the real schema: throws on any bad field
    ok(`${label}: config accepted by tool-subagent (provider ${config.provider}, maxDepth ${config.maxDepth}, deny ${config.toolFilter?.deny?.length ?? 0} tools)`);
  } catch (error) {
    fail(`${label}: tool-subagent rejected the config — ${error.message}`);
  }
  if (typeof config.persona !== "string" || config.persona.length < 100) fail(`${label}: persona text is missing or suspiciously short`);
  if (config.backgroundMode !== "continuable") fail(`${label}: backgroundMode must be continuable so the PM can message it`);
  if (config.maxDepth !== 1) fail(`${label}: maxDepth must be 1 so only the root PM can start roles`);
}

// 3. Role names must not collide with each other or with the stock tools.
const names = ctx.mounts.map(mount => mount.config.toolName);
if (new Set(names).size !== names.length) fail(`duplicate tool names: ${names.join(", ")}`);
for (const name of names) {
  if (["subagent", "subagent_fork"].includes(name)) fail(`role tool "${name}" would collide with a stock tool`);
}

// 4. Config validation: a bad limit must fail loudly at load, not at run time.
try {
  crew.apply(fakeContext(), { limits: { liveAgents: 0 } });
  fail("liveAgents: 0 was accepted; it should throw");
} catch (error) {
  ok(`bad limit rejected at load: ${error.message}`);
}

// 5. A custom deny list replaces the shipped one.
const custom = fakeContext();
crew.apply(custom, { roleDeny: { engineer: ["subagent"] } });
const engineer = custom.mounts.find(mount => mount.config.toolName === "crew_engineer");
if (engineer?.config.toolFilter?.deny?.length !== 1) fail("roleDeny did not replace the shipped deny list");
else ok("roleDeny replaces the shipped deny list");

console.log(failures === 0 ? "\nall mount checks passed" : `\n${failures} mount check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
