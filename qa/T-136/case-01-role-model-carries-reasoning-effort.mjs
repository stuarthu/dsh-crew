// T-136, DoD items 1 to 3: a role pinned to its own model through `roleModels`
// can carry its own reasoning effort, and nothing else about the mount changes.
//
// Why it matters: dsh drops the PM's reasoning effort whenever a child's
// provider or model differs from the PM's, unless the child's own options name
// one. `host/roles-preset.js` used to pass on only `provider` and `model`, so a
// pinned role always ran at that model's default effort, whatever you wrote.
//
// What it proves:
//   (a) `{ provider, model, reasoningEffort }` reaches tool-subagent as exactly
//       those three `agentOptions`;
//   (b) `{ provider, model }` and `{ model }` mount exactly as before, with no
//       `reasoningEffort` key;
//   (c) an empty `reasoningEffort` is the same as none;
//   (d) `reasoningEffort` without `model` mounts no `agentOptions`: that role
//       follows the PM's model, and dsh already hands it the PM's effort;
//   (e) pinning one role leaves every other role without `agentOptions`.
//
// What it cannot prove: that the child really runs at that effort. dsh does not
// run in this repository (`qa/gaps.md` item 5), so this case stops at the config
// tool-subagent is handed.
//
// Self-contained on purpose: a task's cases do not import another task's folder
// (`qa/gaps.md` item 61), so the throwaway copy and the stub below belong to
// this case. The stub stands in for `@deepseek-ai/dsh-tool-subagent`, which a
// public machine cannot install. `roles-preset.js` only hands that module to
// `ctx.plugin()` and never calls into it, so the stub is faithful here and the
// case runs on CI too.

import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { REPO, check, cleanUp, done, tempDir } from "../lib/qa.mjs";

const dir = tempDir("crew-qa-role-effort-");
try {
  // `roles/` is copied because the mount reads every persona file.
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
  writeFileSync(join(stub, "index.js"), 'export const name = "tool-subagent";\n');

  const preset = await import(pathToFileURL(join(dir, "host", "roles-preset.js")).href);
  const { ROLES } = await import(pathToFileURL(join(dir, "host", "roles.js")).href);

  /** Mount with this `roleModels` and return every role's `agentOptions`, by role key. */
  const mount = (roleModels) => {
    const configs = [];
    preset.apply({ plugin: (plugin, config) => configs.push(config) }, { roleModels });
    return Object.fromEntries(ROLES.map((role) => [
      role.key,
      configs.find((config) => config.toolName === role.toolName)?.agentOptions,
    ]));
  };
  const show = (value) => JSON.stringify(value);

  // --- (a) all three fields reach the pinned role
  const full = { provider: "some-provider", model: "some-model", reasoningEffort: "high" };
  const pinned = mount({ engineer: full });
  check(
    "provider, model and reasoningEffort all reach the pinned role's agentOptions",
    show(pinned.engineer) === show(full),
    `crew_engineer got ${show(pinned.engineer)}, expected ${show(full)}`,
  );

  // --- (b) no reasoningEffort: exactly what the mount produced before
  for (const [label, entry] of [
    ["provider and model", { provider: "some-provider", model: "some-model" }],
    ["a model alone", { model: "some-model" }],
  ]) {
    const got = mount({ engineer: entry }).engineer;
    check(
      `${label}, with no reasoningEffort, mounts exactly as before`,
      show(got) === show(entry),
      `crew_engineer got ${show(got)}, expected ${show(entry)}`,
    );
  }

  // --- (c) an empty value is not a value
  const empty = mount({ engineer: { model: "some-model", reasoningEffort: "" } }).engineer;
  check(
    "an empty reasoningEffort is the same as none",
    show(empty) === show({ model: "some-model" }),
    `crew_engineer got ${show(empty)}`,
  );

  // --- (d) effort with no model: the role follows the PM, effort included
  const effortOnly = mount({ engineer: { reasoningEffort: "high" } }).engineer;
  check(
    "reasoningEffort without a model mounts no agentOptions, so that role follows the PM",
    effortOnly === undefined,
    `crew_engineer got ${show(effortOnly)}`,
  );

  // --- (e) one role's pin touches no other role
  const others = Object.entries(pinned).filter(([key, options]) => key !== "engineer" && options !== undefined);
  check(
    `pinning one role leaves the other ${ROLES.length - 1} roles without agentOptions`,
    others.length === 0,
    others.map(([key, options]) => `${key}: ${show(options)}`).join(", "),
  );
} finally {
  cleanUp(dir);
}

done();
