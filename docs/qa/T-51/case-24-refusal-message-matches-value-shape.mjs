// T-51, DoD item 19 (CRD 0016, appended section: "信息要说清它是空列表还是根本不是
// 列表"): the refusal tells the user which of the two mistakes they made, shows
// the value they wrote, and names only the field they actually wrote.
//
// What it proves: the message is the whole product here. Startup stops either
// way, so the only thing separating "I can fix this in ten seconds" from "dsh-crew
// is broken" is what the line says. Three things it must get right:
//   - an empty list and a value that is not a list are different mistakes with
//     different fixes, so the message must not describe both with one phrase;
//   - the value has to appear, because `""` and `0` and `{}` are invisible in a
//     YAML file the user is scanning by eye;
//   - it must name the field the user wrote and NOT the other one. A message
//     saying `roleAllow` sends a reader who wrote `roleDeny` to a line that is
//     not in their file, and CRD 0016's decision says the message names the role
//     key AND the field.
//
// It also pins the way back that the appended section calls the correct spelling
// of "off": a bare `~`. If the message only said "write the tool names", a user
// who wanted the shipped list would delete the line and guess.
//
// One-way assertion: `host/roles-preset.js` belongs to T-51 and no later task may
// touch it (ADR 0013).

import { check, cleanUp, done } from "../lib/qa.mjs";
import { loadPreset, mountAttempt, presetCopy } from "./preset-mount.mjs";

const EMPTY_LIST = /empty list/i;
const NOT_A_LIST = /not a list of tool names/i;

const dir = presetCopy();
try {
  const preset = await loadPreset(dir);

  // --- the empty list says "empty list", and does NOT say "not a list"
  const emptyList = mountAttempt(preset, { roleAllow: { code_reviewer: [] } });
  check(
    "an empty list is reported as an empty list",
    EMPTY_LIST.test(emptyList.message) && !NOT_A_LIST.test(emptyList.message),
    emptyList.message || "(nothing thrown)",
  );
  check(
    "and it shows the value the user wrote, `[]`",
    emptyList.message.includes("[]"),
    emptyList.message || "(nothing thrown)",
  );

  // --- every non-list shape says "not a list", and shows itself
  for (const [label, value, shown] of [
    ['""', "", '""'],
    ["0", 0, "0"],
    ["false", false, "false"],
    ["{}", {}, "{}"],
    ['"read"', "read", '"read"'],
  ]) {
    const run = mountAttempt(preset, { roleDeny: { engineer: value } });
    check(
      `${label} is reported as "not a list of tool names", not as an empty list`,
      NOT_A_LIST.test(run.message) && !EMPTY_LIST.test(run.message),
      run.message || "(nothing thrown)",
    );
    check(
      `${label} is shown in the message as ${shown}`,
      run.message.includes(shown),
      run.message || "(nothing thrown)",
    );
  }

  // --- only the field the user wrote is named, in both directions
  const wroteDeny = mountAttempt(preset, { roleDeny: { engineer: [] } });
  check(
    "a bad roleDeny line never mentions roleAllow",
    wroteDeny.message.includes("roleDeny") && !wroteDeny.message.includes("roleAllow"),
    wroteDeny.message || "(nothing thrown)",
  );
  const wroteAllow = mountAttempt(preset, { roleAllow: { security_reviewer: "" } });
  check(
    "a bad roleAllow line never mentions roleDeny",
    wroteAllow.message.includes("roleAllow") && !wroteAllow.message.includes("roleDeny"),
    wroteAllow.message || "(nothing thrown)",
  );

  // --- the two ways forward are both in the message: name the tools, or `~`
  for (const run of [emptyList, wroteDeny, wroteAllow]) {
    check(
      `the refusal offers both fixes — name the tools, or a bare ~ for the shipped list: ${run.message.slice(0, 48)}…`,
      /write the tool names/i.test(run.message) && run.message.includes("~"),
      run.message || "(nothing thrown)",
    );
  }

  // --- the message names a role key that is really in the config, not a generic
  //     "a role": a user with nine role keys has to know which line to open.
  check(
    "the refusal names the role key from the user's own line",
    wroteAllow.message.includes("security_reviewer") && !wroteAllow.message.includes("code_reviewer"),
    wroteAllow.message || "(nothing thrown)",
  );
} finally {
  cleanUp(dir);
}

done();
