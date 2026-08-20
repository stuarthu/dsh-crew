// Task T-01 — acceptance check 40.
// After a restart the publishCheck line from the previous session is still in
// state.json. The hard rule's evidence would be satisfied by a line nobody in
// this session ever verified.
import { pm, section, flat, check, done } from "../lib/qa.mjs";

const state = flat(section(pm(), "The state file"));

check("an existing publishCheck is treated as unverified after a restart",
  /After a restart, treat a `publishCheck` that is already in `state.json` as unverified/.test(state), state);
check("the CI files are read again in this session",
  /read the CI files again in this session/.test(state), state);
check("and the line is written again before the main push is asked for",
  /write the line again\s*before you ask for the push of `main`/.test(state), state);

done();
