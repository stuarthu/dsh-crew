// Task T-07 — acceptance check 49 (CRD 0003).
// liveAgents defaults to 20 now; reviewRounds is untouched at 3. Read from the
// prompt the PM really gets, so a default that never reaches the prompt fails.
import { repoFile, mountCrew, check, done } from "../lib/qa.mjs";

const defaults = repoFile("host/crew.js").match(/const DEFAULT_LIMITS = \{[^}]*\}/)?.[0] ?? "";

check("DEFAULT_LIMITS.liveAgents is 20", /liveAgents:\s*20\b/.test(defaults), defaults);
check("DEFAULT_LIMITS.reviewRounds is still 3", /reviewRounds:\s*3\b/.test(defaults), defaults);

const crew = await mountCrew();
try {
  check("the PM is told 20 agents may be awake at once",
    crew.prompt.includes("- crew agents awake at the same time: 20"),
    crew.prompt.split("\n").filter(line => line.startsWith("- crew agents")).join(" | "));
  check("the PM is told 3 review rounds",
    crew.prompt.includes("- review rounds before you bring the disagreement to the user: 3"),
    crew.prompt.split("\n").filter(line => line.startsWith("- review rounds")).join(" | "));
} finally {
  crew.cleanUp();
}

// A configured value still wins over the default.
const configured = await mountCrew({ plugin: { limits: { liveAgents: 7 } } });
try {
  check("a configured liveAgents still reaches the prompt",
    configured.prompt.includes("- crew agents awake at the same time: 7"),
    configured.prompt.split("\n").filter(line => line.startsWith("- crew agents")).join(" | "));
} finally {
  configured.cleanUp();
}

done();
