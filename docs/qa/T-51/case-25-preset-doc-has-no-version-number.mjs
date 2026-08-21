// T-51, DoD item 19 (CRD 0016, "代价": the behaviour change goes in CHANGELOG.md,
// which is T-61's): the `roleAllow` / `roleDeny` comment in the shipped preset
// documents the refusal without inventing a version number, and still says that a
// bare `~` is the way to keep the shipped list.
//
// What it proves two ways:
//   - that comment block is the ONLY user-facing documentation these two config
//     keys have. If it does not tell a user that an empty value now stops
//     startup, the first they learn of it is a session that will not start;
//   - a concrete version number written here is a guess. Which release carries
//     this is decided in `CHANGELOG.md` by T-61, and this file is frozen once
//     T-51 hands over (ADR 0013), so a wrong number could never be corrected
//     afterwards — it would ship to users for as long as the file lives, and it
//     would be read as a fact about their upgrade. Pointing at the CHANGELOG
//     instead stays true whatever version it lands in.
//
// One-way assertion, in the safe direction: "this comment holds no version
// number" cannot turn false by anything a later milestone is allowed to do to it,
// because no later task may touch the file at all.

import { check, done, repoFile } from "../lib/qa.mjs";

const preset = repoFile("preset/crew/agent.cordis.yml");

// The block that documents the two filter keys: from the heading of the comment
// down to where the next config key's documentation starts. Slicing it means a
// version number legitimately mentioned elsewhere in the file cannot mask a
// version number here, and vice versa.
const start = preset.indexOf("Per-role tool filters");
const end = preset.indexOf("Per-role provider and model", start + 1);
check("the preset still documents the per-role tool filters", start !== -1, "the `Per-role tool filters` comment is gone");
check("and that block still ends where the model settings begin", end > start, "the `Per-role provider and model` comment is gone, so the block cannot be sliced");

if (start !== -1 && end > start) {
  const block = preset.slice(start, end);

  // 1. No version number, in any of the spellings somebody would reach for.
  const versions = block.match(/\bv?\d+\.\d+(\.\d+)?(-[0-9A-Za-z.]+)?\b/g) ?? [];
  check(
    "the block names no version number",
    versions.length === 0,
    `found ${versions.join(", ")} — which release carries this is CHANGELOG.md's to state (T-61), and this file cannot be corrected after T-51 hands over`,
  );

  // 2. It points at the CHANGELOG instead, so the reader is not left guessing
  //    whether their own install already refuses the value.
  check(
    "it sends the reader to the CHANGELOG for the release this landed in",
    /CHANGELOG/.test(block),
    block,
  );

  // 3. The behaviour change itself is documented: an empty value stops startup.
  check(
    "it says a filter written here must name at least one tool",
    /NAME AT LEAST ONE TOOL/i.test(block),
    block,
  );
  check(
    "it says such a value makes dsh-crew refuse to start",
    /refuse to start/i.test(block),
    block,
  );
  check(
    "it says the refusal names the field and the role",
    /naming the field and the role/i.test(block),
    block,
  );

  // 4. And it still gives the way back. The refusal is only fair if the correct
  //    spelling of "off" is on the same screen: a bare `~`, which the mount lets
  //    through on purpose (CRD 0016, appended section).
  check(
    "it says a bare ~ still means «use the shipped list»",
    block.includes("~") && /shipped list/.test(block),
    block,
  );

  // 5. It does not offer "no filter" as something a user can spell — the mount
  //    has no such state any more, and a user told otherwise would keep hunting.
  check(
    "it says out loud there is no way to spell «no filter»",
    /no way to spell/i.test(block),
    block,
  );
}

done();
