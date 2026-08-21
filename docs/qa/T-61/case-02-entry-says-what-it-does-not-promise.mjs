// T-61, DoD item 2: the same entry says what the shape does NOT promise — a green
// first meeting means only that the two readings matched.
//
// What it proves: the changelog does not oversell. This is the sentence a user is
// most likely to quote back, and the one most likely to be dropped for length. If a
// user reads the entry and concludes that a green paired run means their document was
// unambiguous, they will trust a document that two agents merely misread the same
// way — the exact failure `CRD 0012` item 15 exists to prevent, arriving through the
// changelog instead of through a report.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("CHANGELOG.md"));

check(
  "the entry has its own paragraph on what a green first meeting does not prove",
  flatText.includes("What a green first meeting does not prove"),
  "the limits are not given their own paragraph",
);

check(
  "it says green says exactly one thing: the two readings matched",
  flatText.includes("it says exactly one thing: **the two readings matched**"),
  "the narrow claim is missing",
);

check(
  "it says green does NOT say the document was clear",
  flatText.includes("It does **not** say the document was clear"),
  "the stronger claim is not ruled out",
);

check(
  "it says no report may claim that it does",
  flatText.includes("no report may claim that it does"),
  "the ban is missing",
);

check(
  "it explains the mechanism: two readers can take the same wrong meaning",
  flatText.includes("Two readers can take the same wrong meaning out of one weak sentence"),
  "the mechanism is missing, so the limit reads as modesty rather than as a real blind spot",
);

check(
  "it names crew_qa as the net, and says QA is unchanged",
  flatText.includes("`crew_qa`") && flatText.includes("is unchanged"),
  "the net for a shared misreading is not named",
);

check(
  "it says the code review is unchanged too",
  flatText.includes("So is the code review"),
  "the second net is missing",
);

done();
