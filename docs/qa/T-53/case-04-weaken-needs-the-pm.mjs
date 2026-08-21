// T-53, DoD item 6: an assertion may not be weakened to make a conflict go away.
// Only the PM may approve such a change, and the change has to trace back to the
// words of the task row's DoD section.
//
// What it proves: the failure mode that would empty the whole shape of meaning.
// If the half that wrote the unit tests can quietly lower the bar when the merged
// run goes red, then every disagreement disappears into a green run, nothing is
// ever reported, and the document's ambiguity is never found — while the evidence
// says everything passed.
//
// The word `weaken` is deliberately the same one `roles/engineer.md` already
// used. `CRD 0012` item 9 asked for the rule; reusing the existing word instead
// of inventing a new one is why a reader of both files sees one rule, not two.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/test-engineer.md"));

check(
  "the file uses the word `weaken`",
  flatText.includes("weaken"),
  "`weaken` is not in the file — the same word roles/engineer.md already uses",
);

check(
  "only the PM may approve a change to an assertion",
  flatText.includes("Only the PM"),
  "the approver is not named, so the role could decide for itself",
);

check(
  "the change has to trace back to the words of the DoD section",
  flatText.includes("DoD section"),
  "the traceability requirement is missing, so an approved change could still drift from the document",
);

check(
  "the file says a disagreement is the product, not an accident",
  flatText.includes("the disagreement is the product, not an accident"),
  "nothing tells the role that reporting a conflict is success rather than failure",
);

done();
