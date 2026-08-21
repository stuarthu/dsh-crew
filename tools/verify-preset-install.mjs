// Checks the crew-preset installer, including what an UPGRADE does to files the
// user edited. Run it with:  node tools/verify-preset-install.mjs
//
// Everything runs against a throwaway DSH_HOME, so your own
// ~/.dsh/.agent-presets is never read or written.
//
// The case that matters most is the upgrade. Role tool filters and per-role
// models are configured inside the installed preset (`agent.cordis.yml`), and a
// version bump deletes and rewrites that folder. Losing someone's `roleAllow`
// list without a word would be a bad way to find out.

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { logCapture, recording, timesSaid } from "./lib/boot-log.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL  ${message}`); };
const ok = (message) => console.log(`ok    ${message}`);

const crew = await import("../host/crew.js");

/**
 * Fake Cordis context that captures the boot log.
 *
 * The boot-log half — `logs`, `loggerLogs`, `consoleLogs`, `effect`, `logger`,
 * and the `logger` option — comes from tools/lib/boot-log.mjs, shared with
 * tools/verify-mount.mjs, so the two scripts cannot drift apart. This file
 * checks the installer, not the prompt, so it records nothing else: the prompt
 * section and the mounted plugins are thrown away.
 *
 * @param options - passed to `logCapture`; `logger: false` is a host that
 *   registers none, any other value is put in `ctx.logger` as it is
 */
function fakeContext(options) {
  return {
    ...logCapture(options),
    systemPrompt: { section: () => {}, context: () => {} },
    plugin: () => {},
  };
}

/**
 * Run the plugin against a throwaway harness home and collect every boot-log
 * line it wrote, through `ctx.logger` or through the `console.log` fallback.
 *
 * `DSH_HOME` is put back the way it was, in a `finally`, exactly as
 * tools/verify-mount.mjs does it: nothing in these checks may leave the real
 * ~/.dsh in reach of the next line of code.
 *
 * @param home - the throwaway DSH_HOME to install into
 * @param config - plugin config for this mount
 * @param options - `{ logger }`, as `fakeContext` above
 * @returns the fake context, with `logs` holding both paths' lines and
 *   `loggerLogs` / `consoleLogs` saying which path each line took
 */
