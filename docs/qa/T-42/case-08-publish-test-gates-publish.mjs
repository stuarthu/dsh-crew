// T-42, DoD item 3 (T-41's pins, part 3 of 3): running `npm test` somewhere in
// the publishing workflow is not enough — it has to GATE the publish. A step
// that sits after `npm publish`, in another job, behind an `if:`, allowed to
// fail, or with its exit code thrown away is in the right place and gates
// nothing.

import { check, done, tempRepo, runCheck, cleanUp, copyFile, put, edit, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const OK = "workflow files under .github/workflows/ carry a live `npm publish`";
const THROWN_AWAY = "throws the `npm test` exit code away";
const PUBLISH_YML = ".github/workflows/publish.yml";
const STEP = "      - name: Run checks\n        run: npm test\n";

/** Run one mutation on a fresh copy. `mutate` gets the copy's folder. */
const mutated = (mutate, assert) => {
  const dir = tempRepo();
  try {
    mutate(dir);
    assert(runCheck(dir, "tools/verify-mount.mjs"));
  } finally {
    cleanUp(dir);
  }
};

/** Replace the `run:` line of the test step, keeping the step where it is. */
const withCommand = (command, assert) =>
  mutated((dir) => edit(dir, PUBLISH_YML, "        run: npm test\n", `        run: ${command}\n`), assert);

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green (so a red below is the mutation)");
  check(`the copy says: ok ${OK}`, saidOk(base, OK), base.out);
} finally {
  cleanUp(dir);
}

// Red: publish first, test afterwards. A presence-only pin is green here while
// the release publishes code that was never tested.
mutated(
  (dir) => {
    const text = copyFile(dir, PUBLISH_YML);
    if (!text.includes(STEP)) throw new Error("the `npm test` step of publish.yml has moved — re-anchor this case");
    put(dir, PUBLISH_YML, `${text.replace(STEP, "").replace(/\n*$/, "\n\n")}${STEP}`);
  },
  (run) => {
    expectRed(run, "runs `npm test` AFTER `npm publish`", "test after publish is red");
    check("and no `ok` line claims the folder gates on npm test", !saidOk(run, OK), run.out);
  },
);
// Red: test in one job, publish in another, with no `needs:` edge. File order
// proves nothing across jobs, and the pin has no YAML parser to read an edge —
// so it must refuse out loud rather than wave the file through.
mutated(
  (dir) => {
    const text = copyFile(dir, PUBLISH_YML);
    if (!text.includes(STEP)) throw new Error("the `npm test` step of publish.yml has moved — re-anchor this case");
    put(dir, PUBLISH_YML, `${text.replace(STEP, "")}\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n${STEP}`);
  },
  (run) => expectRed(run, "jobs, and file order proves nothing across jobs", "the test step moved to a second job is red"),
);
// Red: the step is allowed to fail.
mutated(
  (dir) => edit(dir, PUBLISH_YML, STEP, "      - name: Run checks\n        continue-on-error: true\n        run: npm test\n"),
  (run) => expectRed(run, "lets the `npm test` step fail without failing the run", "`continue-on-error: true` on the test step is red"),
);
// Red: the step can be skipped.
mutated(
  (dir) => edit(dir, PUBLISH_YML, STEP, "      - name: Run checks\n        if: false\n        run: npm test\n"),
  (run) => expectRed(run, "puts an `if:` on the `npm test` step", "an `if:` on the test step is red"),
);
// Red: three ways to throw the exit code away — the CRD 0009 hole, one file over.
withCommand("npm test || true", (run) => expectRed(run, THROWN_AWAY, "`npm test || true` is red"));
withCommand("npm test | tee test.log", (run) => expectRed(run, THROWN_AWAY, "`npm test | tee` is red"));
withCommand("npm test ; echo done", (run) => expectRed(run, THROWN_AWAY, "`npm test ; echo done` is red"));
withCommand("npm test &", (run) => expectRed(run, THROWN_AWAY, "`npm test &` (backgrounded) is red"));

// Green: `&&` keeps the exit code, and an unrelated step between test and
// publish changes nothing. (`continue-on-error: false` is green too — it is
// asserted with the rest of that setting's values, further down.)
withCommand("npm test && echo tested", (run) => {
  expectGreen(run, "`npm test && echo tested` stays green (`&&` keeps the exit code)");
  check(`chained: still ok ${OK}`, saidOk(run, OK), run.out);
});
mutated(
  (dir) => edit(dir, PUBLISH_YML, "      - name: Publish\n", "      - name: Say hello\n        run: echo hello\n\n      - name: Publish\n"),
  (run) => expectGreen(run, "an extra step between test and publish stays green"),
);
// ------------------------------- which `continue-on-error:` values are exempt
//
// This block is the assertion the comment here used to owe. That comment said
// `continue-on-error: false` was reported red, and quoted the old regex — both
// true when it was written, both false since T-46 fixed the line, so it is gone
// rather than kept as a wrong explanation. (Its exact wording is not repeated
// here: T-48's own DoD greps this file for it.)
//
// What was wrong: the exemption was a negative lookahead written after `[ \t]*`,
// which backtracks to zero width. It was therefore tested at the SPACE before
// the value, a space is not `false`, so it matched every time and exempted
// nothing — and `continue-on-error: false`, the explicit spelling of the default
// on a completely correct file, was reported red with a message saying the
// opposite of the truth. T-46 fixed it by capturing the value and judging it on
// its own.
//
// What is asserted below is the accepted set T-46 settled on, after checking
// every spelling against a real YAML parser: a bare `false`, `False` or `FALSE`,
// the three spellings YAML 1.2's core schema reads as the boolean. Everything
// else is red, because where YAML's answer and this pin's answer could differ
// this pin errs red — a value it cannot read as the boolean means the step
// really may fail, which is the dangerous direction.
const MAY_FAIL = "lets the `npm test` step fail without failing the run";
const RUN_CHECKS = "      - name: Run checks\n";
const LATER_STEP = "      - name: Ensure npm supports trusted publishing\n";
const EARLIER_STEP = "      - name: Decide whether to publish\n";

