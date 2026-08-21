// T-51, DoD item 16: the two new persona file names really are in both explicit
// file-name lists in `tools/verify-mount.mjs` — proved by breaking each pinned
// string, one at a time, and reading the red.
//
// What it proves: T-53 item 11 and T-54 item 12 claim "verify-mount.mjs checks
// these four things" for the two new personas. That claim is only true while the
// file names sit in both lists, and the lists are explicit: a persona missing
// from them has nothing watching it at all. Ten mutations — 2 files x 3 required
// strings removed, and 2 files x 2 forbidden strings added — and every one of
// them must be red AND must name the file it broke.
//
// Each required string must also appear EXACTLY ONCE per file, or removing "it"
// would leave a copy behind and the red would never come (the DoD row says so;
// `editAll` is used anyway, and the count is asserted first).

import { check, done, tempRepo, runCheck, cleanUp, copyFile, editAll, put, expectRed, expectGreen } from "../lib/qa.mjs";

const FILES = ["test-engineer.md", "code-engineer.md"];
const REQUIRED = [
  { pin: "docs/decisions/adr/", swap: "docs/decisions/xyz/", says: "does not name docs/decisions/adr/" },
  { pin: "docs/design/tasks.md", swap: "docs/design/plan.md", says: "does not name `docs/design/tasks.md`" },
  { pin: "DoD section", swap: "done part", says: "never says `DoD section`" },
];
const FORBIDDEN = [
  { add: "\n\nThe DoD lives in dod.md.\n", says: "names a file called `dod.md`" },
  { add: "\n\nWrite it in the **Decisions** section of the DoD.\n", says: "still sends a small job's decision to a" },
];

const base = tempRepo();
try {
  expectGreen(runCheck(base, "tools/verify-mount.mjs"), "the untouched copy is green (so every red below is the mutation)");
  for (const file of FILES) {
    const text = copyFile(base, `roles/${file}`);
    for (const { pin } of REQUIRED) {
      const copies = text.split(pin).length - 1;
      check(`roles/${file} holds exactly one copy of \`${pin}\` (it holds ${copies})`, copies === 1, "with two copies, removing one leaves the check green and this case would pass on nothing");
    }
    for (const { add } of FORBIDDEN) {
      const marker = add.includes("dod.md") ? "dod.md" : "**Decisions** section";
      check(`roles/${file} does not already hold \`${marker}\``, !text.includes(marker), "the forbidden string is in the file, so adding it proves nothing");
    }
  }
} finally {
  cleanUp(base);
}

// --- the three required strings, removed one at a time from one file at a time
for (const file of FILES) {
  for (const { pin, swap, says } of REQUIRED) {
    const dir = tempRepo();
    try {
      editAll(dir, `roles/${file}`, pin, swap);
      const run = runCheck(dir, "tools/verify-mount.mjs");
      expectRed(run, `roles/${file} ${says}`, `roles/${file} without \`${pin}\` is red, and the message names the file`);
    } finally {
      cleanUp(dir);
    }
  }
}

// --- the two forbidden strings, added one at a time to one file at a time
for (const file of FILES) {
  for (const { add, says } of FORBIDDEN) {
    const dir = tempRepo();
    try {
      put(dir, `roles/${file}`, copyFile(dir, `roles/${file}`) + add);
      const run = runCheck(dir, "tools/verify-mount.mjs");
      expectRed(run, `roles/${file} ${says}`, `roles/${file} with that string added is red, and the message names the file`);
    } finally {
      cleanUp(dir);
    }
  }
}

done();
