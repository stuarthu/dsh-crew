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
