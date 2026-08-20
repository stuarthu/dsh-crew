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

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

let failures = 0;
const fail = (message) => { failures += 1; console.error(`FAIL  ${message}`); };
const ok = (message) => console.log(`ok    ${message}`);

const crew = await import("../host/crew.js");

/** Fake Cordis context that captures the boot log. */
function fakeContext(logs) {
  return {
    effect: (fn) => fn(),
    systemPrompt: { section: () => {}, context: () => {} },
    plugin: () => {},
    logger: () => ({ info: (line) => logs.push(line) }),
  };
}

/** Run the plugin against a fresh throwaway harness home. */
function install(home, config = {}) {
  const logs = [];
  process.env.DSH_HOME = home;
  crew.apply(fakeContext(logs), config);
  return logs.join("\n");
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

} finally {
  removeHomes(homes);
}

// 8. Nothing this run created is left in /tmp. This case runs last, after every
//    assertion above has read what it needed out of those folders.
const leftOver = homes.filter((dir) => existsSync(dir));
if (leftOver.length > 0) fail(`the run left ${leftOver.length} of its ${homes.length} temporary folder(s) behind: ${leftOver.join(", ")}`);
else ok(`all ${homes.length} throwaway DSH_HOME folders were removed`);

console.log(failures === 0 ? "\nall preset-install checks passed" : `\n${failures} preset-install check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
