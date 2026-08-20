// Task T-01 — acceptance check 15.
// Proves the state-file example's merge block carries publishCheck, the record
// of which CI files were read before a main push.
import { pm, section, check, done } from "../lib/qa.mjs";

const state = section(pm(), "The state file");
const line = state.split("\n").find(text => text.includes('"merge"')) ?? "";

check("merge.publishCheck is in the state example", line.includes('"publishCheck"'), line);

done();
