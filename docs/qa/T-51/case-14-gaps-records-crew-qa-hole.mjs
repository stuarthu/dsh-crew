// T-51, DoD item 17: `docs/qa/gaps.md` records that the shell check still does
// not guard `crew_qa`, on purpose, and says what would have to be true to close
// it.
//
// What it proves: the hole CLAUDE.md design rule 4 records shrank from "one of
// three" to "QA alone" and did NOT close — and that fact is written where this
// project keeps its standing gaps, instead of staying in the prose of an ADR.
// This case is the carrier of that requirement (ADR 0010 "what it does not
// prove", hld.md section 5): the last requirement that lived only in prose was
// lost, which is why the gap list exists.
//
// One-way: the entry stays in the file even after a later job closes the hole,
// because this file records a closed gap as closed rather than deleting it.

import { check, done, repoFile } from "../lib/qa.mjs";

const gaps = repoFile("docs/qa/gaps.md");
const mount = repoFile("tools/verify-mount.mjs");

check("docs/qa/gaps.md names crew_qa", gaps.includes("crew_qa"), "the gap is not recorded at all");

// The entry, not just the word: split the file into its `## ` entries and take
// the one that is about this check.
const entries = gaps.split(/\n(?=## )/).filter((block) => block.includes("crew_qa"));
const entry = entries.find((block) => block.includes("NEEDS_SHELL")) ?? "";

check(
  "one gaps.md entry is about crew_qa and the shell check",
  entry !== "",
  `${entries.length} entr(y/ies) mention crew_qa, none of them names the list: ${entries.map((block) => block.split("\n")[0]).join(" | ")}`,
);

// The four questions this file says every entry answers, plus the two things the
// DoD row asks this entry in particular to say.
check("that entry names the check it is about", entry.includes("tools/verify-mount.mjs"), entry);
check("that entry says leaving crew_qa out was deliberate", entry.includes("故意"), entry);
check(
  "that entry says why: this job could not change anything about QA",
  entry.includes("不许改 QA") || entry.includes("不在范围内"),
  entry,
);
check("that entry says what would have to be true to close it", entry.includes("该怎么办"), entry);
check("that entry carries a status line", entry.includes("**状态**"), entry);

// And the fact is still a fact. The day `crew_qa` joins the list, this check
// turns red and the entry has to be rewritten in the same commit — which is the
// point: a gap list that outlives the gap is worse than none.
const list = /const NEEDS_SHELL = \[[^\]]*\];/.exec(mount)?.[0];
check("tools/verify-mount.mjs still has an explicit shell list", list !== undefined, "the list was renamed or removed");
check(
  "that list still leaves crew_qa out (so the recorded gap is still real)",
  list !== undefined && !list.includes("qa"),
  `the list is now: ${list} — if QA is guarded now, rewrite the gaps.md entry in the same commit`,
);

done();
