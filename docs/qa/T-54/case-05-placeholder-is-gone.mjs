// T-54, DoD item 11: T-51's placeholder marker is gone from this file.
//
// ONE-WAY BY DESIGN, for the reason T-53's item 10 gives and `ADR 0013` settles:
// of the handoff's two directions, only "the marker must be gone" can live in a
// permanent case. A case demanding the marker be PRESENT would have to be deleted
// the day the handoff finished, and a case that must be deleted is a reminder, not
// a test.
//
// What it proves: the file really was rewritten. A placeholder left in a shipped
// prompt is text the model reads and acts on.
//
// PINNING STYLE: FLATTENED, plus a size floor so an emptied file cannot pass.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/code-engineer.md");

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
  "the file is a real persona, not a stub the marker was deleted from",
  text.length > 3000,
  `the file is only ${text.length} characters long — verify-mount.mjs only requires 500`,
);

check(
  "the file holds no `{{`, which dsh would try to interpolate",
  !text.includes("{{"),
  "an unknown `{{name}}` would break the prompt at mount time",
);

done();
