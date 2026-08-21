// T-51, DoD item 19 (CRD 0016, appended section): `null` and a missing line are
// the ONE exception — they keep the shipped list, and the crew still mounts.
//
// What it proves: the appended section of CRD 0016 says `undefined` and `null` are
// let through deliberately, because `~` or a blank value in YAML is how a user
// turns an override off and asks for the shipped list. This is the direction the
// next "let's tighten the validation" change breaks: refusing `null` too would
// look stricter and safer, and it would make every deployment that switched an
// override off with `~` fail to start. It would also be a behaviour the document
// does not ask for.
//
// The second half matters as much: falling through must give that role its
// SHIPPED filter, name for name — not "no filter". "No filter" is what the hole
// in CRD 0016 produced, and no config may reach it, not even the legal way.
//
// One-way assertion: `host/roles-preset.js` belongs to T-51 and no later task may
// touch it (ADR 0013).

import { check, cleanUp, done } from "../lib/qa.mjs";
import { loadPreset, loadRoles, mountAttempt, presetCopy } from "./preset-mount.mjs";

/** The filter the table ships for one role, in the shape the mount builds. */
const shippedFilter = (role) => ({
  ...role.allow?.length > 0 ? { allow: role.allow } : {},
  ...role.deny?.length > 0 ? { deny: role.deny } : {},
});

const dir = presetCopy();
try {
  const preset = await loadPreset(dir);
  const { ROLES } = await loadRoles(dir);

  // --- (a) `null` on every role key, on both fields, one at a time
  for (const field of ["roleAllow", "roleDeny"]) {
    const refused = [];
    const wrongFilter = [];
    for (const role of ROLES) {
      const run = mountAttempt(preset, { [field]: { [role.key]: null } });
      if (run.thrown !== undefined) {
        refused.push(`${role.key}: ${run.message}`);
        continue;
      }
      if (run.ctx.mounts.length !== ROLES.length) {
        wrongFilter.push(`${role.key}: mounted ${run.ctx.mounts.length} of ${ROLES.length} roles`);
        continue;
      }
      const mounted = run.ctx.mounts.find((mount) => mount.config.toolName === role.toolName);
      if (JSON.stringify(mounted?.config.toolFilter) !== JSON.stringify(shippedFilter(role))) {
        wrongFilter.push(`${role.key}: mounted with ${JSON.stringify(mounted?.config.toolFilter)}, the table ships ${JSON.stringify(shippedFilter(role))}`);
      }
    }
    check(
      `${field}: <role> = null still starts, for all ${ROLES.length} role keys`,
      refused.length === 0,
      refused.join("\n      "),
    );
    check(
      `${field}: <role> = null leaves that role on its shipped filter, name for name`,
      wrongFilter.length === 0,
      wrongFilter.join("\n      "),
    );
  }

  // --- (b) `null` on both fields of one role at the same time
  const bothNull = mountAttempt(preset, { roleAllow: { qa: null }, roleDeny: { qa: null } });
  const qa = ROLES.find((role) => role.key === "qa");
  const mountedQa = bothNull.ctx.mounts.find((mount) => mount.config.toolName === "crew_qa");
  check(
    "null on both fields of one role still mounts it on the shipped filter",
    bothNull.thrown === undefined
      && JSON.stringify(mountedQa?.config.toolFilter) === JSON.stringify(shippedFilter(qa)),
    bothNull.thrown ? bothNull.message : `crew_qa mounted with ${JSON.stringify(mountedQa?.config.toolFilter)}`,
  );

  // --- (c) the whole line missing: an empty override object, and no override key
  //         at all. Both are the ordinary shape of a user's config.
  for (const [label, config] of [
    ["no roleAllow / roleDeny keys at all", {}],
    ["empty override objects", { roleAllow: {}, roleDeny: {} }],
    ["an override for another role only", { roleModels: { qa: { model: "some-model" } } }],
  ]) {
    const run = mountAttempt(preset, config);
    const missingFilter = run.ctx.mounts.filter((mount) => mount.config.toolFilter === undefined);
    check(
      `${label}: all ${ROLES.length} roles mount, each with a tool filter`,
      run.thrown === undefined && run.ctx.mounts.length === ROLES.length && missingFilter.length === 0,
      run.thrown
        ? run.message
        : `mounted ${run.ctx.mounts.length}, ${missingFilter.length} without a filter: ${missingFilter.map((mount) => mount.config.toolName).join(", ")}`,
    );
  }

  // --- (d) `undefined` written out explicitly: the same as not writing the line.
  const explicitUndefined = mountAttempt(preset, { roleDeny: { engineer: undefined } });
  check(
    "an explicit undefined is the same as no line at all",
    explicitUndefined.thrown === undefined && explicitUndefined.ctx.mounts.length === ROLES.length,
    explicitUndefined.thrown ? explicitUndefined.message : `mounted ${explicitUndefined.ctx.mounts.length}`,
  );

  // --- (e) null beside a legal non-empty override on another role: both hold.
  const mixed = mountAttempt(preset, {
    roleAllow: { code_reviewer: null },
    roleDeny: { engineer: ["crew_engineer"] },
  });
  const reviewer = ROLES.find((role) => role.key === "code_reviewer");
  const mountedReviewer = mixed.ctx.mounts.find((mount) => mount.config.toolName === "crew_code_reviewer");
  const mountedEngineer = mixed.ctx.mounts.find((mount) => mount.config.toolName === "crew_engineer");
  check(
    "a null override and a legal override live side by side",
    mixed.thrown === undefined
      && JSON.stringify(mountedReviewer?.config.toolFilter) === JSON.stringify(shippedFilter(reviewer))
      && JSON.stringify(mountedEngineer?.config.toolFilter?.deny) === JSON.stringify(["crew_engineer"]),
    mixed.thrown
      ? mixed.message
      : `reviewer: ${JSON.stringify(mountedReviewer?.config.toolFilter)} | engineer deny: ${JSON.stringify(mountedEngineer?.config.toolFilter?.deny)}`,
  );
} finally {
  cleanUp(dir);
}

done();
