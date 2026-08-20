// Task T-05 — acceptance check 31.
// A folder-shaped approvalFile would silently protect the wrong name — every
// `crew/...` branch push refused, and the real approval file left open for any
// agent to create. It has to fail at mount, with an error that says how to fix
// it. No file is read or written by this case.
import { join } from "node:path";
import { REPO, tempDir, cleanUp, check, done } from "../lib/qa.mjs";

const guard = await import(join(REPO, "host", "git-guard.js"));
const dir = tempDir("crew-qa-folder-");
try {
  const shapes = [
    [`${dir}/`, "a trailing slash"],
    [`${dir}\\`, "a trailing backslash"],
    ["~/.dsh/crew/", "the mistake CRD 0001 describes"],
    ["/", "a path whose basename is empty"],
  ];

  for (const [shape, note] of shapes) {
    let thrown;
    try {
      guard.apply({ on: () => {} }, { approvalFile: shape });
    } catch (error) {
      thrown = error;
    }
    check(`mounting with "${shape}" throws`, thrown !== undefined, `${note} — it mounted quietly`);
    const message = thrown?.message ?? "";
    check(`the error for "${shape}" names the setting`, message.includes("approvalFile"), message);
    check(`the error for "${shape}" says what is wrong and how to fix it`,
      /must be a file path, not a folder/.test(message) && /for example/.test(message), message);
  }

  // The same check must not reject an ordinary path, or the guard never mounts.
  let refused;
  try {
    guard.apply({ on: () => {} }, { approvalFile: join(dir, "deep", "my-approval.flag") });
  } catch (error) {
    refused = error;
  }
  check("an ordinary file path still mounts", refused === undefined, refused?.message ?? "");
} finally {
  cleanUp(dir);
}

done();
