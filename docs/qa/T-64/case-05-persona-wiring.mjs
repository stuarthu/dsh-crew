// Task T-64 — DoD item 12 (PRD M1 DoD item 12, requirement A5).
// Proves that host/roles-preset.js really hands every crew role its own
// persona: each role of the ROLES table is mounted with `persona` equal to the
// whole trimmed text of its own roles/<personaFile>, and the `rolesDir`
// override reaches every one of them. This behaviour is already correct today —
// the case exists so that taking the line out cannot pass unnoticed.
//
// A real mount, not a string match. `roles-preset.js` is an ES module, so this
// case imports it and calls `apply()` on a context that records every
// `ctx.plugin()` call, then reads the config each role really received. A
// source-level grep for `persona:` would still pass if the value were the wrong
// file, an empty string, or the same file for all of them.
//
// The role names are read from the table, never retyped: the table holds NINE
// spawnable roles today, and `roles/` holds TEN markdown files — the tenth is
// `pm.md`, which is not a role tool at all (host/crew.js registers it as the
// PM's own prompt section). The last two checks cover that tenth file and the
// "nothing is left unwired" half, so "none missed" is true of all ten files
// whatever the table grows to next.
//
// Why a stub package: `@deepseek-ai/dsh-tool-subagent` cannot be installed from
// the public registry (its peer `@deepseek-ai/dsh-tasks` is not published), and
// CI is such a machine — `tools/verify-mount.mjs` skips its whole role-tool half
// there, out loud. So the mount below runs against a copy of `host/` and
// `roles/` next to a tiny stub of that package, and needs the real one nowhere.
// `roles-preset.js` only ever passes the imported module on to `ctx.plugin()` as
// an opaque value, so the stub is faithful for everything asserted here. The
// real package is used by one extra mount at the end, which says out loud when
// it is skipped; every assertion above it runs on every machine.
//
// This copy-and-stub helper is ~25 lines that `docs/qa/T-51/preset-mount.mjs`
// also has. No case in this repository imports another task's folder — shared
// code lives in `docs/qa/lib/` — so the choice was between duplicating it here
// and making T-64 the first case to depend on T-51's files. It is reported as a
// finding for the PM rather than settled by editing the shared library.

import { cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { REPO, check, cleanUp, done, mountCrew, repoFile, tempDir } from "../lib/qa.mjs";

/** Marker exported by the stub, so a check can prove the persona sits on a subagent mount. */
const STUB_NAME = "dsh-tool-subagent-qa-stub";

/** A throwaway copy of the two folders the preset reads, plus the stub of the package it imports. */
function presetCopy() {
  const dir = tempDir("crew-qa-t64-persona-");
  // `roles/` is copied too: readRoleText() resolves personas relative to
  // host/roles.js, so without it every mount would throw for a reason that has
  // nothing to do with this case.
  for (const entry of ["host", "roles"]) cpSync(join(REPO, entry), join(dir, entry), { recursive: true });
  const stub = join(dir, "node_modules", "@deepseek-ai", "dsh-tool-subagent");
  mkdirSync(stub, { recursive: true });
  writeFileSync(join(stub, "package.json"), `${JSON.stringify({
    name: "@deepseek-ai/dsh-tool-subagent",
    version: "0.0.0-qa-stub",
    type: "module",
    exports: "./index.js",
  }, null, 2)}\n`);
  writeFileSync(join(stub, "index.js"), `export const name = "${STUB_NAME}";\n`);
  return dir;
}

/** One module of a copy's `host/` folder. Each copy has its own path, so nothing is cached across mounts. */
const load = (dir, file) => import(pathToFileURL(join(dir, "host", file)).href);

/** Mount a preset module on a context that records every ctx.plugin() call, and never throw at the caller. */
function mount(preset, config) {
  const mounts = [];
  let thrown;
  try {
    preset.apply({ plugin: (plugin, cfg) => mounts.push({ plugin, config: cfg }) }, config);
  } catch (error) {
    thrown = error;
  }
  return { mounts, thrown };
}

/** What a persona value is, in words, for a failure line. */
const describe = (value) => value === undefined
  ? "is missing"
  : typeof value !== "string"
    ? `is a ${typeof value}`
    : value.length === 0
      ? "is an empty string"
      : `is ${value.length} char(s) starting ${JSON.stringify(value.slice(0, 40))}`;

/** An override persona, distinctive per role. Trimmed, because readRoleText() trims. */
const overrideText = (key) => `# override persona for ${key}\n\nThis is not the shipped text.\n`;

const dir = presetCopy();
let tableRoles = [];
let pmFile = "pm.md";
try {
  const { ROLES, PM_PERSONA_FILE } = await load(dir, "roles.js");
  const preset = await load(dir, "roles-preset.js");
  tableRoles = ROLES;
  pmFile = PM_PERSONA_FILE;
  const shipped = (file) => readFileSync(join(dir, "roles", file), "utf8").trim();

  console.log(`note  the role table holds ${ROLES.length} role(s): ${ROLES.map((role) => role.key).join(", ")}`);
  check("the role table is not empty, so the loop below really checks something", ROLES.length > 0, `${ROLES.length} role(s)`);

  const run = mount(preset, {});
  check("mounting host/roles-preset.js does not throw", run.thrown === undefined, run.thrown?.message ?? "");
  check(
    `one mount per role of the table, in table order (${ROLES.length} expected)`,
    run.mounts.length === ROLES.length && run.mounts.every((m, index) => m.config?.toolName === ROLES[index].toolName),
    `${run.mounts.length} mount(s): ${run.mounts.map((m) => m.config?.toolName ?? "(no toolName)").join(", ")}`,
  );

  // The heart of it: one check per role, naming that role, so a single role
  // losing its persona says which one — not just "something is wrong".
  for (const [index, role] of ROLES.entries()) {
    const persona = run.mounts[index]?.config?.persona;
    const want = shipped(role.personaFile);
    check(
      `${role.key} (${role.toolName}) is mounted with the whole text of roles/${role.personaFile} as its persona`,
      typeof persona === "string" && persona.length > 0 && persona === want,
      `persona ${describe(persona)}; roles/${role.personaFile} is ${want.length} char(s) starting ${JSON.stringify(want.slice(0, 40))}`,
    );
  }

  check(
    "every persona is mounted on a @deepseek-ai/dsh-tool-subagent instance, not on some other plugin",
    run.mounts.length > 0 && run.mounts.every((m) => m.plugin?.name === STUB_NAME),
    run.mounts.map((m) => String(m.plugin?.name)).join(", "),
  );

  const personas = run.mounts.map((m) => m.config?.persona);
  check(
    "no two roles are handed the same persona",
    new Set(personas).size === ROLES.length,
    `${new Set(personas).size} distinct value(s) across ${ROLES.length} role(s)`,
  );
  check(
    `no child role is handed the PM's own roles/${PM_PERSONA_FILE}`,
    !personas.includes(shipped(PM_PERSONA_FILE)),
    ROLES.filter((_, index) => personas[index] === shipped(PM_PERSONA_FILE)).map((role) => role.key).join(", "),
  );

  // Nothing left unwired: a persona file no role names would never be mounted,
  // and the loop above could not notice it.
  const files = readdirSync(join(dir, "roles")).filter((name) => name.endsWith(".md")).sort();
  const spawnable = files.filter((name) => name !== PM_PERSONA_FILE);
  const wired = ROLES.map((role) => role.personaFile).sort();
  check(
    `every roles/*.md except ${PM_PERSONA_FILE} is the persona file of exactly one role (${spawnable.length} file(s))`,
    JSON.stringify(spawnable) === JSON.stringify(wired),
    `roles/ holds ${JSON.stringify(spawnable)}; the table names ${JSON.stringify(wired)}`,
  );

  // The second argument of readRoleText(role.personaFile, rolesDir): a user's
  // own folder must reach every role, and a folder holding only one file must
  // leave the other roles on the shipped text.
  const all = tempDir("crew-qa-t64-override-all-");
  const one = tempDir("crew-qa-t64-override-one-");
  try {
    for (const role of ROLES) writeFileSync(join(all, role.personaFile), overrideText(role.key));
    const overridden = mount(preset, { rolesDir: all });
    const wrong = ROLES.filter((role, index) => overridden.mounts[index]?.config?.persona !== overrideText(role.key).trim());
    check(
      "rolesDir reaches every role: each one reads its own file out of the override folder",
      overridden.thrown === undefined && wrong.length === 0,
      `${overridden.thrown?.message ?? ""} role(s) that did not get their override: ${wrong.map((role) => role.key).join(", ") || "none"}`,
    );

    // The last role of the table: the one a loop that stopped early would miss.
    const only = ROLES[ROLES.length - 1];
    writeFileSync(join(one, only.personaFile), overrideText(only.key));
    const partly = mount(preset, { rolesDir: one });
    check(
      `${only.key}: one file in rolesDir replaces that role's shipped persona`,
      partly.mounts[ROLES.length - 1]?.config?.persona === overrideText(only.key).trim(),
      describe(partly.mounts[ROLES.length - 1]?.config?.persona),
    );
    const moved = ROLES.slice(0, -1).filter((role, index) => partly.mounts[index]?.config?.persona !== shipped(role.personaFile));
    check(
      "the roles the override folder says nothing about keep their shipped persona",
      partly.thrown === undefined && moved.length === 0,
      `${partly.thrown?.message ?? ""} role(s) that changed: ${moved.map((role) => role.key).join(", ") || "none"}`,
    );
  } finally {
    cleanUp(all);
    cleanUp(one);
  }
} finally {
  cleanUp(dir);
}

// The tenth persona file. `pm.md` is not in the role table and is not mounted by
// the preset at all: host/crew.js reads it and registers it as the PM's own
// prompt section. Checked here so "none missed" covers all ten files under
// roles/, and so a change that unhooked the PM's own persona could not hide
// behind nine green roles.
const crew = await mountCrew();
try {
  const pmText = repoFile(`roles/${pmFile}`).trim();
  check(
    `the tenth persona file, roles/${pmFile}, is the text of the PM's own prompt section`,
    crew.thrown === undefined && crew.sections.length === 1 && pmText.length > 0 && crew.prompt.includes(pmText),
    `${crew.thrown?.message ?? ""} ${crew.sections.length} section(s), prompt is ${crew.prompt.length} char(s), roles/${pmFile} is ${pmText.length}`,
  );
} finally {
  crew.cleanUp();
}

// One extra mount, against the REAL @deepseek-ai/dsh-tool-subagent, from the
// repository itself rather than a copy. It is allowed to be skipped — that
// package cannot be installed from the public registry, and CI has no copy of
// it — and it says so out loud when it is. Everything above ran without it, so a
// skip here weakens nothing and can never turn a missing package into a pass.
let real;
try {
  real = await import(pathToFileURL(join(REPO, "host", "roles-preset.js")).href);
} catch (error) {
  console.log(`note  SKIPPED the real-package mount: host/roles-preset.js could not be imported (${String(error?.code ?? error?.message ?? error)}).`);
  console.log("note  SKIPPED because @deepseek-ai/dsh-tool-subagent is not installable from the public registry; the stub mount above covered the same wiring.");
}
if (real !== undefined) {
  const run = mount(real, {});
  const wrong = tableRoles.filter((role, index) => run.mounts[index]?.config?.persona !== repoFile(`roles/${role.personaFile}`).trim());
  check(
    "the same mount against the real @deepseek-ai/dsh-tool-subagent gives every role its own persona",
    run.thrown === undefined && run.mounts.length === tableRoles.length && wrong.length === 0,
    `${run.thrown?.message ?? ""} ${run.mounts.length} mount(s); role(s) with the wrong persona: ${wrong.map((role) => role.key).join(", ") || "none"}`,
  );
}

done();
