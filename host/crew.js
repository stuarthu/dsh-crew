// dsh-crew core plugin (host side).
//
// Does exactly two things:
//
//   1. Registers the PM rules as a system-prompt section, so YOUR session is
//      the product manager in every conversation. The PM is the only role that
//      talks to you.
//
//   2. Mounts one `@deepseek-ai/dsh-tool-subagent` instance per crew role, each
//      carrying that role's persona and tool filter. That is what makes a role
//      real: a `crew_code_reviewer` child cannot call `write` or `edit`, and no
//      crew child can start further agents.
//
// Why the crew is flat (every role a direct child of the PM): dsh can deliver a
// message to direct children only, a child answers its direct parent only, and
// two children cannot talk to each other at all. A deeper tree would put the
// engineers out of the PM's reach. Peers share work through files on disk.

import * as toolSubagent from "@deepseek-ai/dsh-tool-subagent";

import { PM_PERSONA_FILE, ROLES, readRoleText } from "./roles.js";

export const name = "dsh-crew-core";
export const inject = ["systemPrompt"];

/** Prompt order: after the deployment persona (0), before tool guidance (100+). */
const PM_SECTION_ORDER = 5;

/** Prompt section name. Registering it twice would fail loud, which is intended. */
const PM_SECTION_NAME = "crew:pm";

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
 * The facts the PM must know that live in config, not in prose: the limits it
 * may not cross without asking, and the exact tools it has for each role.
 * Kept out of pm.md so a user-edited role file cannot drift from the real
 * registered tool names.
 */
function runtimeFactsSection(limits) {
  const roleLines = ROLES.map(role => `- \`${role.toolName}\` — start a ${role.key.replace(/_/g, " ")} (${role.summary}).`);
  return [
    "## Your crew tools and limits (from the plugin config — these are facts, not suggestions)",
    "",
    ...roleLines,
    "- `send_message` — give more work to one crew child you started. It becomes that child's next turn; it cannot cut into a turn already running.",
    "- `interrupt_agent` — stop a child's current turn. Use it only when a document change breaks the work that child is doing right now.",
    "- `list_agents` — see which crew children you started and whether they are running, idle or resumable.",
    "",
    `Limits you must respect. Stop and ask the user before going over any of them:`,
    `- crew agents awake at the same time: ${limits.liveAgents}`,
    `- crew agents for one job in total: ${limits.agentsPerJob}`,
    `- review rounds before you bring the disagreement to the user: ${limits.reviewRounds}`,
    "",
    "If the user says \"stop\", kill every crew agent you started (`interrupt_agent`, then `job_kill` for anything still running) and say what was left unfinished.",
    "",
    "This version of dsh-crew ships the PM, the engineer and the code reviewer only. There is no architect, doc reviewer, QA, researcher or security reviewer yet, and no push or CI step. Do not pretend those roles ran.",
  ].join("\n");
}

export function apply(ctx, config) {
  const rolesDir = config?.rolesDir;
  const limits = {
    liveAgents: limitOf(config?.limits?.liveAgents, DEFAULT_LIMITS.liveAgents, "liveAgents"),
    agentsPerJob: limitOf(config?.limits?.agentsPerJob, DEFAULT_LIMITS.agentsPerJob, "agentsPerJob"),
    reviewRounds: limitOf(config?.limits?.reviewRounds, DEFAULT_LIMITS.reviewRounds, "reviewRounds"),
  };

  // Read every role file at load time. A missing or broken role file must break
  // startup with a clear message, not surface halfway through a job.
  const pmText = readRoleText(PM_PERSONA_FILE, rolesDir);
  const rolePersonas = new Map(ROLES.map(role => [role.key, readRoleText(role.personaFile, rolesDir)]));

  ctx.effect(() => ctx.systemPrompt.section({
    name: PM_SECTION_NAME,
    order: PM_SECTION_ORDER,
    text: `${pmText}\n\n${runtimeFactsSection(limits)}`,
  }), "dsh-crew: PM prompt section");

  for (const role of ROLES) {
    // `roleDeny` replaces (not extends) the shipped deny list, so a profile
    // missing one of those tools can be fixed without editing the package.
    const deny = config?.roleDeny?.[role.key] ?? role.deny;
    const model = config?.roleModels?.[role.key];

    ctx.plugin(toolSubagent, {
      provider: "spawn",
      toolName: role.toolName,
      // Continuable children can be messaged again (`send_message`) and can
      // answer their parent (`report`) — the two channels the crew runs on.
      backgroundMode: "continuable",
      persona: rolePersonas.get(role.key),
      ...deny.length > 0 ? { toolFilter: { deny } } : {},
      // Second, independent guard on the flat tree: a caller that is already a
      // child (depth 1 or deeper) cannot start a crew role at all.
      maxDepth: 1,
      ...model?.model ? { agentOptions: { ...model.provider ? { provider: model.provider } : {}, model: model.model } } : {},
    });
  }
}
