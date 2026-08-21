// T-51, DoD item 2: both new entries build their deny list as
// `[...NO_DELEGATION]` — never a hand-written list of names.
//
// What it proves: the deny list of each new role WIDENS by itself when the next
// crew role is added. This is a source-text check on purpose: at run time a
// hand-written copy of today's names and `[...NO_DELEGATION]` are the same array,
// so `verify-mount.mjs` cannot tell them apart — it only sees the result. The
// difference shows up one job later, when a tenth crew tool is added and the
// hand-written copy is the one deny list that does not have it, and the role that
// carries it can start an agent the flat rule says it may not.

import { check, done, repoFile } from "../lib/qa.mjs";

const source = repoFile("host/roles.js");

/** The source text of one ROLES entry: from its `key:` line to the next one. */
function entry(key) {
  const start = source.indexOf(`key: "${key}"`);
  if (start === -1) throw new Error(`host/roles.js has no entry with key "${key}" — the role table's shape moved`);
  const rest = source.slice(start + 1);
  const end = rest.indexOf("\n    key: \"");
  return end === -1 ? source.slice(start) : source.slice(start, start + 1 + end);
}

for (const key of ["test_engineer", "code_engineer"]) {
  const text = entry(key);

  check(
    `${key}: deny is built as [...NO_DELEGATION]`,
    text.includes("deny: [...NO_DELEGATION]"),
    text,
  );

  // No quoted crew tool name anywhere in the entry: that is what a hand-written
  // list looks like. The entry's own tool name is written as `crew_...` too, so
  // the search is for a name in a LIST — a quoted name followed by a comma or a
  // closing bracket inside brackets — rather than for the word.
  const handWritten = /\[[^\]]*"crew_[^"]+"/.exec(text);
  check(
    `${key}: names no crew tool by hand in a list`,
    handWritten === null,
    `found ${JSON.stringify(handWritten?.[0])} — a list typed out by hand keeps exactly the names it was typed with`,
  );
}

// And the source of the widening is still one shared constant, spread from the
// one list every other check reads. (The exact text of that line is pinned by
// docs/qa/T-42/case-11-counter-roles-block.mjs, which mutates it; this is only
// the premise this case rests on, asserted so it cannot rot silently.)
check(
  "NO_DELEGATION is still spread from ROLE_TOOL_NAMES",
  source.includes("const NO_DELEGATION = [...ROLE_TOOL_NAMES];"),
  "host/roles.js no longer builds NO_DELEGATION from ROLE_TOOL_NAMES",
);

done();
