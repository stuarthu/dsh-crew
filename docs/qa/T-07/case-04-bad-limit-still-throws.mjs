// Task T-07 — acceptance check 51 (CRD 0003).
// Removing one setting may not soften the check on the others: a value written
// wrong still has to stop the mount. These values are QA's own — the project's
// own check covers liveAgents: 0.
import { mountCrew, check, done } from "../lib/qa.mjs";

const bad = [
  [{ liveAgents: -1 }, "liveAgents"],
  [{ liveAgents: "abc" }, "liveAgents"],
  [{ liveAgents: 2.5 }, "liveAgents"],
  [{ reviewRounds: 0 }, "reviewRounds"],
  [{ reviewRounds: null }, "reviewRounds"],
];

for (const [limits, field] of bad) {
  const crew = await mountCrew({ plugin: { limits } });
  try {
    check(`limits ${JSON.stringify(limits)} is refused at mount`, crew.thrown !== undefined, "it mounted quietly");
    check(`the error names limits.${field}`,
      (crew.thrown?.message ?? "").includes(`limits.${field}`), crew.thrown?.message ?? "");
    check(`the error says what a good value looks like`,
      /whole number of 1 or more/.test(crew.thrown?.message ?? ""), crew.thrown?.message ?? "");
  } finally {
    crew.cleanUp();
  }
}

// And a good value still mounts, so the check is not simply refusing everything.
const good = await mountCrew({ plugin: { limits: { liveAgents: 1, reviewRounds: 9 } } });
try {
  check("a valid pair of limits still mounts", good.thrown === undefined, good.thrown?.message ?? "");
} finally {
  good.cleanUp();
}

done();
