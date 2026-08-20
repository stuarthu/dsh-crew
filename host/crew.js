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

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_JOBS_DIR, jobsNotice } from "./jobs.js";
import { PM_PERSONA_FILE, ROLES, expandHome, readRoleText } from "./roles.js";

export const name = "dsh-crew-core";
export const inject = ["systemPrompt"];

/** Prompt order: after the deployment persona (0), before tool guidance (100+). */
const PM_SECTION_ORDER = 5;

/** Prompt section name. Registering it twice would fail loud, which is intended. */
const PM_SECTION_NAME = "crew:pm";

/** Preset id, and the folder name it takes under `.agent-presets`. */
const PRESET_ID = "crew";

/** Dynamic-context name and order for the unfinished-job notice. */
const JOBS_CONTEXT_NAME = "crew:jobs";
/** After the sandbox (110), approval (115) and delegation (120) sentences. */
const JOBS_CONTEXT_ORDER = 130;

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// `agentsPerJob` used to sit here. CRD 0003 dropped it: a job may use as many
// crew agents as the work needs, and 4 awake at once left tasks with no shared
// files queueing for no reason. See legacyLimitNote for the profiles that still
// carry the old setting.
const DEFAULT_LIMITS = { liveAgents: 20, reviewRounds: 3 };

/** Read a positive whole number from config, falling back to the default. */
function limitOf(configured, fallback, field) {
  if (configured === undefined) return fallback;
  if (!Number.isSafeInteger(configured) || configured < 1) {
    throw new Error(`dsh-crew: limits.${field} must be a whole number of 1 or more (got ${JSON.stringify(configured)})`);
  }
  return configured;
}

/**
 * A boot-log line for a setting this version removed, or `undefined` when the
 * profile names none.
 *
 * `limits.agentsPerJob` went away with CRD 0003. A profile written before that
 * still carries it, and the value is not WRONG the way `liveAgents: 0` is wrong
 * — `limitOf` throws for a value written wrong, but here the setting itself is
 * gone. Stopping somebody's dsh session from starting over a line that used to
 * be legal costs far more than it is worth, so the mount goes on and only says
 * this once.
 *
 * @param limits - the `limits` object from the plugin config, if any
 */
function legacyLimitNote(limits) {
  if (limits?.agentsPerJob === undefined) return undefined;
  return "dsh-crew: limits.agentsPerJob is no longer used — there is no cap any more on how many crew agents one job may use."
    + " Ignoring it; you can delete that line from your profile.";
}

/**
 * Say one line in the boot log, exactly once.
 *
 * Every boot-log line in this file goes through here, and that is the point.
 * The call sites used to hand the note to the logger and then add a fallback to
 * the console after a `??`, which said each note TWICE on a real host: a
 * logger's `info()` returns nothing, and `??` reads "nothing" as "that did not
 * happen". A user mounting the plugin saw the same sentence in the boot log two
 * times. One helper, so a new call site cannot bring that idiom back.
 *
 * A deployment may give us no logger at all, something that is not a function,
 * a logger that hands back nothing, or one with no `info` — all four end up on
 * `console.log`, once.
 *
 * @param ctx - the Cordis context
 * @param note - the line to say
 */
function bootLog(ctx, note) {
  const logger = typeof ctx?.logger === "function" ? ctx.logger("dsh-crew") : undefined;
  if (typeof logger?.info === "function") logger.info(note);
  else console.log(note);
}

/** Stamp file recording which version of this package wrote the preset folder. */
const STAMP_FILE = ".installed-by-dsh-crew";

/**
 * The installed files that differ from the copy this package shipped — in other
 * words, the user's own edits.
 *
 * This matters because role tool filters and per-role models are configured
 * INSIDE the installed preset (`agent.cordis.yml`), which the upgrade below
 * deletes and rewrites. Without this, a version bump would throw those settings
 * away without a word.
 *
 * @param target - the installed preset folder
 * @param source - the copy shipped in this package
 * @param prefix - sub-path, used when walking folders
 * @returns pairs of [path relative to the folder, file contents]
 */
function editedFiles(target, source, prefix = "") {
  const edits = [];
  let entries;
  try {
    entries = readdirSync(join(target, prefix), { withFileTypes: true });
  } catch {
    return edits; // unreadable: nothing we can save, and not worth failing boot
  }
  for (const entry of entries) {
    const rel = prefix ? join(prefix, entry.name) : entry.name;
    if (rel === STAMP_FILE) continue; // ours, and rewritten every time
    if (entry.isDirectory()) {
      edits.push(...editedFiles(target, source, rel));
      continue;
    }
    if (!entry.isFile()) continue;
    let mine;
    try {
      mine = readFileSync(join(target, rel), "utf8");
    } catch {
      continue; // binary or unreadable; the shipped preset holds neither
    }
    let shipped;
    try {
      shipped = readFileSync(join(source, rel), "utf8");
    } catch {
      shipped = undefined; // a file the user added
    }
    if (mine !== shipped) edits.push([rel, mine]);
  }
  return edits;
}

