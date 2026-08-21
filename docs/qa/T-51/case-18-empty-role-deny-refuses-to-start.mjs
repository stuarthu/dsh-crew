// T-51, DoD item 19 (CRD 0016): an empty `roleDeny` list refuses to start too,
// and the message names the field and the role key.
//
// What it proves: the other half of the same trap. `roleDeny: { engineer: [] }`
// used to mean "this maker role has no deny list", so it kept every `crew_*`
// tool — and a role that can start a role puts a grandchild out of the PM's
// reach for ever (CLAUDE.md design rule 1). The two fields are two separate
// lines of code in `host/roles-preset.js`, so guarding one is not guarding both.
//
// One-way, same reason as case-17: that file is T-51's and no later task may
// touch it.
//
// Beyond verify-mount's own pair: every role key, both fields empty at once, and
// the field named in the message must be the one the user actually wrote.

import { check, cleanUp, done } from "../lib/qa.mjs";
import { loadPreset, loadRoles, mountAttempt, presetCopy } from "./preset-mount.mjs";

const dir = presetCopy();
try {
  const preset = await loadPreset(dir);
  const { ROLES } = await loadRoles(dir);

  // --- the pair the DoD names
  const engineer = mountAttempt(preset, { roleDeny: { engineer: [] } });
  check(
    "roleDeny: { engineer: [] } refuses to start",
    engineer.thrown !== undefined,
    `nothing was thrown, and ${engineer.ctx.mounts.length} role(s) mounted — that engineer kept every crew_* tool`,
  );
  check(
    "the refusal names the field `roleDeny`",
    engineer.message.includes("roleDeny"),
    engineer.message,
  );
  check(
    "the refusal names the role key `engineer`",
    engineer.message.includes("engineer"),
    engineer.message,
  );
  check(
    "the refusal says what to do instead (write the tool names)",
    /write the tool names/i.test(engineer.message),
    engineer.message,
  );
  // The message must not name the field the user did NOT write: a message saying
  // `roleAllow` sends the reader to a line that is not in their file.
  check(
    "the refusal does not blame `roleAllow` for a `roleDeny` line",
    !engineer.message.includes("roleAllow"),
    engineer.message,
  );
  check(
    "the engineer is never mounted before the refusal",
    !engineer.ctx.mounts.some((mount) => mount.config.toolName === "crew_engineer"),
    "the role was mounted and only then refused",
  );

  // --- every role key, not just the one the DoD names
  for (const role of ROLES) {
    const run = mountAttempt(preset, { roleDeny: { [role.key]: [] } });
    check(
      `roleDeny: { ${role.key}: [] } refuses to start, naming the key`,
      run.thrown !== undefined && run.message.includes(role.key) && run.message.includes("roleDeny"),
      run.thrown === undefined ? `mounted ${run.ctx.mounts.length} role(s) without a word` : run.message,
    );
  }

  // --- both fields empty on the same role: still refused, and it names a field
  const both = mountAttempt(preset, { roleAllow: { qa: [] }, roleDeny: { qa: [] } });
  check(
    "both fields empty on one role is refused, naming the role and a field",
    both.thrown !== undefined
      && both.message.includes("qa")
      && (both.message.includes("roleAllow") || both.message.includes("roleDeny")),
    both.thrown === undefined ? `mounted ${both.ctx.mounts.length} role(s) without a word` : both.message,
  );

  // --- an empty list plus an unrelated legal setting: the empty list still wins
  const withModel = mountAttempt(preset, {
    roleDeny: { engineer: [] },
    roleModels: { qa: { model: "some-model" } },
  });
  check(
    "an empty list is refused even when roleModels is set as well",
    withModel.thrown !== undefined && withModel.message.includes("engineer"),
    withModel.thrown === undefined ? "mounted anyway" : withModel.message,
  );

  // --- twice in a row, same answer
  const first = mountAttempt(preset, { roleDeny: { engineer: [] } });
  const second = mountAttempt(preset, { roleDeny: { engineer: [] } });
  check(
    "the same empty list is refused on the second attempt as well",
    first.thrown !== undefined && second.thrown !== undefined && first.message === second.message,
    `first: ${first.message || "(nothing thrown)"} | second: ${second.message || "(nothing thrown)"}`,
  );
} finally {
  cleanUp(dir);
}

done();
