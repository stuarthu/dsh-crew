// T-56, DoD item 3: the PM brings ONE DEFAULT AND A LIST OF EXCEPTIONS, not one
// question per row — and the reason is written down: a job of fifty tasks is not
// fifty decisions.
//
// What it proves: the user's attention is protected. The phrase
// `list of exceptions` appeared 0 times in this file before this task, so it is
// T-56's own. `CRD 0012` item 12 asked for it because the obvious implementation —
// ask about every row — turns a fifty-task job into fifty interruptions, and a user
// who is asked fifty times stops reading the questions.
//
// PINNING STYLE: FLATTENED, sliced to step 4.

import { check, done, flat, pm, step } from "../lib/qa.mjs";

const flatFour = flat(step(pm(), 4));

check(
  "step 4 says the PM brings a default and a list of exceptions",
  flatFour.includes("You bring a default and a list of exceptions"),
  "the phrase is missing — it was 0 times in this file before this task",
);

check(
  "it says explicitly: not one question per row",
  flatFour.includes("not one question per row"),
  "the thing this rule forbids is not named",
);

check(
  "the reason is there: fifty tasks is not fifty decisions",
  flatFour.includes("A job of fifty tasks is not fifty decisions"),
  "the reason is missing",
);

check(
  "it says protecting the user's attention is half of what the crew is for",
  flatFour.includes("protecting the user's attention"),
  "the principle behind the rule is missing",
);

check(
  "the recommended default is solo unless the job gives a reason",
  flatFour.includes("`solo` unless the job gives you a reason"),
  "no default is recommended, so the PM would have to invent one",
);

check(
  "each exception carries the reason it is on the list",
  flatFour.includes("each with the reason it is on that list"),
  "an exception could be named with no reason",
);

done();
