// Checks the unfinished-job notice that the PM sees after a restart, using
// throwaway job folders. Run it with:  node tools/verify-jobs.mjs
//
// The notice is what makes crash pick-up real: the state file alone is useless
// if the next session never mentions it. These cases pin the rules that matter —
// silence when there is nothing to say, no silent cap, and an unreadable job
// reported rather than counted as finished.

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { jobsNotice } from "../host/jobs.js";

let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL  ${message}`); };
const ok = (message) => console.log(`ok    ${message}`);

const root = mkdtempSync(join(tmpdir(), "crew-jobs-"));

/** Write one job folder. Pass a string to write invalid JSON on purpose. */
function job(name, state) {
  const dir = join(root, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "state.json"), typeof state === "string" ? state : JSON.stringify(state));
}

// 1. Nothing at all: no text, so the prompt carries nothing.
if (jobsNotice(join(root, "missing")) !== "") fail("a folder that does not exist should produce no notice");
else ok("no job folder -> empty notice");

// 2. A finished job is not mentioned.
job("done-job", { job: "done-job", repo: "/repo/a", branch: "crew/done-job", tasks: [{ id: "T-01", state: "done" }] });
if (jobsNotice(root) !== "") fail("a job whose tasks are all done should produce no notice");
else ok("finished job -> empty notice");

// 3. An unfinished job is named, with its numbers.
job("live-job", {
  job: "live-job",
  repo: "/repo/b",
  branch: "crew/live-job",
  tasks: [{ id: "T-01", state: "done" }, { id: "T-02", state: "blocked" }, { id: "T-03", state: "todo" }],
});
const notice = jobsNotice(root);
for (const needle of ["live-job", "/repo/b", "crew/live-job", "1 of 3 tasks done", "1 blocked"]) {
  if (!notice.includes(needle)) fail(`the notice does not mention "${needle}"`);
}
if (notice.includes("done-job")) fail("the notice mentions a finished job");
if (!notice.includes("carry on, or start clean")) fail("the notice does not tell the PM to ask the user");
if (failures === 0) ok("unfinished job -> named, with progress and the ask-first rule");

// 4. A job interrupted before it had tasks still counts as unfinished.
job("early-job", { job: "early-job", repo: "/repo/c", tasks: [] });
if (!jobsNotice(root).includes("no task list yet")) fail("a job with no tasks should be reported as unfinished");
else ok("job stopped before its task list -> still reported");

// 5. A broken state file is reported, never silently treated as finished.
job("broken-job", "{ this is not json");
const withBroken = jobsNotice(root);
if (!withBroken.includes("broken-job") || !withBroken.includes("Could not read")) fail("an unreadable state file must be reported");
else ok("unreadable state file -> reported, not counted as finished");

// 6. A job with milestones says which one it is in — a restart must not guess.
job("milestone-job", {
  job: "milestone-job",
  repo: "/repo/m",
  milestones: [
    { id: "M1", goal: "poc", state: "done" },
    { id: "M2", goal: "the rest", state: "running" },
    { id: "M3", goal: "later", state: "todo" },
  ],
  tasks: [{ id: "T-01", milestone: "M1", state: "done" }, { id: "T-02", milestone: "M2", state: "todo" }],
});
const withMilestone = jobsNotice(root);
if (!withMilestone.includes("milestone M2 of 3")) fail("a job with milestones must say which milestone it is in");
else ok("job with milestones -> names the milestone it stopped in");

// 7. A milestone waiting for the user's answer blocks the whole job. Say so.
job("waiting-job", {
  job: "waiting-job",
  repo: "/repo/w",
  milestones: [{ id: "M1", goal: "poc", state: "review" }],
  tasks: [{ id: "T-01", milestone: "M1", state: "todo" }],
});
const waiting = jobsNotice(root);
if (!waiting.includes("waiting for the user's review")) fail("a milestone in review must be reported as waiting for the user");
else ok("milestone in review -> notice says the user still owes an answer");

// A job with no milestones must not grow a milestone line.
if (/early-job[^\n]*milestone/.test(waiting)) fail("a job without milestones must not mention one");
else ok("job without milestones -> no milestone line");

// 8. No silent cap: past five jobs it says how many were left out.
for (let index = 0; index < 6; index += 1) {
  job(`extra-${index}`, { job: `extra-${index}`, repo: "/repo/d", tasks: [{ id: "T-01", state: "todo" }] });
}
const many = jobsNotice(root);
if (!/and \d+ more, not listed here/.test(many)) fail("with more than five jobs the notice must say how many it left out");
else ok("more than five jobs -> says how many were not listed");

rmSync(root, { recursive: true, force: true });

console.log(failures === 0 ? "\nall job-notice checks passed" : `\n${failures} job-notice check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
