// T-51, DoD item 19 (CRD 0016): an empty `roleAllow` list refuses to start, and
// the message names the field and the role key.
//
// What it proves: a user writing `roleAllow: { code_reviewer: [] }` in their own
// `agent.cordis.yml` cannot silently hand a read-only reviewer the preset's whole
// tool set — `bash`, `write`, `edit` included. An empty array is not nullish, so
// `??` never reached the shipped list, and `[].length > 0` was false, so
// `toolFilter` used to be left off the config altogether. That silently undid
// CLAUDE.md design rule 2, the rule this repository paid for in two live tests,
// and the boot log said nothing.
//
// This is a one-way assertion: `host/roles-preset.js` belongs to T-51 and no
// later task may touch it, and CRD 0016 is an accepted user decision, so
// "an empty list must be refused" cannot flip after M3.
//
// It is deliberately NOT the same test as verify-mount's: that one tries the two
// pairs the DoD names. This one tries EVERY role key in the table, checks the
// message tells the user what to do instead, and checks the refusal happens
// BEFORE that role is mounted.

import { check, cleanUp, done } from "../lib/qa.mjs";
import { loadPreset, loadRoles, mountAttempt, presetCopy } from "./preset-mount.mjs";

const dir = presetCopy();
try {
  const preset = await loadPreset(dir);
  const { ROLES } = await loadRoles(dir);

  // --- the pair the DoD names, in full detail
  const reviewer = mountAttempt(preset, { roleAllow: { code_reviewer: [] } });
  check(
    "roleAllow: { code_reviewer: [] } refuses to start",
    reviewer.thrown !== undefined,
    `nothing was thrown, and ${reviewer.ctx.mounts.length} role(s) mounted — a read-only reviewer just got every tool the preset registers`,
  );
  check(
    "the refusal names the field `roleAllow`",
    reviewer.message.includes("roleAllow"),
    reviewer.message,
  );
  check(
    "the refusal names the role key `code_reviewer`",
    reviewer.message.includes("code_reviewer"),
    reviewer.message,
  );
  // DoD 19 asks for three things in the message: the field, the role key, and the
  // right way to do it. Without the third, a user who wanted "no filter" is told
  // only that they are wrong, not what to write instead — and the likeliest next
  // move is to delete the line and believe the filter is off.
  check(
    "the refusal says what to do instead (write the tool names)",
    /write the tool names/i.test(reviewer.message),
    reviewer.message,
  );
  check(
    "the refusal says the list is empty, so the user can find the line",
    /empty list/i.test(reviewer.message),
    reviewer.message,
  );
  check(
    "the reviewer is never mounted before the refusal",
    !reviewer.ctx.mounts.some((mount) => mount.config.toolName === "crew_code_reviewer"),
    "the role was mounted and only then refused — the check runs after the mount it is guarding",
  );

  // --- every other role key too: CRD 0016 says "an empty roleAllow or roleDeny
  // list", not "an empty list on these two roles". A check hard-coded to two
  // keys passes on an implementation that only guards those two.
  for (const role of ROLES) {
    const run = mountAttempt(preset, { roleAllow: { [role.key]: [] } });
    check(
      `roleAllow: { ${role.key}: [] } refuses to start, naming the key`,
      run.thrown !== undefined && run.message.includes(role.key) && run.message.includes("roleAllow"),
      run.thrown === undefined ? `mounted ${run.ctx.mounts.length} role(s) without a word` : run.message,
    );
  }

  // --- an empty list next to a good one on another role: the bad line still wins
  const mixed = mountAttempt(preset, {
    roleAllow: { code_reviewer: [] },
    roleDeny: { engineer: ["crew_engineer"] },
  });
  check(
    "an empty list is refused even when another role's override is fine",
    mixed.thrown !== undefined && mixed.message.includes("code_reviewer"),
    mixed.thrown === undefined ? "mounted anyway" : mixed.message,
  );

  // --- the same attempt twice: the refusal must not depend on state
  const first = mountAttempt(preset, { roleAllow: { code_reviewer: [] } });
  const second = mountAttempt(preset, { roleAllow: { code_reviewer: [] } });
  check(
    "the same empty list is refused on the second attempt as well",
    first.thrown !== undefined && second.thrown !== undefined && first.message === second.message,
    `first: ${first.message || "(nothing thrown)"} | second: ${second.message || "(nothing thrown)"}`,
  );
} finally {
  cleanUp(dir);
}

done();
