// Task T-07 — acceptance check 48 (CRD 0003).
// The per-job agent cap is gone. Checked where it would still bite: the prompt
// the PM is really given, and the places in host/crew.js that built it.
import { repoFile, mountCrew, check, done } from "../lib/qa.mjs";

const source = repoFile("host/crew.js");
const defaults = source.match(/const DEFAULT_LIMITS = \{[^}]*\}/)?.[0] ?? "";

check("DEFAULT_LIMITS was found", defaults.length > 0, source.slice(0, 200));
check("DEFAULT_LIMITS has no agentsPerJob", !defaults.includes("agentsPerJob"), defaults);
check("apply() makes no limitOf call for agentsPerJob",
  !/limitOf\(config\?\.limits\?\.agentsPerJob/.test(source), "the limitOf call is still there");

const crew = await mountCrew();
try {
  check("the mount succeeded", crew.thrown === undefined, crew.thrown?.message ?? "");
  check("the PM prompt never names agentsPerJob", !crew.prompt.includes("agentsPerJob"));
  check("the PM prompt has no per-job agent limit line",
    !/agents for one job/.test(crew.prompt),
    crew.prompt.split("\n").filter(line => /agents/.test(line)).join("\n"));
  const limitLines = crew.prompt.split("\n").filter(line => line.startsWith("- crew agents") || line.startsWith("- review rounds"));
  check("only two limits are promised to the PM", limitLines.length === 2, limitLines.join(" | "));
} finally {
  crew.cleanUp();
}

done();