function installCapturingLogs(home, config = {}, options) {
  const ctx = fakeContext(options);
  const previous = process.env.DSH_HOME;
  process.env.DSH_HOME = home;
  try {
    return recording(ctx, (context) => crew.apply(context, config));
  } finally {
    if (previous === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = previous;
  }
}

/** Run the plugin against a fresh throwaway harness home. */
function install(home, config = {}) {
  return installCapturingLogs(home, config).logs.join("\n");
}

/**
 * Every throwaway DSH_HOME this run created. Only these exact paths are ever
 * removed -- no pattern, no glob, so nothing outside this run can be deleted.
 */
const homes = [];

/** Make a throwaway DSH_HOME and remember it, so the cleanup can remove it. */
function makeHome() {
  const dir = mkdtempSync(join(tmpdir(), "crew-home-"));
  homes.push(dir);
  return dir;
}

/** Remove exactly these folders. Safe to call twice, and on a folder already gone. */
function removeHomes(dirs) {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
}

// Every case runs inside this block so the `finally` below always removes the
// throwaway homes, even when a case throws part way through.
try {
  const home = makeHome();
  const target = join(home, ".agent-presets", "crew");
  const stamp = join(target, ".installed-by-dsh-crew");
  const preset = join(target, "agent.cordis.yml");

  // 1. Fresh machine: the preset lands, stamped with this version.
  const first = install(home);
  if (!existsSync(join(target, "preset.yml")) || !existsSync(preset)) fail("a fresh install did not write the preset files");
  else if (readFileSync(stamp, "utf8").trim() !== version) fail(`stamp says "${readFileSync(stamp, "utf8").trim()}", expected ${version}`);
  else if (!readFileSync(preset, "utf8").includes("dsh-crew/host/roles-preset.js")) fail("the installed preset does not load the role tools");
  else if (!first.includes(version)) fail(`the boot log does not name the version: ${first}`);
  else ok(`fresh install writes the crew preset, stamped ${version}`);

  // 2. Same version: nothing is copied, nothing is said.
  writeFileSync(join(target, "marker"), "x");
  const again = install(home);
  if (!existsSync(join(target, "marker"))) fail("an unchanged version re-copied the folder");
  else if (again !== "") fail(`an unchanged version logged something: ${again}`);
  else ok("same version copies nothing and logs nothing");
  rmSync(join(target, "marker"));

  // 3. THE UPGRADE, with the user's own settings in the preset. Their file must
  //    survive as a .bak, and the log must tell them to re-apply it.
  const mine = `${readFileSync(preset, "utf8")}\n#   roleModels: { engineer: { model: 'my-model' } }\n`;
  writeFileSync(preset, mine);
  writeFileSync(join(target, "notes.md"), "my own file\n");
  writeFileSync(stamp, "0.0.1\n");
  const upgrade = install(home);

  if (readFileSync(stamp, "utf8").trim() !== version) fail("the upgrade did not refresh the stamp");
  else if (readFileSync(preset, "utf8") === mine) fail("the upgrade did not replace the edited preset file");
  else if (!existsSync(`${preset}.bak`)) fail("the upgrade threw away the user's edited agent.cordis.yml");
  else if (readFileSync(`${preset}.bak`, "utf8") !== mine) fail("the kept copy is not what the user had");
  else if (!existsSync(join(target, "notes.md.bak"))) fail("a file the user added to the preset folder was not kept");
  else if (!upgrade.includes("agent.cordis.yml.bak")) fail(`the boot log does not name the kept file: ${upgrade}`);
  else if (!/re-apply/i.test(upgrade)) fail("the boot log does not tell the user to re-apply their settings");
  else ok("upgrade keeps edited files as .bak and says so in the boot log");

  // 4. An untouched install upgrades quietly: no .bak clutter for people who
  //    never edited anything.
  const clean = makeHome();
  install(clean);
  writeFileSync(join(clean, ".agent-presets", "crew", ".installed-by-dsh-crew"), "0.0.1\n");
  const quiet = install(clean);
  if (existsSync(join(clean, ".agent-presets", "crew", "agent.cordis.yml.bak"))) fail("an unedited upgrade left a pointless .bak file");
  else if (/re-apply/i.test(quiet)) fail("an unedited upgrade warned about settings the user never made");
  else ok("an unedited install upgrades quietly");

  // 5. A `crew` preset this plugin did not write is never touched.
  const foreign = makeHome();
  const foreignPreset = join(foreign, ".agent-presets", "crew");
  mkdirSync(foreignPreset, { recursive: true });
  writeFileSync(join(foreignPreset, "preset.yml"), "name: Mine\n");
  const left = install(foreign);
  if (readFileSync(join(foreignPreset, "preset.yml"), "utf8") !== "name: Mine\n") fail("a preset dsh-crew did not write was overwritten");
  else if (!left.includes("left the existing")) fail(`the boot log does not report the untouched preset: ${left}`);
  else ok("a crew preset written by someone else is left alone and reported");

  // 6. installPreset: false writes nothing at all.
  const off = makeHome();
  install(off, { installPreset: false });
  if (existsSync(join(off, ".agent-presets"))) fail("installPreset: false still wrote the preset");
  else ok("installPreset: false writes nothing");

  // 7. A case that throws still gets its folder removed. This runs the same
  //    remover through a `finally`, so the promise is tested rather than
  //    trusted, without having to break the run.
  const doomed = makeHome();
  let thrown = "";
  try {
    install(doomed);
    throw new Error("a case blew up");
  } catch (error) {
    thrown = error.message;
  } finally {
    removeHomes([doomed]);
  }
  if (thrown !== "a case blew up") fail(`the throwing case did not throw: ${thrown}`);
  else if (existsSync(doomed)) fail("a case that threw left its throwaway DSH_HOME behind");
  else ok("a case that throws still has its temporary folder removed");

  // 8. ONE note, ONE line. QA found the boot log saying every note twice: the
  //    old call site handed the note to the logger and then fell back to the
  //    console as well, because a real logger's `info()` returns undefined and
  //    `??` reads that as "nothing happened". The install and .bak notes are
  //    written on this file's code path, so the count has to be taken here —
  //    with a logger in place, the second copy goes to the real terminal, and a
  //    case that only reads the logger's lines would never see it.
  const INSTALL_NOTE = `installed the "crew" agent preset`;

  const freshLogged = installCapturingLogs(makeHome());
  const freshSaid = timesSaid(freshLogged, INSTALL_NOTE);
  if (freshSaid !== 1) {
    fail(`with a logger the install note was written ${freshSaid} time(s), expected exactly 1 (logged: ${JSON.stringify(freshLogged.logs)})`);
  } else if (freshLogged.consoleLogs.length !== 0) {
    fail(`with a logger the install note must go through the logger only (logger: ${JSON.stringify(freshLogged.loggerLogs)}, console: ${JSON.stringify(freshLogged.consoleLogs)})`);
  } else ok("with a logger the install note is said exactly once, through the logger");

  // Not every host registers a logger, so the same note has a second path out,
  // and it must be said once there too — not zero times, and not twice.
  const freshQuiet = installCapturingLogs(makeHome(), {}, { logger: false });
  const freshQuietSaid = timesSaid(freshQuiet, INSTALL_NOTE);
  if (freshQuietSaid !== 1) {
    fail(`on a host with no ctx.logger the install note was written ${freshQuietSaid} time(s), expected exactly 1 (logged: ${JSON.stringify(freshQuiet.logs)})`);
  } else ok("with no ctx.logger the install note is said exactly once, through console.log");

  /** A throwaway home with a crew preset dsh-crew wrote one version ago, holding a file the user edited. */
  const upgradeHome = () => {
    const home = makeHome();
    const dir = join(home, ".agent-presets", "crew");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, ".installed-by-dsh-crew"), "0.0.1\n");
    // Different from the shipped file, so the upgrade has something to keep.
    writeFileSync(join(dir, "agent.cordis.yml"), "# my own roleAllow edit\n");
    return home;
  };

  // The .bak note is the one a user MUST read — it names the settings they have
  // to re-apply. Said twice, it reads like the upgrade ran twice.
  const keptLogged = installCapturingLogs(upgradeHome());
  const keptSaid = timesSaid(keptLogged, ".bak");
  if (keptSaid !== 1) {
    fail(`with a logger the upgrade's .bak note was written ${keptSaid} time(s), expected exactly 1 (logged: ${JSON.stringify(keptLogged.logs)})`);
  } else if (keptLogged.consoleLogs.length !== 0) {
    fail(`with a logger the .bak note must not also go to console.log (console: ${JSON.stringify(keptLogged.consoleLogs)})`);
  } else ok("with a logger the upgrade's .bak note is said exactly once, through the logger");

  const keptQuiet = installCapturingLogs(upgradeHome(), {}, { logger: false });
  const keptQuietSaid = timesSaid(keptQuiet, ".bak");
  if (keptQuietSaid !== 1) {
    fail(`on a host with no ctx.logger the upgrade's .bak note was written ${keptQuietSaid} time(s), expected exactly 1 (logged: ${JSON.stringify(keptQuiet.logs)})`);
  } else ok("with no ctx.logger the upgrade's .bak note is said exactly once, through console.log");

} finally {
  removeHomes(homes);
}

// 9. Nothing this run created is left in /tmp. This case runs last, after every
//    assertion above has read what it needed out of those folders.
const leftOver = homes.filter((dir) => existsSync(dir));
if (leftOver.length > 0) fail(`the run left ${leftOver.length} of its ${homes.length} temporary folder(s) behind: ${leftOver.join(", ")}`);
else ok(`all ${homes.length} throwaway DSH_HOME folders were removed`);

console.log(failures === 0 ? "\nall preset-install checks passed" : `\n${failures} preset-install check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
