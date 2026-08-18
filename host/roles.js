// dsh-crew role table and persona loading.
//
// A "role" here is one delegation tool (e.g. `crew_engineer`) bound to:
//   - a locked persona     -> the role's markdown file, rendered as the child's
//                             `deployment:persona` section, so the child cannot
//                             argue itself into a different job;
//   - a tool filter        -> what that role may NOT call, enforced by
//                             `tools.restrict()` inside the child.
//
// The PM is deliberately NOT in this table: the PM is your own session, and its
// rules are registered as a prompt section by crew.js. Nothing spawns a PM.

import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Role markdown files shipped with the package. */
export const SHIPPED_ROLES_DIR = join(PACKAGE_ROOT, "roles");

// Every crew child is denied the delegation tools. That is what keeps the crew
// FLAT: only the PM (your session) starts agents. It matters because dsh can
// send a message to direct children only — a grandchild would be unreachable
// from the PM, and two children can never message each other at all.
//
// Kept SHORT on purpose. dsh checks these names when the child starts, against
// what the agent's preset provides, and one name the preset does not have makes
// every crew spawn fail. Model-facing tools live in the agent preset
// (~/.dsh/.agent-presets/<preset>/agent.cordis.yml), and presets differ — so
// only names that come with delegation itself are listed here. `maxDepth: 1` is
// the guarantee that does not depend on any name at all.
//
// If your preset also provides `workflow`, `ralph`, `subagent_codex` or another
// way to start agents, add them through the `roleDeny` config.
const NO_DELEGATION = ["crew_engineer", "crew_code_reviewer", "subagent", "subagent_fork"];

// Read-only roles. `bash` is in this list because a live test proved the point:
// with only `write` and `edit` denied, a code reviewer wrote a file anyway with
// `echo hello > file`. A shell IS a file-writing tool. `read`, `glob` and `grep`
// stay, which is everything a reviewer needs to judge a change; running the
// tests is the engineer's job, and the reviewer asks the PM if it needs a
// command run.
//
// `str_replace_editor` and `pwsh` are deliberately absent: they ship disabled
// (or do not exist) in the stock profiles, so naming them here would break
// spawning. Add them through `roleDeny` if your preset turns them on.
const NO_WRITING = ["write", "edit", "bash"];

/**
 * The crew roles that exist as delegation tools.
 *
 * `deny` names must be tools your dsh profile actually registers — dsh rejects
 * an unknown name when the child starts, with a message listing the known
 * tools. Override `roleDeny` in the plugin config if your profile differs.
 */
export const ROLES = [
  {
    key: "engineer",
    toolName: "crew_engineer",
    personaFile: "engineer.md",
    // 3-5 word display description shown in the UI for the delegation tool.
    summary: "Write code for one crew task",
    deny: [...NO_DELEGATION],
  },
  {
    key: "code_reviewer",
    toolName: "crew_code_reviewer",
    personaFile: "code-reviewer.md",
    summary: "Review one crew task's code",
    deny: [...NO_DELEGATION, ...NO_WRITING],
  },
];

/** The PM rules; a prompt section rather than a role tool. */
export const PM_PERSONA_FILE = "pm.md";

/** Expand a leading `~` so config paths can be written the way people type them. */
export function expandHome(path) {
  if (path === "~") return homedir();
  if (path.startsWith("~/")) return join(homedir(), path.slice(2));
  return path;
}

/**
 * Read one role markdown file: the caller's folder first, then the copy shipped
 * in the package. This is how `~/.dsh/crew/roles/engineer.md` replaces the
 * shipped engineer role without touching the package.
 *
 * @param fileName - e.g. `engineer.md`
 * @param overrideDir - folder searched first; may be undefined or missing
 * @returns the file text, trimmed
 */
export function readRoleText(fileName, overrideDir) {
  const candidates = [];
  if (overrideDir) candidates.push(join(expandHome(overrideDir), fileName));
  candidates.push(join(SHIPPED_ROLES_DIR, fileName));

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const text = readFileSync(candidate, "utf8").trim();
    if (text.length === 0) {
      throw new Error(`dsh-crew: role file "${candidate}" is empty; delete it to fall back to the shipped role`);
    }
    // dsh interpolates `{{name}}` in prompt text against registered prompt
    // variables, and an unknown name fails the whole assembly. A role file is
    // prose, so the safe rule is: no double braces at all. Failing here names
    // the file; failing later would only say the prompt could not render.
    if (text.includes("{{")) {
      throw new Error(`dsh-crew: role file "${candidate}" contains "{{"; prompt text may not use double curly braces`);
    }
    return text;
  }

  throw new Error(`dsh-crew: role file "${fileName}" not found in ${candidates.join(" or ")}`);
}
