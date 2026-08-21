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

/** Every crew role tool name; the deny lists are built from this. */
export const ROLE_TOOL_NAMES = [
  "crew_researcher",
  "crew_architect",
  "crew_engineer",
  "crew_test_engineer",
  "crew_code_engineer",
  "crew_qa",
  "crew_code_reviewer",
  "crew_security_reviewer",
  "crew_doc_reviewer",
];

/** Tools a read-only role may call: enough to read a repository, nothing more. */
const READ_ONLY = ["read", "glob", "grep"];

// Every crew child is denied the crew tools. That is what keeps the crew FLAT:
// only the PM (your session) starts agents. It matters because dsh can send a
// message to direct children only — a grandchild would be unreachable from the
// PM, and two children can never message each other at all.
//
// The list names ONLY crew tools, and that is deliberate. dsh checks these
// names when the child starts, against what the agent's preset provides, and a
// name the preset does not have fails every spawn. The `crew` preset shipped in
// `preset/crew` has no other way to start an agent — no `subagent`,
// `subagent_fork`, `workflow` or `ralph` — so there is nothing else to name.
// `maxDepth: 1` guards the same rule without depending on any name at all.
const NO_DELEGATION = [...ROLE_TOOL_NAMES];

// Why the reviewer uses an allow list instead: two live tests. With only
// `write` and `edit` denied it wrote a file with `echo hello > file` — a shell
// is a file-writing tool. With `bash` denied too, its own tool report still
// listed `workflow`, `ralph` and desktop-control MCP tools. A deny list cannot
// name what a deployment has not added yet; an allow list does not have to.

/**
 * The crew roles that exist as delegation tools.
 *
 * `deny` names must be tools your dsh profile actually registers — dsh rejects
 * an unknown name when the child starts, with a message listing the known
 * tools. Override `roleDeny` in the plugin config if your profile differs.
 */
export const ROLES = [
  {
    key: "researcher",
    toolName: "crew_researcher",
    personaFile: "researcher.md",
    summary: "Find the facts a decision needs",
    // Reads anything, writes its findings, searches the web — and has no shell,
    // so it cannot run or change the project while it is looking around. The PM
    // runs any command it asks for.
    allow: [...READ_ONLY, "write", "web_search"],
  },
  {
    key: "architect",
    toolName: "crew_architect",
    personaFile: "architect.md",
    summary: "Design the work and split it into tasks",
    // The architect writes design documents, so it needs the writing tools; it
    // must not start agents, and it must not touch code.
    deny: [...NO_DELEGATION],
  },
  {
    key: "engineer",
    toolName: "crew_engineer",
    personaFile: "engineer.md",
    // A short line shown in the PM's own prompt (host/crew.js:214) — it is not
    // passed to the tool schema. It names the shape, not just the job: in that
    // prompt this line sits two lines above `crew_code_engineer`'s, and "write
    // the code for a task" would read as the same offer twice, while the
    // difference is the whole point — this role writes a task's tests AND its
    // code, alone.
    summary: "Write one task's code and its tests (solo shape)",
    // Deny list: an engineer needs most of the tool set, so naming what it may
    // NOT have is the only workable shape here.
    deny: [...NO_DELEGATION],
  },
  {
    key: "test_engineer",
    toolName: "crew_test_engineer",
    personaFile: "test-engineer.md",
    // Says both halves of what makes this role different from `crew_engineer`
    // and from `crew_qa`: what it writes (unit tests, in the project's own test
    // suite) and when (before the code exists). The PM's own prompt is built
    // from these lines, so a summary that could be read as "QA" is a role the PM
    // will call for the wrong job.
    summary: "Write a task's unit tests before its code",
    // Deny list, and built from NO_DELEGATION like every other maker — never a
    // hand-written copy of the names. A copy would keep exactly the names it was
    // typed with, so the next role added to ROLE_TOOL_NAMES would be missing
    // from it, and this role could start that one.
    deny: [...NO_DELEGATION],
  },
  {
    key: "code_engineer",
    toolName: "crew_code_engineer",
    personaFile: "code-engineer.md",
    // The other half of the pair: product code only. It never writes the unit
    // tests for the behaviour it is building — that is the whole point of
    // splitting the task in two.
    summary: "Write the product code for one task",
    // Deny list from NO_DELEGATION, for the reason given on the role above.
    deny: [...NO_DELEGATION],
  },
  {
    key: "qa",
    toolName: "crew_qa",
    personaFile: "qa.md",
    // Naming the folder is what separates this role from the test engineer now
    // that both write checks: QA's cases stay in `docs/qa/<task-id>/`, the test
    // engineer's unit tests live in the project's own test suite. Only the
    // summary changed here — none of QA's behaviour did.
    summary: "Test the result, with cases in docs/qa/",
    // QA must actually run the software, so it keeps the shell. It writes only
    // its own test plan and defect notes; the PM's commit step catches any file
    // it touched that no task owns.
    deny: [...NO_DELEGATION],
  },
  {
    key: "code_reviewer",
    toolName: "crew_code_reviewer",
    personaFile: "code-reviewer.md",
    summary: "Review one crew task's code",
    // ALLOW list, not a deny list. A live test showed why: the same session also
    // handed the reviewer `workflow`, `ralph` and a set of desktop-control MCP
    // tools, and a deny list can never name everything a deployment might add.
    // Allowing three read tools closes all of it at once, and keeps closing it
    // when a preset gains new tools tomorrow.
    //
    // `report` is not listed because it does not need to be: dsh installs it
    // per child and it survives the filter, so the reviewer can still answer
    // the PM.
    allow: [...READ_ONLY],
  },
  {
    key: "security_reviewer",
    toolName: "crew_security_reviewer",
    personaFile: "security-reviewer.md",
    summary: "Check one change for security holes",
    // Read-only for the same reason as any reviewer — and pointedly so here: a
    // role that hunts for dangerous code should not be able to run it.
    allow: [...READ_ONLY],
  },
  {
    key: "doc_reviewer",
    toolName: "crew_doc_reviewer",
    personaFile: "doc-reviewer.md",
    summary: "Review the crew's documents",
    // Same read-only shape as the code reviewer, and for the same reason: a
    // reviewer that can edit the thing it judges is not a reviewer.
    allow: [...READ_ONLY],
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
