// dsh-crew core plugin (HOST plane).
//
// Two jobs, both of which belong outside any agent preset:
//
//   1. Register the PM rules as a system-prompt section, so YOUR session is the
//      product manager in every conversation, whichever preset it runs. The PM
//      is the only role that talks to you, and its rules need no tools.
//
//   2. Install the `crew` agent preset into $DSH_HOME/.agent-presets, so dsh
//      can offer it. The role TOOLS live in that preset (host/roles-preset.js),
//      not here — see that file for why.
//
// Why the crew is flat (every role a direct child of the PM): dsh delivers a
// message to direct children only, a child answers only its direct parent, and
// two children cannot talk to each other at all. A deeper tree would put the
// engineers out of the PM's reach. Peers share work through files on disk.

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PM_PERSONA_FILE, ROLES, expandHome, readRoleText } from "./roles.js";

export const name = "dsh-crew-core";
export const inject = ["systemPrompt"];

/** Prompt order: after the deployment persona (0), before tool guidance (100+). */
const PM_SECTION_ORDER = 5;

/** Prompt section name. Registering it twice would fail loud, which is intended. */
const PM_SECTION_NAME = "crew:pm";

/** Preset id, and the folder name it takes under `.agent-presets`. */
const PRESET_ID = "crew";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_LIMITS = { liveAgents: 4, agentsPerJob: 20, reviewRounds: 3 };

/** Read a positive whole number from config, falling back to the default. */
function limitOf(configured, fallback, field) {
  if (configured === undefined) return fallback;
  if (!Number.isSafeInteger(configured) || configured < 1) {
    throw new Error(`dsh-crew: limits.${field} must be a whole number of 1 or more (got ${JSON.stringify(configured)})`);
  }
  return configured;
}

/**
 * Copy the shipped `crew` preset into the harness home so dsh's preset roster
 * finds it. Idempotent: a stamp file records which version wrote the folder, so
 * an unchanged version copies nothing and an upgrade refreshes it.
 *
 * Only a folder this plugin wrote is ever replaced. A `crew` preset that
 * someone else authored is left exactly as it is, and reported.
 *
 * @param version - this package's version, written into the stamp
 * @returns a line describing what happened, for the boot log
 */
function installPreset(version) {
  const home = process.env.DSH_HOME ?? expandHome("~/.dsh");
  const target = join(home, ".agent-presets", PRESET_ID);
  const stamp = join(target, ".installed-by-dsh-crew");
  const source = join(PACKAGE_ROOT, "preset", PRESET_ID);

  if (!existsSync(source)) throw new Error(`dsh-crew: shipped preset missing at ${source}`);

  if (existsSync(target)) {
    if (!existsSync(stamp)) return `dsh-crew: left the existing "${PRESET_ID}" preset alone (not written by dsh-crew)`;
    if (readFileSync(stamp, "utf8").trim() === version) return undefined; // already current
    rmSync(target, { recursive: true, force: true });
  }

  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
  writeFileSync(stamp, `${version}\n`);
  return `dsh-crew: installed the "${PRESET_ID}" agent preset (${version})`;
}

/**
 * The facts the PM must know that live in code, not in prose: which preset
 * carries the roles, what the limits are, and the exact tool names. Kept out of
 * pm.md so a user-edited role file cannot drift from what is really registered.
 */
function runtimeFactsSection(limits) {
  const roleLines = ROLES.map(role => `- \`${role.toolName}\` — ${role.summary}.`
    + (role.allow ? ` It can ONLY call ${role.allow.map(toolName => `\`${toolName}\``).join(", ")}, so run any command it needs yourself and give it the output.` : ""));

  return [
    "## Your crew tools and limits (facts from the plugin, not suggestions)",
    "",
    "The crew role tools live in the `crew` agent preset. **Check your own tool list before you promise a crew.**",
    "",
    "- If your tools include names starting with `crew_`, this session runs the crew preset and the whole flow below is available.",
    "- If they do not, this session runs another preset. Say so plainly in the `team` lane and offer the user two choices: start a new session on the `crew` preset, or let you do the work yourself as a single agent. Then do what they choose. The `ask` and `quick` lanes work either way.",
    "",
    ...roleLines,
    "- `send_message` — give more work to one crew child you started. It becomes that child's next turn; it cannot cut into a turn already running.",
    "- `interrupt_agent` — stop a child's current turn. Use it only when a document change breaks the work that child is doing right now.",
    "- `list_agents` — see which crew children you started and whether they are running, idle or resumable.",
    "",
    "Limits you must respect. Stop and ask the user before going over any of them:",
    `- crew agents awake at the same time: ${limits.liveAgents}`,
    `- crew agents for one job in total: ${limits.agentsPerJob}`,
    `- review rounds before you bring the disagreement to the user: ${limits.reviewRounds}`,
    "",
    "If the user says \"stop\", kill every crew agent you started (`interrupt_agent`, then `job_kill` for anything still running) and say what was left unfinished.",
    "",
    // Derived from the role table so this line cannot drift from what is really
    // registered — a promise of a role that does not exist is the worst kind.
    `The crew is: a PM (you) plus ${ROLES.map(role => role.key.replace(/_/g, " ")).join(", ")}. Nothing else exists. There is no push step and no CI step yet. Do not report work by a role that never ran.`,
  ].join("\n");
}

export function apply(ctx, config) {
  const rolesDir = config?.rolesDir;
  const limits = {
    liveAgents: limitOf(config?.limits?.liveAgents, DEFAULT_LIMITS.liveAgents, "liveAgents"),
    agentsPerJob: limitOf(config?.limits?.agentsPerJob, DEFAULT_LIMITS.agentsPerJob, "agentsPerJob"),
    reviewRounds: limitOf(config?.limits?.reviewRounds, DEFAULT_LIMITS.reviewRounds, "reviewRounds"),
  };

  // Read every role file at load time, including the ones the preset mounts: a
  // broken role file must break startup here, with a file name, rather than
  // when someone finally starts that role.
  const pmText = readRoleText(PM_PERSONA_FILE, rolesDir);
  for (const role of ROLES) readRoleText(role.personaFile, rolesDir);

  if (config?.installPreset !== false) {
    const { version } = JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8"));
    const note = installPreset(version);
    if (note !== undefined) ctx.logger?.("dsh-crew")?.info?.(note) ?? console.log(note);
  }

  ctx.effect(() => ctx.systemPrompt.section({
    name: PM_SECTION_NAME,
    order: PM_SECTION_ORDER,
    text: `${pmText}\n\n${runtimeFactsSection(limits)}`,
  }), "dsh-crew: PM prompt section");
}
