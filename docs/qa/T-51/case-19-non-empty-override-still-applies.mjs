// T-51, DoD item 19 (CRD 0016), the other half: with no empty list anywhere the
// mount still works exactly as before, and a NON-empty override still replaces
// the shipped list.
//
// What it proves: the new refusal did not cost anything. The cheapest way to get
// case-17 and case-18 green is to refuse too much — a validation that also
// rejects a legal override, or that drops `toolFilter` for everyone, would look
// like a fix and would break every user's config instead. CRD 0016's own words:
// do not silently fall back to the shipped list, do not silently drop the filter.
//
// It also pins the property the whole CRD exists for: after a successful mount
// EVERY role carries a `toolFilter`. "No filter" is what an empty list used to
// mean, and no config may produce it.

import { check, cleanUp, done } from "../lib/qa.mjs";
import { loadPreset, loadRoles, mountAttempt, presetCopy } from "./preset-mount.mjs";

const dir = presetCopy();
try {
  const preset = await loadPreset(dir);
  const { ROLES } = await loadRoles(dir);

  // --- (a) no roleAllow / roleDeny at all
  const plain = mountAttempt(preset, {});
  check(
    "mounting with no override still succeeds",
    plain.thrown === undefined,
    plain.message,
  );
  check(
    `all ${ROLES.length} roles are mounted`,
    plain.ctx.mounts.length === ROLES.length,
    `mounted ${plain.ctx.mounts.length}: ${plain.ctx.mounts.map((mount) => mount.config.toolName).join(", ")}`,
  );
  for (const mount of plain.ctx.mounts) {
    const filter = mount.config.toolFilter;
    check(
      `${mount.config.toolName} is mounted with a tool filter`,
      filter !== undefined && ((filter.allow?.length ?? 0) > 0 || (filter.deny?.length ?? 0) > 0),
      `toolFilter is ${JSON.stringify(filter)} — this child would get every tool the preset registers`,
    );
  }

  // --- (b) a non-empty roleDeny still REPLACES the shipped deny list
  const denied = mountAttempt(preset, { roleDeny: { engineer: ["crew_engineer"] } });
  check(
    "a non-empty roleDeny still mounts",
    denied.thrown === undefined,
    denied.message,
  );
  const engineer = denied.ctx.mounts.find((mount) => mount.config.toolName === "crew_engineer");
  check(
    "the non-empty roleDeny replaces the shipped list, name for name",
    JSON.stringify(engineer?.config.toolFilter?.deny) === JSON.stringify(["crew_engineer"]),
    `crew_engineer's deny list is ${JSON.stringify(engineer?.config.toolFilter?.deny)}`,
  );
  const untouched = denied.ctx.mounts.find((mount) => mount.config.toolName === "crew_qa");
  const shippedQa = ROLES.find((role) => role.key === "qa");
  check(
    "one role's override leaves the other roles on their shipped list",
    (untouched?.config.toolFilter?.deny?.length ?? 0) === (shippedQa?.deny?.length ?? -1),
    `crew_qa denies ${untouched?.config.toolFilter?.deny?.length} tool(s), the table ships ${shippedQa?.deny?.length}`,
  );

  // --- (c) a non-empty roleAllow on the read-only reviewer works the same way
  const allowed = mountAttempt(preset, { roleAllow: { code_reviewer: ["read"] } });
  const reviewer = allowed.ctx.mounts.find((mount) => mount.config.toolName === "crew_code_reviewer");
  check(
    "a non-empty roleAllow still mounts and replaces the shipped allow list",
    allowed.thrown === undefined && JSON.stringify(reviewer?.config.toolFilter?.allow) === JSON.stringify(["read"]),
    allowed.thrown ? allowed.message : `crew_code_reviewer's allow list is ${JSON.stringify(reviewer?.config.toolFilter?.allow)}`,
  );

  // --- (d) mounting the same legal config twice gives the same result
  const again = mountAttempt(preset, { roleDeny: { engineer: ["crew_engineer"] } });
  check(
    "the same legal config mounts the same way twice",
    again.thrown === undefined
      && JSON.stringify(again.ctx.mounts.map((mount) => mount.config.toolFilter))
        === JSON.stringify(denied.ctx.mounts.map((mount) => mount.config.toolFilter)),
    again.message || "the second mount produced different filters",
  );
} finally {
  cleanUp(dir);
}

done();
