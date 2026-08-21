// T-42, DoD item 5 (part 2): the doc review's `scope:` line, pinned in TWO files
// — roles/pm.md (the PM sending the review) and roles/doc-reviewer.md (the
// reviewer reading its own rules). Lose it and a `pass` over one file reads,
// months later, exactly like a `pass` over the whole document set.
//
// The pin is on the BACKTICKED start of the line, not the bare word, and that
// detail is the case: roles/pm.md says "It changes only through a CRD, like
// scope:" in step 3, so a pin on the bare `scope:` would stay green with the
// whole instruction deleted. Dropping just the backtick must therefore be red.

import { check, done, tempRepo, runCheck, cleanUp, editAll, expectRed, expectGreen, saidOk } from "../lib/qa.mjs";

const REGISTERED = "PM prompt section registered";
const failFor = (file) => `roles/${file} no longer tells the doc reviewer to open its report with a \`scope:\` line`;
const okFor = (file) => `roles/${file} carries the doc review's \`scope:\` line`;

const dir = tempRepo();
try {
  const base = runCheck(dir, "tools/verify-mount.mjs");
  expectGreen(base, "the untouched copy is green (so a red below is the mutation)");
  check(`the copy says: ok ${okFor("pm.md")}`, saidOk(base, okFor("pm.md")), base.out);
  check(`the copy says: ok ${okFor("doc-reviewer.md")}`, saidOk(base, okFor("doc-reviewer.md")), base.out);
} finally {
  cleanUp(dir);
}

for (const file of ["pm.md", "doc-reviewer.md"]) {
  // Red: the instruction gone from that one file. The other file still has it,
  // which is the point of pinning both — either one alone would let the rule be
  // deleted from the other and stay green.
  const dropped = tempRepo();
  try {
    editAll(dropped, `roles/${file}`, "`scope:", "the reader will work it out:");
    const run = runCheck(dropped, "tools/verify-mount.mjs");
    expectRed(run, failFor(file), `roles/${file} without the scope instruction is red`);
    check(`and no \`ok\` line claims roles/${file} carries it`, !saidOk(run, okFor(file)), run.out);
    check(`while the other file's \`ok\` line still prints`, saidOk(run, okFor(file === "pm.md" ? "doc-reviewer.md" : "pm.md")), run.out);
  } finally {
    cleanUp(dropped);
  }

  // Red: only the backtick removed. The word `scope:` is still in the file — in
  // roles/pm.md it is in step 3 as well — so this is the false green the pin was
  // deliberately spelled to avoid, and it was measured in a copy before the pin
  // was written.
  const unbacked = tempRepo();
  try {
    editAll(unbacked, `roles/${file}`, "`scope:", "scope:");
    expectRed(runCheck(unbacked, "tools/verify-mount.mjs"), failFor(file), `roles/${file} with the backtick dropped is red (the bare word is not the pin)`);
  } finally {
    cleanUp(unbacked);
  }
}

done();
