// T-62, the task's own "most likely to go wrong" note: `roles/pm.md` is shipped
// to ANY project, so the flow may not name a command that only works in this
// repository. The project's own test command is written as "the project's test
// command". The one exception the task table allows is the two symlink commands,
// which `CRD 0013` named on purpose and which carry dsh's own paths.
//
// What it proves: a PM running this crew on someone else's Python or Rust project
// does not read step 9 and try to run this repository's `npm test`. The prompt
// ships in an npm package; a repo-specific command inside it is a bug for every
// user who is not this repository.
//
// PINNING STYLE: FLATTENED, sliced to the paired flow. One-way: the flow must
// keep speaking in terms of "the project's test command", whatever this
// repository's own command happens to be.

import { check, done, flat, pairedFlow } from "./paired.mjs";

const flow = flat(pairedFlow());

check(
  "the paired flow does not tell every project to run `npm test`",
  !flow.includes("npm test"),
  "the flow names this repository's own test command — it must say `the project's test command`",
);

check(
  "it speaks of the project's test command instead",
  flow.includes("the project's test command"),
  "the neutral wording is missing, so nothing tells the PM what to run",
);

check(
  "the only repo-specific commands in the flow are the two symlink lines CRD 0013 asked for",
  flow.includes("node_modules/@deepseek-ai")
    && flow.includes("In this repository that is two commands per tree"),
  "the symlink commands are either gone, or are no longer marked as this repository's own case",
);

check(
  "the flow does not name this repository's own check scripts as if every project had them",
  !flow.includes("tools/verify-guard.mjs") && !flow.includes("tools/verify-jobs.mjs"),
  "a check script that only exists here is named in the flow",
);

done();
