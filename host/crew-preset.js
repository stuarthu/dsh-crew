// The Crew preset declaration for dsh 0.2.x (AGENT plane).
//
// The declaration itself stays in cordis.patch.yml; this plugin carries it
// instead of `@deepseek-ai/dsh-agent-preset`, because a row's `disabled` is
// evaluated against the LOADER context, which cannot see the registry service.
// Here the check runs in this plugin's own context, where ctx.get() resolves.
//
// dsh 0.1.x never reads a declaration row at all: there the preset is the
// folder `host/crew.js` copies into $DSH_HOME/.agent-presets. Doing nothing is
// the whole 0.1.x story, and this plugin must never break it.
export const name = "dsh-crew-preset";
export const inject = ["agentPresets"];

export async function apply(ctx, config) {
  const registry = ctx.get("agentPresets");
  // dsh 0.1.x: the old registry scans $DSH_HOME/.agent-presets, and that folder
  // is the home of the preset there. It cannot take a declaration row, so doing
  // nothing is the whole 0.1.x story — this plugin must never break it.
  if (registry === undefined) return;
  if (typeof registry.register !== "function") return;
  if (registry.resolvedRoots !== undefined) return;

  try {
    const dispose = await registry.register(config);
    if (typeof dispose === "function") ctx.effect(() => () => dispose());
  } catch (error) {
    // A leftover hand-written row already declaring `crew` makes the registry
    // throw "Duplicate agent preset: crew". One clear line beats a dead profile.
    const message = error instanceof Error ? error.message : String(error);
    const note = `dsh-crew: the crew preset was not registered: ${message}`;
    const logger = typeof ctx?.logger === "function" ? ctx.logger("dsh-crew") : undefined;
    if (typeof logger?.warn === "function") logger.warn(note);
    else console.warn(note);
  }
}

// Tree carrier, exactly as @deepseek-ai/dsh-agent-preset is: nested rows'
// `!!js` expressions belong to their own fibers, not to this row's context.
const plugin = { name, inject, apply };
plugin[Symbol.for("cordis.group")] = true;
export default plugin;
