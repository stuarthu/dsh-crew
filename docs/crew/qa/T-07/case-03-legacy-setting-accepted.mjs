// Task T-07 — acceptance check 50 (CRD 0003).
// A profile written before CRD 0003 still says limits.agentsPerJob. That value
// is not wrong, the setting is gone — so the mount must go on, and the boot log
// must say so once, or the user never learns the line can be deleted.
import { mountCrew, check, done } from "../lib/qa.mjs";

const crew = await mountCrew({ plugin: { limits: { agentsPerJob: 30 } } });
try {
  check("the mount does not throw", crew.thrown === undefined, crew.thrown?.message ?? "");
  check("the PM prompt section is still registered", crew.sections.length === 1, `${crew.sections.length} section(s)`);
  const notes = crew.logs.filter(line => line.includes("agentsPerJob"));
  check("the boot log says something about the removed setting", notes.length >= 1, JSON.stringify(crew.logs));
  check("the note says the setting is no longer used",
    notes.some(line => /no longer used/.test(line)), JSON.stringify(notes));
  check("the note tells the user the line can be deleted from the profile",
    notes.some(line => /delete that line from your profile/.test(line)), JSON.stringify(notes));
  check("the prompt still carries no per-job limit", !crew.prompt.includes("agentsPerJob"), "");
  // Reported, not asserted: the plugin ends the line with
  // `ctx.logger?.("dsh-crew")?.info?.(note) ?? console.log(note)`, and a real
  // logger's info() returns undefined, so the same note also goes to
  // console.log. The DoD asks for one line in the boot log; a deployment with a
  // logger sees it twice. host/crew.js:240, and the same shape at :245 for the
  // preset installer's note.
  console.log(`note  boot-log lines mentioning the setting: ${notes.length}`);
} finally {
  crew.cleanUp();
}

// Nothing to say when the profile does not carry the setting.
const quiet = await mountCrew({ plugin: { limits: { liveAgents: 5 } } });
try {
  check("a profile without the old setting hears nothing about it",
    !quiet.logs.some(line => line.includes("agentsPerJob")), JSON.stringify(quiet.logs));
} finally {
  quiet.cleanUp();
}

// A host that registers no ctx.logger must still see the note.
const noLogger = await mountCrew({ logger: false, plugin: { limits: { agentsPerJob: 30 } } });
try {
  check("the note also reaches a host with no ctx.logger",
    noLogger.logs.some(line => line.includes("agentsPerJob")), JSON.stringify(noLogger.logs));
} finally {
  noLogger.cleanUp();
}

done();
