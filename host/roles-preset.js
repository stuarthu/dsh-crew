// dsh-crew role tools (AGENT plane).
//
// Loaded by the `crew` agent preset, not by the profile. That placement is the
// whole point: model-facing tools in dsh live in the agent preset, and a role's
// allow/deny list is checked against the preset's tool set when a child starts.
// Mounted here, every name a role filter uses is defined a few lines away in
// the same preset file, so a spawn cannot fail on a name the deployment happens
// not to have.
//
// Each role becomes one `@deepseek-ai/dsh-tool-subagent` instance carrying:
//   - its persona   -> roles/<role>.md, rendered as the child's own
//                      `deployment:persona`, so the child cannot talk itself
//                      into another job;
//   - its filter    -> `allow` (reviewers: read only) or `deny` (makers: no
//                      crew tools), enforced by `tools.restrict()`;
//   - `maxDepth: 1` -> only the root PM can start a role, whatever the filter
//                      says. This is the guarantee that names no tool at all.

import * as toolSubagent from "@deepseek-ai/dsh-tool-subagent";

import { ROLES, readRoleText } from "./roles.js";

export const name = "dsh-crew-roles";

export function apply(ctx, config) {
  const rolesDir = config?.rolesDir;

  // ── One validation pass, before anything mounts (CRD 0016) ────────────────
  //
  // A tool filter a user gave us has to name at least one tool. Anything else is
  // refused here, and the refusal happens in a pass of its own so a bad config
  // gives NO crew rather than half a crew: the roles that come before the bad
  // one in the table would otherwise already be mounted, and a host that logs an
  // apply error and carries on would be left with part of a crew and no filter
  // problem in sight.
  //
  // What is refused, and why it is not only `[]`: every one of `[]`, `""`, `0`,
  // `false` and `{}` failed the old `length > 0` test, so the filter half was
  // dropped — and when it was the only half, `toolFilter` was left off the config
  // altogether and that child got every tool this preset registers. Someone who
  // writes `roleAllow: security_reviewer: ""` in YAML has written an empty
  // roleAllow as far as they are concerned, so refusing the array alone left the
  // same trap open in four other spellings. A non-empty value that is not a list
  // (a bare `read`) is refused too: it used to be handed straight to the tool as
  // a filter, and the child then failed its own config schema.
  //
  // On a reviewer any of this silently undid the read-only rule, and that rule is
  // not a preference: a reviewer with `write` and `edit` denied still wrote a
  // file with `echo hello > file`, and with the shell denied too its tool list
  // still held `workflow`, `ralph` and desktop-control MCP tools.
  //
  // `undefined` and `null` are the exception, deliberately: a missing key, or `~`
  // or a blank value in YAML, is how a user turns an override off and asks for
  // the shipped list. `??` below does exactly that, so this pass leaves it alone.
  //
  // Falling back to the shipped list on a bad value would be wrong in the other
  // direction — the user would believe their own line is in force while a
  // different list runs. So this throws, like readRoleText further down: break
  // startup with a message that names the line to fix, instead of surfacing
  // halfway through somebody's job.
  for (const role of ROLES) {
    for (const field of ["roleAllow", "roleDeny"]) {
      const configured = config?.[field]?.[role.key];
      if (configured === undefined || configured === null) continue;
      if (Array.isArray(configured) && configured.length > 0) continue;

      // Each half of the message has to be true of THIS role and THIS value, so
      // both are worked out rather than described in general terms. Three things
      // decide it: whether the value would have reached the filter at all (the
      // same `?.length > 0` test the mount below uses), whether the user wrote
      // the field this role actually ships, and whether an allow list is what
      // closes this role down. Only three of the nine roles are read-only
      // reviewers, and the researcher ships an allow list but keeps `write`.
      const shipped = field === "roleAllow" ? role.allow : role.deny;
      const reachedTheFilter = configured?.length > 0;
      const opened = role.allow === undefined ? "" : `, and this role ships an allow list, so everything it does not name would be open again${role.key.includes("review") ? " — that list is the only thing keeping a reviewer read-only" : ""}`;
      const consequence = reachedTheFilter
        ? `a value that is not a list would be handed to ${role.toolName} as its tool filter, and tool-subagent's config schema would reject it — \`allow\` and \`deny\` must be lists of strings — so that role would never work at all`
        : shipped === undefined
          ? `this role does not ship a ${field} list, so an empty one would be dropped without a word while the list it does ship stayed in force — the line would look applied and do nothing`
          : `it would leave ${role.toolName} with no tool filter at all, so that child would get every tool this preset registers${opened}`;

      throw new Error(`dsh-crew: ${field}.${role.key} is ${Array.isArray(configured) ? "an empty list" : "not a list of tool names"} (${JSON.stringify(configured) ?? String(configured)}), and dsh-crew will not start with it. A tool filter has to name at least one tool: ${consequence}. Write the tool names you want instead (${field} REPLACES the shipped list for that role, it is not added to it), or delete the ${field}.${role.key} line — or set it to nothing at all, a bare ~ in YAML — to keep the shipped list.`);
    }
  }

  for (const role of ROLES) {
    // A role ships either an allow list (everything else is closed) or a deny
    // list. `roleAllow` / `roleDeny` replace the shipped list for that role.
    const allow = config?.roleAllow?.[role.key] ?? role.allow;
    const deny = config?.roleDeny?.[role.key] ?? role.deny;
    const filter = {
      ...allow?.length > 0 ? { allow } : {},
      ...deny?.length > 0 ? { deny } : {},
    };
    const model = config?.roleModels?.[role.key];

    ctx.plugin(toolSubagent, {
      provider: "spawn",
      toolName: role.toolName,
      // Continuable children can be messaged again (`send_message`) and can
      // answer their parent (`report`) — the two channels the crew runs on.
      backgroundMode: "continuable",
      // Read at mount: a missing or broken role file must break startup with a
      // clear message, not surface halfway through a job.
      persona: readRoleText(role.personaFile, rolesDir),
      ...Object.keys(filter).length > 0 ? { toolFilter: filter } : {},
      maxDepth: 1,
      ...model?.model ? { agentOptions: { ...model.provider ? { provider: model.provider } : {}, model: model.model } } : {},
    });
  }
}
