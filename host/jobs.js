// Unfinished-job notice (HOST plane).
//
// A crew job survives a crash because the PM keeps its state in a file. That is
// only half the story: on the next session the PM has to KNOW the job is there.
// This module reads the job folder and produces one short notice, which crew.js
// registers as a dynamic prompt context — so an unfinished job is put in front
// of the PM instead of waiting to be remembered.
//
// The job folder sits INSIDE the repository, at `.dsh-crew/jobs` under the folder
// the session runs in. It is still single-use: the PM keeps it out of git's sight
// through the repository's own `info/exclude`, it is never staged, never committed
// and never read by a reviewer, and the whole folder is dropped when the job ends.
// A relative default is what makes it per-repository — resolved against the
// session's own folder, so a job listed here belongs to the repository this
// session works in, and two repositories never share a jobs folder.
//
// Empty text contributes nothing to the prompt, so a machine with no unfinished
// job pays nothing for this.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import { expandHome } from "./roles.js";

/** Task states that still need work. Anything else counts as finished. */
const OPEN_STATES = new Set(["todo", "running", "review", "blocked"]);

/** Milestone states that still need work. Anything else counts as finished. */
const OPEN_MILESTONES = new Set(["todo", "running", "review"]);

/** How many jobs the notice names before it says how many it left out. */
const MAX_LISTED = 5;

/**
 * Default job folder, relative to the folder the session runs in — that is the
 * repository, which is why one default serves every repository. A user who wants
 * it elsewhere names an absolute path in `jobsDir`, and `~` is still honoured.
 * Keep in step with the path named in roles/pm.md step 6, **Job folder**.
 */
export const DEFAULT_JOBS_DIR = ".dsh-crew/jobs";

/**
 * Read one job's `state.json` into the few facts the notice needs.
 *
 * @param dir - the job folder
 * @returns the summary, or undefined when this folder holds no readable job
 */
function readJob(dir) {
  const file = join(dir, "state.json");
  if (!existsSync(file)) return undefined;
  let state;
  try {
    state = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return { unreadable: true, name: dir.split("/").pop() };
  }
  const tasks = Array.isArray(state.tasks) ? state.tasks : [];
  const open = tasks.filter(task => OPEN_STATES.has(task?.state));
  const blocked = open.filter(task => task?.state === "blocked");
  // Milestones are optional: only PRD-sized jobs have them.
  const milestones = Array.isArray(state.milestones) ? state.milestones : [];
  const current = milestones.find(one => OPEN_MILESTONES.has(one?.state));
  return {
    name: typeof state.job === "string" ? state.job : dir.split("/").pop(),
    repo: typeof state.repo === "string" ? state.repo : "(repository not recorded)",
    branch: typeof state.branch === "string" ? state.branch : undefined,
    total: tasks.length,
    done: tasks.length - open.length,
    blocked: blocked.length,
    milestones: milestones.length,
    milestone: typeof current?.id === "string" ? current.id : undefined,
    // A milestone in `review` is waiting for the user's answer, and nothing in
    // the job may move until they give it. That has to be in the notice.
    awaitingReview: current?.state === "review",
    // A job with no task list yet is unfinished too — it was interrupted while
    // the document was being written.
    unfinished: tasks.length === 0 || open.length > 0,
    touched: statSync(file).mtime.toISOString().slice(0, 16).replace("T", " "),
  };
}

/**
 * Build the notice for every unfinished job.
 *
 * @param jobsDir - folder holding one directory per job (`~` is expanded)
 * @returns the notice text, or an empty string when there is nothing to say
 */
export function jobsNotice(jobsDir = DEFAULT_JOBS_DIR) {
  // Relative to the session's folder, so the default lands inside the repository.
  const root = resolve(expandHome(jobsDir));
  if (!existsSync(root)) return "";

  let entries;
  try {
    entries = readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory());
  } catch {
    return "";
  }

  const jobs = [];
  const unreadable = [];
  for (const entry of entries) {
    const job = readJob(join(root, entry.name));
    if (job === undefined) continue;
    if (job.unreadable) unreadable.push(job.name);
    else if (job.unfinished) jobs.push(job);
  }
  if (jobs.length === 0 && unreadable.length === 0) return "";

  // Most recently touched first: the job someone was actually working on.
  jobs.sort((a, b) => (a.touched < b.touched ? 1 : -1));

  const lines = [
    `Unfinished crew work: ${jobs.length} job${jobs.length === 1 ? "" : "s"} left in ${root}.`,
    "",
  ];
  for (const job of jobs.slice(0, MAX_LISTED)) {
    const progress = job.total === 0
      ? "no task list yet — it stopped while the document was being written"
      : `${job.done} of ${job.total} tasks done${job.blocked > 0 ? `, ${job.blocked} blocked` : ""}`;
    const stage = job.milestone === undefined
      ? ""
      : ` — milestone ${job.milestone} of ${job.milestones}${job.awaitingReview ? ", waiting for the user's review" : ""}`;
    lines.push(`- "${job.name}" in ${job.repo}${job.branch ? ` (branch ${job.branch})` : ""}: ${progress}${stage}. Last change ${job.touched}.`);
  }
  // Never a silent cap: say what was left out.
  if (jobs.length > MAX_LISTED) lines.push(`- …and ${jobs.length - MAX_LISTED} more, not listed here.`);
  if (unreadable.length > 0) lines.push(`- Could not read the state file of: ${unreadable.join(", ")}. Tell the user; do not treat these as finished.`);

  lines.push(
    "",
    "If one of these is in the folder this session is working in, tell the user about it BEFORE anything else, and ask one question: carry on, or start clean. A job waiting for a milestone review is waiting for the user: ask that review question again before anything else moves. Never carry on without asking, and never start clean without asking. Use `list_agents` to see which crew children can still be woken. The job folder sits inside the repository, so every job named here belongs to the repository this session works in — none of them is another repository's work to ignore.",
  );
  return lines.join("\n");
}
