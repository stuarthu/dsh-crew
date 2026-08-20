// Task T-05 — acceptance check 29.
// A source-shape check, and it says so: the `-` in the boundary set must be
// escaped rather than merely sitting last, and the pattern must be built once
// per mount so a broken pattern fails startup, not every later bash call.
import { repoFile, mountGuard, check, done } from "../lib/qa.mjs";

const source = repoFile("host/git-guard.js");
const boundary = source.match(/const boundary = "([^"]*)"/);

check("the boundary set is a single string literal", boundary !== null, "not found");
check("the - in the boundary set is escaped, not positional",
  (boundary?.[1] ?? "").includes("\\\\-"), JSON.stringify(boundary?.[1]));

const built = [...source.matchAll(/new RegExp\(/g)].length;
check("the pattern is built in exactly one place", built === 1, `found ${built} new RegExp( calls`);

const apply = source.slice(source.indexOf("export function apply("));
check("the build happens on the mount path, not inside the per-command handler",
  apply.includes("approvalNamePattern(approvalFile)")
  && apply.indexOf("approvalNamePattern(approvalFile)") < apply.indexOf('ctx.on("tools/execute"'),
  "approvalNamePattern is called after the tools/execute handler is registered");

// And the escaped set still behaves: `-` is a name character, so a name that
// only ends with the approval file's name is not the approval file.
const guard = await mountGuard();
try {
  const ends = await guard.send("cat build-push-ok");
  check("a name ending in -push-ok is allowed", ends === undefined, `blocked: ${ends}`);
  const bare = await guard.send("touch push-ok");
  check("the bare name is still blocked", bare !== undefined, "allowed");
} finally {
  guard.cleanUp();
}

done();
