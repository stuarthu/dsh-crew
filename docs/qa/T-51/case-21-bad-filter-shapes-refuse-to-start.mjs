// T-51, DoD item 19 (CRD 0016, the appended section "«空» 不只是 `[]`"): every
// value that is not a non-empty list refuses to start, on both fields, for every
// role key in the table.
//
// What it proves: the decision CRD 0016 records is "an empty roleAllow / roleDeny
// must refuse to start", and a user who writes `roleAllow: security_reviewer: ""`
// in YAML has written an empty roleAllow as far as they are concerned. The first
// implementation caught the array spelling only, so `""`, `0`, `false` and `{}`
// all still slipped past `?.length > 0`, the filter half was dropped, and when it
// was the only half `toolFilter` was left off the config altogether — that child
// then got every tool this preset registers. A non-empty value that is not a list
// (a bare `read`) is refused too: it used to be handed to the child as its filter
// and the child failed its own config schema on every start.
//
// Why this is not case-17 / case-18 again: those two try one shape, the array, on
// the nine keys. This one is the shape axis — five more spellings of "empty" and
// the malformed non-list — crossed with both fields and every key. An
// implementation that guards `[]` alone passes case-17 and case-18 and fails here,
// which is exactly the second-round finding this case exists to hold.
//
// One-way assertion: `host/roles-preset.js` belongs to T-51 and no later task may
// touch it (ADR 0013), and CRD 0016 is an accepted user decision. "This value is
// refused" cannot flip after M3.

import { check, cleanUp, done } from "../lib/qa.mjs";
import { loadPreset, loadRoles, mountAttempt, presetCopy } from "./preset-mount.mjs";

// A factory per shape, so no two attempts can share one object and a mutation
// inside the preset could never leak from one attempt to the next.
const BAD_SHAPES = [
  { label: "[]", make: () => [] },
  { label: '""', make: () => "" },
  { label: "0", make: () => 0 },
  { label: "false", make: () => false },
  { label: "{}", make: () => ({}) },
  { label: '"read"', make: () => "read" },
];

const dir = presetCopy();
try {
  const preset = await loadPreset(dir);
  const { ROLES } = await loadRoles(dir);

  // The keys come from the table, never from a retyped list: a hand-written list
  // stops covering the ninth role the day somebody adds a tenth.
  check(
    "the role table still has the nine keys these shapes are crossed with",
    ROLES.length === 9 && ROLES.every((role) => typeof role.key === "string" && role.key.length > 0),
    `the table holds ${ROLES.length} role(s): ${ROLES.map((role) => role.key).join(", ")}`,
  );

  for (const field of ["roleAllow", "roleDeny"]) {
    for (const shape of BAD_SHAPES) {
      // One check per field × shape, covering every key, with the keys that got
      // through named in the detail — so a partial implementation says which
      // roles it let past instead of only that something is wrong.
      const slipped = [];
      const unnamed = [];
      for (const role of ROLES) {
        const run = mountAttempt(preset, { [field]: { [role.key]: shape.make() } });
        if (run.thrown === undefined) {
          slipped.push(`${role.key} (mounted ${run.ctx.mounts.length} role(s) without a word)`);
          continue;
        }
        if (!run.message.includes(role.key) || !run.message.includes(field)) {
          unnamed.push(`${role.key}: ${run.message}`);
        }
      }
      check(
        `${field}: <role> = ${shape.label} refuses to start for all ${ROLES.length} role keys`,
        slipped.length === 0,
        slipped.length ? `these keys were accepted: ${slipped.join("; ")}` : "",
      );
      check(
        `${field}: <role> = ${shape.label} names the field and the role key in the refusal`,
        unnamed.length === 0,
        unnamed.join("\n      "),
      );
    }
  }

  // A bad shape on one role next to a legal override on another: the bad line
  // still decides. The cheapest wrong implementation validates only the roles it
  // has no override for.
  const mixed = mountAttempt(preset, {
    roleAllow: { security_reviewer: "" },
    roleDeny: { engineer: ["crew_engineer"] },
  });
  check(
    "a bad shape wins even when another role's override is legal",
    mixed.thrown !== undefined && mixed.message.includes("security_reviewer"),
    mixed.thrown === undefined ? `mounted ${mixed.ctx.mounts.length} role(s)` : mixed.message,
  );

  // Nested emptiness is still emptiness: `[[]]` is a non-empty list, so it is
  // NOT refused here — it is a list of one bad tool name, which dsh rejects when
  // the child starts. Pinned so nobody "improves" the validation into guessing
  // at list contents, which CRD 0016 deliberately does not do (the mount does
  // not validate the names in a user's allow list either).
  const nested = mountAttempt(preset, { roleAllow: { code_reviewer: [[]] } });
  check(
    "a non-empty list is accepted whatever is inside it — the mount does not judge tool names",
    nested.thrown === undefined,
    nested.message,
  );

  // The same bad shape twice in a row gives the same refusal: the validation pass
  // must hold no state.
  const first = mountAttempt(preset, { roleDeny: { doc_reviewer: 0 } });
  const second = mountAttempt(preset, { roleDeny: { doc_reviewer: 0 } });
  check(
    "the same bad shape is refused the second time, with the same message",
    first.thrown !== undefined && second.thrown !== undefined && first.message === second.message,
    `first: ${first.message || "(nothing thrown)"} | second: ${second.message || "(nothing thrown)"}`,
  );
} finally {
  cleanUp(dir);
}

done();
