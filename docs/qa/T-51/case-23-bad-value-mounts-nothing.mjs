// T-51, DoD item 19 (CRD 0016): a bad filter value gives NO crew, not half a
// crew — whatever position the bad role holds in the table.
//
// What it proves: the refusal has to happen in a validation pass of its own,
// before the first `ctx.plugin()` call. Written inside the mount loop instead, it
// still throws and still names the role — case-17, case-18 and case-21 all stay
// green — but every role listed BEFORE the bad one has already been mounted by
// then. A host that logs an apply error and carries on is then left with part of
// a crew and no filter problem in sight, which is the failure CRD 0016 is about
// wearing different clothes: a role running without the filter its user meant to
// give it, and nothing on screen saying so.
//
// The last key in the table is the case that tells the two implementations apart,
// so it is checked by position (`ROLES[ROLES.length - 1]`), never by name: a case
// that hard-coded `doc_reviewer` would quietly stop testing "the last one" the day
// the table gains a role.
//
// One-way assertion: `host/roles-preset.js` belongs to T-51 and no later task may
// touch it (ADR 0013).

import { check, cleanUp, done } from "../lib/qa.mjs";
import { loadPreset, loadRoles, mountAttempt, presetCopy } from "./preset-mount.mjs";

const dir = presetCopy();
try {
  const preset = await loadPreset(dir);
  const { ROLES } = await loadRoles(dir);
  const last = ROLES[ROLES.length - 1];

  // --- the case that separates one pass from two: the LAST role in the table
  for (const field of ["roleAllow", "roleDeny"]) {
    for (const [label, value] of [["[]", []], ['""', ""], ["{}", {}]]) {
      const run = mountAttempt(preset, { [field]: { [last.key]: value } });
      check(
        `${field}: ${last.key} = ${label} — the last role in the table — mounts nothing at all`,
        run.thrown !== undefined && run.ctx.mounts.length === 0,
        run.thrown === undefined
          ? `nothing was thrown; ${run.ctx.mounts.length} role(s) mounted`
          : `${run.ctx.mounts.length} role(s) were mounted before the refusal: ${run.ctx.mounts.map((mount) => mount.config.toolName).join(", ")}`,
      );
    }
  }

  // --- and every other position too, so "all or nothing" is a property of the
  //     table rather than of one lucky index
  for (const field of ["roleAllow", "roleDeny"]) {
    const partial = [];
    for (const role of ROLES) {
      const run = mountAttempt(preset, { [field]: { [role.key]: [] } });
      if (run.thrown === undefined || run.ctx.mounts.length !== 0) {
        partial.push(`${role.key}: ${run.thrown === undefined ? "nothing thrown" : "refused"}, ${run.ctx.mounts.length} role(s) mounted`);
      }
    }
    check(
      `${field}: a bad value on any of the ${ROLES.length} keys mounts zero roles`,
      partial.length === 0,
      partial.join("\n      "),
    );
  }

  // --- two bad roles at once, the first and the last: still nothing mounted, and
  //     the message names one of them rather than dying without a name.
  const twoBad = mountAttempt(preset, {
    roleAllow: { [ROLES[0].key]: [] },
    roleDeny: { [last.key]: false },
  });
  check(
    "two bad values at opposite ends of the table mount nothing and name a role",
    twoBad.thrown !== undefined
      && twoBad.ctx.mounts.length === 0
      && (twoBad.message.includes(ROLES[0].key) || twoBad.message.includes(last.key)),
    twoBad.thrown === undefined ? `mounted ${twoBad.ctx.mounts.length}` : `${twoBad.ctx.mounts.length} mounted; ${twoBad.message}`,
  );

  // --- the control: with no bad value the same helper mounts the whole crew, so
  //     a zero above cannot be an artefact of the harness never mounting anything.
  const good = mountAttempt(preset, {});
  check(
    `the control mount still puts up all ${ROLES.length} roles`,
    good.thrown === undefined && good.ctx.mounts.length === ROLES.length,
    good.thrown ? good.message : `mounted ${good.ctx.mounts.length}`,
  );
} finally {
  cleanUp(dir);
}

done();