/** Add raw lines (their own indentation included) right after a step's opener. */
const addLines = (opener, ...lines) => (dir) =>
  edit(dir, PUBLISH_YML, opener, `${opener}${lines.map((line) => `${line}\n`).join("")}`);

/** One shape of the test step's own `continue-on-error:`, on a fresh copy. */
const shape = (lines, assert) => mutated(addLines(RUN_CHECKS, ...lines), assert);

// Green: the three boolean spellings, and whitespace or a trailing comment
// around them — those are YAML's business, not this pin's. The tab and the
// trailing spaces are one case on purpose: extra spaces after the colon run
// through the same `[ \t]*` and the same `trimEnd()`, so a fourth shape of the
// same code path would buy nothing.
shape(["        continue-on-error: false"], (run) =>
  expectGreen(run, "`continue-on-error: false` on the test step stays green (the default, spelled out)"));
shape(["        continue-on-error:\tfalse   "], (run) =>
  expectGreen(run, "a tab before `false` and trailing spaces after it stay green"));
shape(["        continue-on-error: false # the default, spelled out"], (run) =>
  expectGreen(run, "a trailing `# comment` after `false` stays green"));
shape(["        continue-on-error: False"], (run) => expectGreen(run, "`False` stays green"));
shape(["        continue-on-error: FALSE"], (run) => expectGreen(run, "`FALSE` stays green"));

// Red: a quoted `false` is the STRING "false" in YAML, not the boolean, and this
// pin does not guess how a runner coerces that string. This is the assertion
// that guards the DECISION and not just the behaviour: without it, a later
// reader widens the accepted set to any casing or quoting — which is how the
// original defect was written in the first place — and nothing goes red.
shape(['        continue-on-error: "false"'], (run) => {
  expectRed(run, MAY_FAIL, '`continue-on-error: "false"` (double-quoted) is red');
  check("and the red line quotes the value it refused", run.out.includes(`continue-on-error: ${JSON.stringify('"false"')}`), run.out);
});
shape(["        continue-on-error: 'false'"], (run) =>
  expectRed(run, MAY_FAIL, "`continue-on-error: 'false'` (single-quoted) is red"));
shape(["        continue-on-error: fAlse"], (run) =>
  expectRed(run, MAY_FAIL, "`fAlse` is red — the accepted set is three spellings, not a case-insensitive match"));
// Red: an expression can evaluate to true, so it is not "not allowed to fail".
shape(["        continue-on-error: ${{ github.event_name == 'push' }}"], (run) =>
  expectRed(run, MAY_FAIL, "an expression value is red (it can evaluate to true)"));
// Red: the value on the NEXT line is legal YAML, and one line cannot tell a
// `false` below from a `true` below. It is also the empty-value shape: the
// capture on the `continue-on-error:` line is "".
shape(["        continue-on-error:", "          false"], (run) =>
  expectRed(run, MAY_FAIL, "`continue-on-error:` with the value on the next line is red"));
// Red: every `continue-on-error:` line of the step is read, not only the first.
shape(["        continue-on-error: false", "        continue-on-error: true"], (run) =>
  expectRed(run, MAY_FAIL, "`false` then `true` on the test step is red (every line of the step is read)"));

// The value is read from the test step's OWN block, so a neighbouring step's
// `continue-on-error:` is neither borrowed as an exemption nor blamed on this
// step. Both directions, because the block has two boundaries: it opens at the
// last step opener at or before the `npm test` line and closes at the next one.
// Widen either boundary by one step and one of the two reds below goes green.
mutated(addLines(LATER_STEP, "        continue-on-error: true"), (run) =>
  expectGreen(run, "`continue-on-error: true` on the NEXT step is not the test step's problem"));
mutated(
  (dir) => {
    addLines(LATER_STEP, "        continue-on-error: false")(dir);
    addLines(RUN_CHECKS, "        continue-on-error: true")(dir);
  },
  (run) => expectRed(run, MAY_FAIL, "a `false` on the NEXT step does not exempt a `true` on the test step"),
);
mutated(
  (dir) => {
    addLines(EARLIER_STEP, "        continue-on-error: false")(dir);
    addLines(RUN_CHECKS, "        continue-on-error: true")(dir);
  },
  (run) => expectRed(run, MAY_FAIL, "a `false` on the PREVIOUS step does not exempt a `true` on the test step"),
);

done();
