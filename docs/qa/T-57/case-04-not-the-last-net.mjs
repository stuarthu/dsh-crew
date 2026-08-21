// T-57, DoD item 4: the paired shape is NOT the last net. QA — afterwards, blind,
// writing its own cases — and the code review itself stay exactly as they were, and
// they are the exits for a correlated misreading.
//
// What it proves: the reviewer's own job does not shrink because a first meeting
// came out green. This is the practical danger of a shape that looks like extra
// verification: everyone downstream relaxes. The passage has to say, to the
// reviewer's face, that its work is unchanged.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-reviewer.md"));

check(
  "the file says this shape is not the last net",
  flatText.includes("not the last net"),
  "the sentence is missing",
);

check(
  "QA is named as a net, with the three properties that make it one",
  flatText.includes("QA") && flatText.includes("afterwards")
    && (flatText.includes("blind") || flatText.includes("its own cases")),
  "QA is not described as coming after, unsighted, and writing its own cases",
);

check(
  "the reviewer is told its own job does not shrink on a green first meeting",
  flatText.includes("your own")
    || flatText.includes("does not shrink"),
  "nothing stops the reviewer relaxing after a green first meeting",
);

check(
  "the file keeps calling the blind kind common",
  flatText.includes("the blind kind is common"),
  "the frequency of the failure the nets exist for is not stated",
);

check(
  "it says the blind kind arrives wearing the costume of the best possible result",
  flatText.includes("costume of the best possible result"),
  "the sentence that makes the danger memorable is gone",
);

done();
