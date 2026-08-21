// T-42, DoD item 1: delete a gate's segment from `scripts.test` and a check must
// go red. Proves the two `scripts.test` pins in tools/verify-mount.mjs are real
// gates: without them QA's cases stay on disk for ever, and a task section with
// no Verdicts line never reddens anything, while `npm test` is still green.
//
// Both halves are tested, because a pin that reds a correct file is as bad as no
// pin: appending another command with `&&` must stay green (CRD 0011 did exactly
// that when it added the Verdicts gate after run-all.sh).
//
// Why this file is a LOOP over a table. `scripts.test` grew a second gate
// (CRD 0011) and the pin did not grow with it — that is the defect T-46 was
// opened for. This case then had the same defect one level up: it was wired to
// the run-all.sh segment alone, and every mutation it wrote left
// `node tools/verify-tasks.mjs` in place with nothing after it, so the second
// row of the pin's table was never reached and could have been deleted with this
// case still green. The table below is the pin's table, so a third gate is one
// row in each and neither can drift from the other.

import { check, done, tempRepo, runCheck, cleanUp, copyFile, editJson, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

/** The two gates, as the pin's own table names them. */
const GATES = [
  { segment: "bash docs/qa/run-all.sh", ok: "npm test runs QA's cases (bash docs/qa/run-all.sh)", crd: "CRD 0009" },
  { segment: "node tools/verify-tasks.mjs", ok: "npm test runs the Verdicts gate (node tools/verify-tasks.mjs)", crd: "CRD 0011" },
];

// Every neutraliser `throwsAwayExitCode` counts. The single `|` is the one T-46
// added and the reason it belongs here: npm runs a script with POSIX `sh`, where
// `a | b` exits with B's status, so `run-all.sh | tee log` really does throw
// QA's exit code away. `pipefail` is not POSIX `sh`, so no correct spelling is
// lost by counting it — and tools/verify-mount.mjs already counted a single `|`
// for the publish.yml step, so before T-46 one file answered the same question
// two different ways.
const NEUTRALISERS = [["||", "|| (or-else)"], ["|", "| (a pipe: the exit code is the last command's)"], [";", "; (a new command)"], ["&", "& (background)"]];

/**
 * Rewrite the copy's `scripts.test` by replacing ONE of its ` && ` segments,
 * built from whatever the copy really holds rather than from a hardcoded list of
 * today's six commands. `replacement` gets the segment; return `null` to drop it.
 *
 * It throws when the segment is not there as a whole ` && ` element, so a case
 * can never quietly test an unmutated copy — the habit the mutation helpers in
 * ../lib/qa.mjs keep.
 */
const rewrite = (dir, segment, replacement) => {
  const before = JSON.parse(copyFile(dir, "package.json")).scripts.test.split(" && ");
  if (!before.includes(segment)) {
    throw new Error(`scripts.test has no \`${segment}\` segment of its own — the manifest's shape moved, re-anchor this case: ${before.join(" && ")}`);
  }
  const after = before.map((part) => (part === segment ? replacement(part) : part)).filter((part) => part !== null);
  editJson(dir, "package.json", (manifest) => { manifest.scripts.test = after.join(" && "); });
  return after.join(" && ");
};

const dir = tempRepo();
try {
  const REAL_TEST = JSON.parse(copyFile(dir, "package.json")).scripts.test;
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green (so a red below is the mutation, not the copy)");
  for (const gate of GATES) check(`the copy says: ok ${gate.ok}`, saidOk(base, gate.ok), base.out);

  for (const gate of GATES) {
    const other = GATES.find((g) => g !== gate);
    /** Put the copy's real `scripts.test` back, then mutate this gate's segment only. */
    const only = (replacement) => {
      editJson(dir, "package.json", (manifest) => { manifest.scripts.test = REAL_TEST; });
      return rewrite(dir, gate.segment, replacement);
    };

    // The segment gone altogether: the string its CRD pinned. The other gate is
    // left exactly where it was, still joined by ` && `, so only one row of the
    // pin's table can be the reason for the red.
    only(() => null);
    const removed = runCheck(dir, "tools/verify-mount.mjs");
    expectRed(removed, `scripts.test does not run \`${gate.segment}\``, `scripts.test without \`${gate.segment}\` is red (${gate.crd})`);
    check(`and the \`ok\` line for \`${gate.segment}\` is not printed`, !saidOk(removed, gate.ok), removed.out);
    check(`and \`${other.segment}\` is still reported ok (the red names one gate, not the file)`, saidOk(removed, other.ok), removed.out);

    // Present, but its exit code thrown away. Each spelling reads exactly like a
    // gate that runs.
    for (const [operator, label] of NEUTRALISERS) {
      only((segment) => `${segment} ${operator} echo neutralised`);
      const run = runCheck(dir, "tools/verify-mount.mjs");
      expectRed(run, `lets \`${gate.segment}\` fail without failing npm test`, `\`${gate.segment}\` followed by ${label} is red`);
      // On the pipe — the newest branch — also prove the neutraliser is read per
      // segment and not per file: the untouched gate must still be ok.
      if (operator === "|") {
        check(`and \`${other.segment}\` is still reported ok next to a neutralised \`${gate.segment}\``, saidOk(run, other.ok), run.out);
      }
    }

    // `&&` keeps the exit code, so chaining a further command right after this
    // gate must stay green — that is exactly what CRD 0011 did to `scripts.test`,
    // and a pin that reddened it would be the false-red trap this batch fixed
    // twice.
    only((segment) => `${segment} && echo tested`);
    const chained = runCheck(dir, "tools/verify-mount.mjs");
    expectGreen(chained, `\`${gate.segment} && echo tested\` stays green (a correct file is not reddened)`);
    check(`chained: still ok ${gate.ok}`, saidOk(chained, gate.ok), chained.out);
  }
} finally {
  cleanUp(dir);
}
done();
