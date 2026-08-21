// T-54, DoD item 4: while it works, the role MUST run the linter, the type check,
// the project's existing test command and the compiler. "Blind" means the new
// behaviour has no check — it does not mean run nothing.
//
// What it proves: the sentence that stops the whole shape from delivering code
// that does not compile. The DoD cell spells out the failure it prevents: without
// this, "you have no unit test for the new behaviour" reads as "hand it over
// unchecked", and the PM's one first-meeting run gets spent on a syntax error
// instead of on a disagreement. That run is the only signal the shape buys, and it
// cannot be repeated.
//
// PINNING STYLE: FLATTENED.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/code-engineer.md"));

check(
  "the file tells the role to run the linter",
  flatText.includes("the linter"),
  "`lint` is not in the file",
);

check(
  "and the type check",
  flatText.includes("the type check"),
  "the type check is not required",
);

check(
  "and the compiler, or whatever turns the code into something that runs",
  flatText.includes("the compiler"),
  "compilation is not required",
);

check(
  "and the project's own test command",
  flatText.includes("**the project's test command**"),
  "the checks the project already had are not required",
);

check(
  "it says exactly what the role is blind to: the new behaviour, and only that",
  flatText.includes("That is the only thing you are blind to"),
  "the scope of the blindness is not limited",
);

check(
  "it says blind does NOT mean handing over code nothing was run against",
  flatText.includes("It does not mean you hand over code you ran nothing against"),
  "the sentence that stops 'blind' from meaning 'unchecked' is missing",
);

check(
  "it says why: code that does not compile spends the one run this shape gets",
  flatText.includes("spends the one run this shape gets"),
  "the cost of sending broken code is not named",
);

done();
