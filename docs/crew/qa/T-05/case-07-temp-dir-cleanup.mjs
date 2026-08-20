// Task T-05 — acceptance check 33.
// verify-guard.mjs must remove its temporary folder even when a case throws.
// Proven by making a COPY of the repository throw on purpose and then looking
// for the folder it created.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tempRepo, runCheck, cleanUp, repoFile, check, done } from "../lib/qa.mjs";

const source = repoFile("tools/verify-guard.mjs");
check("the case section is wrapped in try / finally",
  /\ntry \{[\s\S]*\n\} finally \{[\s\S]*rmSync\(workdir/.test(source), "no try / finally around the cases");

const leftovers = () => new Set(readdirSync(tmpdir()).filter(name => name.startsWith("crew-guard-")));
const before = leftovers();

const dir = tempRepo();
try {
  const file = join(dir, "tools", "verify-guard.mjs");
  const original = readFileSync(file, "utf8");
  writeFileSync(file, original.replace("\ntry {\n", '\ntry {\n  throw new Error("QA injected failure");\n'));
  const broken = runCheck(dir, "tools/verify-guard.mjs");
  check("the injected failure really stopped the script", broken.status !== 0, broken.out.slice(-400));
  check("the injected failure is the one that came out", /QA injected failure/.test(broken.out), broken.out.slice(-400));
  const after = leftovers();
  const kept = [...after].filter(name => !before.has(name));
  check("no temporary folder was left behind", kept.length === 0, kept.join(", "));
} finally {
  cleanUp(dir);
}

done();
