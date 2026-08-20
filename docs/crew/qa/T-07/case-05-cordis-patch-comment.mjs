// Task T-07 — acceptance check 52 (CRD 0003).
// The commented example in cordis.patch.yml is how these options are documented,
// so it may not still offer a setting the product has removed.
import { repoFile, check, done } from "../lib/qa.mjs";

const patch = repoFile("cordis.patch.yml");
const limits = patch.slice(patch.indexOf("limits:"), patch.indexOf("limits:") + 400);

check("the limits example was found", patch.includes("limits:"), patch.slice(0, 200));
check("cordis.patch.yml no longer offers agentsPerJob", !patch.includes("agentsPerJob"),
  `found at index ${patch.indexOf("agentsPerJob")}`);
check("the liveAgents example says 20", /liveAgents:\s*20\b/.test(limits), limits);
check("the reviewRounds example is still 3", /reviewRounds:\s*3\b/.test(limits), limits);
check("both lines are still commented examples, not live settings",
  limits.split("\n").filter(line => /liveAgents|reviewRounds/.test(line)).every(line => line.trim().startsWith("#")),
  limits);

done();
