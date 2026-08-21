// The boot-log half of the fake Cordis context, shared by the check scripts in
// tools/. Nothing here knows what a script is checking: it only records the
// lines the plugin writes, and through WHICH path each line went.
//
// Why it is shared. A boot-log line has two ways out of the plugin — `ctx.logger`
// when the deployment registers one, and a `console.log` fallback when it does
// not — and "said exactly once, on the right path" is the thing several cases
// count. Every script that counts it needs the same three pieces: a context that
// records the logger half, a console.log swap that records the other half and is
// always put back, and a counter. Two copies of that were kept side by side "so
// they cannot drift"; they had already drifted, and a third copy in
// docs/qa/lib/qa.mjs still describes an idiom that T-11 deleted.
//
// What is NOT here: what each script records BESIDES the log — prompt sections,
// dynamic contexts, mounted plugins — because those differ per script. Each
// script builds its own `fakeContext` on top of `logCapture` and adds its own
// recorders.
//
// tools/ does not import docs/qa/lib/qa.mjs and must not: that folder is QA's,
// and a one-level path change inside it takes all 42 QA cases down at once.

/**
 * The boot-log half of a fake Cordis context.
 *
 * `logs` is every boot-log line, whichever path wrote it. The two lists beside
 * it record WHICH path took each line, which is how a line said twice — once
 * through the logger and once through the console — is caught.
 *
 * @param logger - `true` (the default) for the recording logger, `false` for a
 *   host that registers none, or any other value to put in `ctx.logger`: a
 *   logger that is not a function, or one that hands back nothing, or one with
 *   no `info`
 * @returns a context with `logs`, `loggerLogs`, `consoleLogs`, `effect` and
 *   (unless `logger` is `false`) `logger`
 */
export function logCapture({ logger = true } = {}) {
  const logs = [];
  const loggerLogs = [];
  const consoleLogs = [];
  const ctx = {
    logs,
    loggerLogs,
    consoleLogs,
    effect: (fn) => fn(),
    // A deployment may hand the plugin a logger or none at all, so a boot-log
    // line has two paths out. This is the logger half; `recording` below catches
    // the console.log half, so a case that reads `logs` passes because the code
    // really logged, not by accident.
    logger: () => ({
      info: (line) => {
        loggerLogs.push(String(line));
        logs.push(String(line));
      },
    }),
  };
  if (logger === false) delete ctx.logger;
  else if (logger !== true) ctx.logger = logger;
  return ctx;
}

/**
 * Run `mount` with `console.log` recording into `ctx`, and put the real
 * `console.log` back whatever happens.
 *
 * Capturing the console half matters even when a logger is in place: a note said
 * twice would send its second copy to the real terminal, where no case could
 * count it.
 *
 * @param ctx - a context from `logCapture`
 * @param mount - called with `ctx`, so the mount reads the context from its own
 *   argument instead of closing over a variable; whatever it does to the plugin
 *   is up to the caller. Both call sites take the argument on purpose: with it
 *   ignored, `recording` could stop passing it and no check would notice.
 * @returns `ctx`
 */
export function recording(ctx, mount) {
  const realLog = console.log;
  console.log = (...args) => {
    const line = args.map(String).join(" ");
    ctx.consoleLogs.push(line);
    ctx.logs.push(line);
  };
  try {
    mount(ctx);
  } finally {
    console.log = realLog;
  }
  return ctx;
}

/**
 * How many boot-log lines mention `marker`, on either path.
 *
 * `includes` cannot answer "said exactly once": it stops at the first copy. A
 * missing context counts as zero lines, so a case can report the count of a
 * mount that threw instead of crashing on it.
 */
export const timesSaid = (ctx, marker) => (ctx?.logs ?? []).filter(line => line.includes(marker)).length;
