// T-60, DoD item 6: the "Adding or changing a role" list carries the step
// `ADR 0010` asked for — a new role gets added to the explicit lists in
// `tools/verify-mount.mjs`, or nothing at all watches that half of it.
//
// What it proves: the gap `ADR 0010`'s own closing section named is now carried by
// the checklist somebody actually follows when adding a role. This is also the
// entry `docs/qa/gaps.md` item 17 used to record as unfinished — it is finished,
// and the wording is tighter than the ADR asked for: the persona file name goes
// into whichever of the two file-name lists the rule actually reaches, not into
// all of them unconditionally, because those lists do not contain every role.
//
// PINNING STYLE: slice LINE-BASED (the numbered steps of the section), sentences
// FLATTENED.

import { check, claudeSection, done, flat } from "./claude.mjs";

const adding = claudeSection("Adding or changing a role");
const steps = [...adding.matchAll(/^(\d+)\. /gm)].map((hit) => Number(hit[1]));

check(
  "the list is still a numbered list with no gaps",
  steps.length >= 6 && steps.every((number, index) => number === index + 1),
  `the steps are numbered ${steps.join(", ")}`,
);

const flatAdding = flat(adding);

check(
  "one step sends the new role into the explicit lists in verify-mount.mjs",
  flatAdding.includes("**three explicit lists** in `tools/verify-mount.mjs`"),
  "the step ADR 0010 asked for is missing from the checklist",
);

check(
  "it says why: a role missing from one list has nothing watching that half of it",
  flatAdding.includes("has nothing at all watching that half of it")
    && flatAdding.includes("nothing reminds you"),
  "the reason is missing, so the step reads as bookkeeping and gets skipped",
);

check(
  "it points at the ADR section that names this price out loud",
  flatAdding.includes("0010-bash-check-explicit-list.md"),
  "the pointer to ADR 0010 is missing",
);

check(
  "the shell list is conditional on the role living by the shell",
  flatAdding.includes("if the role lives by the shell, its **role key** goes in the shell list"),
  "the shell half of the step is missing, or is no longer conditional",
);

check(
  "the two file-name lists are entered only where the rule reaches that role",
  flatAdding.includes("each of the two file-name lists whose rule reaches that role"),
  "the tightened wording is gone — 'add it to all three unconditionally' is wrong, because those lists do not name every role",
);

check(
  "both file-name rules are named with the decision behind them",
  flatAdding.includes("0006-split-by-lifetime.md") && flatAdding.includes("0010-dod-is-a-section.md"),
  "one of the two rules that own those lists is not identified",
);

done();
