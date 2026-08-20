// Task T-01 — acceptance check 25.
// Proves the publishCheck example is a placeholder that cannot be copied as an
// answer, and that the prompt says so in words.
import { pm, section, flat, check, done } from "../lib/qa.mjs";

const state = section(pm(), "The state file");
const line = state.split("\n").find(text => text.includes('"publishCheck"')) ?? "";
const flatState = flat(state);

check("the publishCheck example value is a placeholder",
  /"publishCheck": "<[^"]*>[^"]*"/.test(line), line);
check("the example does not name a real workflow file as a finished conclusion",
  !/publish\.yml/.test(line) && !/tag-only/.test(line), line);
check("copying the shape as an answer is forbidden",
  /Never copy the shape above as an answer/.test(flatState), flatState);
check("every file read has to be named",
  /name every file you read/.test(flatState), flatState);
check("a missing field, or one naming a file this repository does not have, means doing the check again",
  /If the field is missing, or it names a file this repository does not have, do the check again/.test(flatState), flatState);

done();
