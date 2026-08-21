// T-53, DoD item 1: the file says at the very top that this role is a programmer
// and not QA — it writes unit tests that live in the project's own test suite,
// and QA is a different role whose cases live under `docs/qa/`.
//
// What it proves: the confusion the user raised has an answer in the first thing
// the agent reads. `crew_test_engineer` reads like "tester", and a persona that
// let the agent believe it was QA would produce acceptance cases in `docs/qa/`
// instead of unit tests in the project suite — the wrong artefact, in the wrong
// place, at the wrong time, and the paired shape would buy nothing.
//
// PINNING STYLE: LINE-BASED for the "first 20 lines" boundary (the DoD requires
// the statement to be at the top, and a line count is exactly what "at the top"
// means), FLATTENED for the sentences inside that window.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const text = repoFile("roles/test-engineer.md");
const head = flat(text.split("\n").slice(0, 20).join("\n"));

check(
  "the first 20 lines say it writes unit tests",
  head.includes("unit test"),
  "the noun `unit test` is not in the opening — the DoD requires it in the first 20 lines",
);

check(
  "the first 20 lines say it is a programmer, not QA",
  head.includes("You are a programmer, not QA"),
  "the opening does not separate this role from QA",
);

check(
  "the first 20 lines say it writes no product code at all",
  head.includes("no product code at all"),
  "the opening does not rule out product code",
);

check(
  "the opening says the unit tests live in the project's own test suite",
  head.includes("project's own test suite"),
  "the home of what it writes is not named",
);

check(
  "the file says QA is a different role, whose cases live under docs/qa/",
  flat(text).includes("QA is a different role") && flat(text).includes("`docs/qa/`"),
  "the file does not point QA's work at docs/qa/",
);

check(
  "it says outright that it writes nothing in docs/qa/ and never writes an acceptance case",
  flat(text).includes("You write nothing there, and you never write an acceptance case"),
  "the boundary against writing QA's artefact is missing",
);

done();