/**
 * Copy the shipped `crew` preset into the harness home so dsh's preset roster
 * finds it. Idempotent: a stamp file records which version wrote the folder, so
 * an unchanged version copies nothing and an upgrade refreshes it.
 *
 * An upgrade REPLACES the folder, so any file the user edited is first read and
 * then written back beside the new one as `<name>.bak`, and named in the boot
 * log. Losing someone's `roleAllow` list silently would be much worse than
 * leaving a file they have to look at.
 *
 * Only a folder this plugin wrote is ever replaced. A `crew` preset that
 * someone else authored is left exactly as it is, and reported.
 *
 * @param version - this package's version, written into the stamp
 * @returns lines describing what happened, for the boot log
 */
function installPreset(version) {
  const home = process.env.DSH_HOME ?? expandHome("~/.dsh");
  const target = join(home, ".agent-presets", PRESET_ID);
  const stamp = join(target, STAMP_FILE);
  const source = join(PACKAGE_ROOT, "preset", PRESET_ID);

  if (!existsSync(source)) throw new Error(`dsh-crew: shipped preset missing at ${source}`);

  let edits = [];
  if (existsSync(target)) {
    if (!existsSync(stamp)) return `dsh-crew: left the existing "${PRESET_ID}" preset alone (not written by dsh-crew)`;
    if (readFileSync(stamp, "utf8").trim() === version) return undefined; // already current
    edits = editedFiles(target, source);
    rmSync(target, { recursive: true, force: true });
  }

  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
  writeFileSync(stamp, `${version}\n`);

  const lines = [`dsh-crew: installed the "${PRESET_ID}" agent preset (${version})`];
  const kept = [];
  for (const [rel, contents] of edits) {
    const backup = join(target, `${rel}.bak`);
    try {
      mkdirSync(dirname(backup), { recursive: true });
      writeFileSync(backup, contents);
      kept.push(`${rel}.bak`);
    } catch {
      lines.push(`dsh-crew: WARNING — could not keep a copy of your edited ${rel}; the upgrade replaced it.`);
    }
  }
  if (kept.length > 0) {
    lines.push(
      `dsh-crew: the upgrade replaced files you had edited. Your versions are kept as ${kept.join(", ")} in ${target}.`,
      "dsh-crew: settings there do NOT carry over by themselves — re-apply your roleAllow / roleDeny / roleModels changes to the new agent.cordis.yml.",
    );
  }
  return lines.join("\n");
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
    `- review rounds before you bring the disagreement to the user: ${limits.reviewRounds}`,
    "",
    "If the user says \"stop\", kill every crew agent you started (`interrupt_agent`, then `job_kill` for anything still running) and say what was left unfinished.",
    "",
    // Derived from the role table so this line cannot drift from what is really
    // registered — a promise of a role that does not exist is the worst kind.
    `The crew is: a PM (you) plus ${ROLES.map(role => role.key.replace(/_/g, " ")).join(", ")}. Nothing else exists. Do not report work by a role that never ran.`,
    // Pushing and CI are the PM's OWN steps (roles/pm.md step 16), not a role's.
    // This line used to say they did not exist, which was true in 0.3 and became
    // a contradiction in 0.4 — the PM was told to skip a step its own rules told
    // it to run. Anything named here must match roles/pm.md.
    "Pushing the work branch and watching CI are your own steps, not a role's. Run them yourself, and ask the user before every push. The guard trusts your root session, so you may push any branch or tag once the user says yes; children stay guarded.",
  ].join("\n");
}

export function apply(ctx, config) {
  const rolesDir = config?.rolesDir;
  const limits = {
    liveAgents: limitOf(config?.limits?.liveAgents, DEFAULT_LIMITS.liveAgents, "liveAgents"),
    reviewRounds: limitOf(config?.limits?.reviewRounds, DEFAULT_LIMITS.reviewRounds, "reviewRounds"),
  };

  // Read every role file at load time, including the ones the preset mounts: a
  // broken role file must break startup here, with a file name, rather than
  // when someone finally starts that role.
  const pmText = readRoleText(PM_PERSONA_FILE, rolesDir);
  for (const role of ROLES) readRoleText(role.personaFile, rolesDir);

  // Same boot-log path as the preset installer below. Said whether or not the
  // preset is installed, so an upgraded profile hears about the setting once.
  const legacyNote = legacyLimitNote(config?.limits);
  if (legacyNote !== undefined) bootLog(ctx, legacyNote);

  if (config?.installPreset !== false) {
    const { version } = JSON.parse(readFileSync(join(PACKAGE_ROOT, "package.json"), "utf8"));
    const note = installPreset(version);
    if (note !== undefined) bootLog(ctx, note);
  }

  ctx.effect(() => ctx.systemPrompt.section({
    name: PM_SECTION_NAME,
    order: PM_SECTION_ORDER,
    text: `${pmText}\n\n${runtimeFactsSection(limits)}`,
  }), "dsh-crew: PM prompt section");

  // Unfinished work is pushed at the PM, not left for it to remember. Evaluated
  // per assembly, so a job that finishes stops being mentioned, and a machine
  // with no unfinished job contributes no text at all.
  if (config?.resumeNotice !== false) {
    const jobsDir = config?.jobsDir ?? DEFAULT_JOBS_DIR;
    ctx.effect(() => ctx.systemPrompt.context({
      name: JOBS_CONTEXT_NAME,
      order: JOBS_CONTEXT_ORDER,
      text: () => {
        try {
          return jobsNotice(jobsDir);
        } catch {
          // A prompt must never fail to assemble because a job file is odd.
          return "";
        }
      },
    }), "dsh-crew: unfinished-job notice");
  }
}
