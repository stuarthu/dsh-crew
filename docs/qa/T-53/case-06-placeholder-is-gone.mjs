// T-53, DoD item 10: T-51's placeholder marker is gone from this file.
//
// ONE-WAY BY DESIGN, and this is the case `ADR 0013` was written for. The handoff
// guard has two directions: "the marker must be there" while T-51 owns the file,
// and "the marker must be gone" once T-53 has written the real persona. Only the
// second direction can live in a permanent case — a case asserting the first would
// have to be deleted the moment the handoff completed, which is not a test, it is
// a reminder. The task table says exactly this in T-53's item 10.
//
// What it proves: the file really was rewritten, and not merely appended to. A
// placeholder left in a shipped prompt is text the model reads and believes.
//
// PINNING STYLE: FLATTENED, plus a floor on the file's size so that "the marker
// is gone" cannot be satisfied by an empty or truncated file.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/test-engineer.md");

check(
  "T-51's placeholder marker is gone",
  !flat(text).includes("M1-PLACEHOLDER"),
  "the placeholder is still in a prompt that ships to users",
);

check(
  "no other placeholder wording was left behind",
  !flat(text).includes("PLACEHOLDER") && !flat(text).includes("TODO") && !flat(text).includes("TBD"),
  "some other placeholder marker is in the file",
);

check(
  "the file is a real persona, not a stub the marker was merely deleted from",
  text.length > 3000,
  `the file is only ${text.length} characters long — verify-mount.mjs only requires 500, which a stub can pass`,
);

check(
  "the file holds no `{{`, which dsh would try to interpolate",
  !text.includes("{{"),
  "an unknown `{{name}}` would break the prompt at mount time",
);

done();
