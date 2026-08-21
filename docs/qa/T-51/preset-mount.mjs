// Shared helper for T-51's CRD 0016 cases. NOT a case: the runners only execute
// files named `case-*.mjs`.
//
// It mounts `host/roles-preset.js` out of a throwaway COPY of `host/` and
// `roles/`, next to a tiny stub of `@deepseek-ai/dsh-tool-subagent`.
//
// Why a stub and not the real package: that package cannot be installed from the
// public registry (its peer `@deepseek-ai/dsh-tasks` is not published), so on CI
// the import fails and `tools/verify-mount.mjs` skips its whole role-tool half
// out loud. A case that needed the real package would therefore be skipped
// exactly where regressions are most likely to land unnoticed. `roles-preset.js`
// only ever passes the imported module on to `ctx.plugin()` as an opaque value —
// it never calls into it — so for the empty-list rule of CRD 0016 the stub is
// faithful, and these cases then run everywhere. The real-package path stays
// covered by verify-mount's own two checks.
//
// Each call gets its own copy, so the dynamic import is a fresh module (import
// caching is per URL) and no case can see state left by another.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { REPO, tempDir } from "../lib/qa.mjs";

/** A throwaway copy of the two folders the preset reads, plus the stub package. */
export function presetCopy() {
  const dir = tempDir("crew-qa-preset-");
  // `roles/` is copied because readRoleText() resolves personas relative to
  // host/roles.js, and a missing persona would make every mount throw for a
  // reason that has nothing to do with the case.
  for (const entry of ["host", "roles"]) {
    cpSync(join(REPO, entry), join(dir, entry), { recursive: true });
  }
  const stub = join(dir, "node_modules", "@deepseek-ai", "dsh-tool-subagent");
  mkdirSync(stub, { recursive: true });
  writeFileSync(join(stub, "package.json"), `${JSON.stringify({
    name: "@deepseek-ai/dsh-tool-subagent",
    version: "0.0.0-qa-stub",
    type: "module",
    exports: "./index.js",
  }, null, 2)}\n`);
  writeFileSync(join(stub, "index.js"), 'export const name = "tool-subagent";\nexport const Config = (config) => config;\n');
  return dir;
}

/** The preset module of a copy. */
export const loadPreset = (dir) => import(pathToFileURL(join(dir, "host", "roles-preset.js")).href);

/** The role table of a copy, so a case loops over the real keys, not a retyped list. */
export const loadRoles = (dir) => import(pathToFileURL(join(dir, "host", "roles.js")).href);

/** Fake Cordis context: records every mount, nothing else. */
export function fakeCtx() {
  const mounts = [];
  return { mounts, plugin: (plugin, config) => mounts.push({ plugin, config }) };
}

/**
 * Mount once and report what happened, never throwing at the caller.
 * @returns {{ ctx: object, thrown: Error|undefined, message: string }}
 */
export function mountAttempt(preset, config) {
  const ctx = fakeCtx();
  try {
    preset.apply(ctx, config);
    return { ctx, thrown: undefined, message: "" };
  } catch (error) {
    return { ctx, thrown: error, message: String(error?.message ?? error) };
  }
}
