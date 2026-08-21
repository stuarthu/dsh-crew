// T-52, DoD item 8: the worktree row of the rejected-ideas table carries
// `CRD 0013`'s correction — the idea was rejected as a PLATFORM FEATURE, and the
// PM needs no platform feature, because plain `git worktree add` gives two real
// directories today.
//
// What it proves: the one row in that table that no longer holds says so. This is
// the sharpest trap in the whole file: `CRD 0012` rejected worktrees, `CRD 0013`
// adopted them, and `CRD 0012` is never rewritten (that is the rule for a CRD).
// So `principles.md` is the only place a reader can be told, and a reader who
// meets an uncorrected row learns the opposite of how the shape actually works —
// while principle 21, forty lines above, tells them the isolation IS two
// worktrees. Two places in one file contradicting each other is worse than a gap.
//
// PINNING STYLE: FLATTENED within the row. The row is one line (line-based to
// find), but the assertions are made on the flattened cell text, because the cell
// is a paragraph's worth of prose and this file may re-wrap it at any time.
//
// One-way: the correction can never stop being true — the shape now runs on
// worktrees, so the row can never go back to a plain rejection.

import { check, done, flatten, principles, sectionOf, table } from "./principles.mjs";

const rejected = table(sectionOf(principles(), "What we looked at and did not take"), "| Idea |");
const row = rejected.rows.find((cells) => /Two independent worktrees/i.test(cells[0]));

check("the worktree row is in the table", row !== undefined, `rows: ${rejected.rows.map((cells) => cells[0]).join(" | ")}`);

const why = flatten(row?.[1] ?? "");

check(
  "the row names CRD 0013 as the correction",
  /CRD 0013/.test(why),
  `reason cell: ${why.slice(0, 200)}`,
);

check(
  "the row says outright that it no longer holds",
  /no longer holds|Rejected, then adopted/i.test(why),
  `reason cell: ${why.slice(0, 200)}`,
);

check(
  "the row keeps the part that still stands: it was rejected as a platform feature",
  /platform feature/i.test(why) && /still stands/i.test(why),
  `reason cell: ${why.slice(0, 300)}`,
);

check(
  "the row says the PM needs no platform feature, plain `git worktree add` is enough",
  /plain `git worktree add`/.test(why) && /needs no platform feature/i.test(why),
  `reason cell: ${why.slice(0, 300)}`,
);

check(
  "the row sends the reader to principle 21, where the shape is now described",
  /principle 21/.test(why),
  `reason cell: ${why.slice(0, 300)}`,
);

done();
