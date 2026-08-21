// T-52, DoD item 18: `docs/qa/gaps.md` records that no check can prove the
// wording of a sentence — the glossary can only ever be checked for existence —
// and it names `ADR 0014`.
//
// What it proves: the one requirement of T-52 that no other file carries is
// carried. `ADR 0014` asks for it in as many words ("这一条要进 docs/qa/gaps.md",
// 验法: `grep -n 'ADR 0014' docs/qa/gaps.md`), and it says why: the last
// requirement that lived only in the prose of a decision document was lost, which
// is the accident `CRD 0010` records. The DoD row is blunt about the consequence:
// without this entry, T-52 is not done.
//
// The work is QA's: `docs/qa/` is QA's home and no engineer may write there, so
// no engineer's test can carry this. This case is the carrier.
//
// PINNING STYLE: LINE-BASED for `ADR 0014` and the entry's heading, FLATTENED
// inside the entry, because the Chinese prose there wraps too.
//
// One-way: the entry stays. This file records a closed gap as closed rather than
// deleting it, and this gap is one the entry itself says will never be closed by
// a case.

import { check, done, flatten, repoFile } from "./principles.mjs";

const gaps = repoFile("docs/qa/gaps.md");

check(
  "docs/qa/gaps.md names ADR 0014",
  gaps.includes("ADR 0014"),
  "the ADR that asked for this entry is not cited anywhere in the gap list",
);

// The entry, not just the string: split the file into its `## ` entries and take
// the one that is about the wording, so a mention of ADR 0014 inside some other
// entry cannot answer for this requirement.
const entries = gaps.split(/\n(?=## )/);
const entry = entries.find((block) => block.includes("ADR 0014") && /Words we use|用词/.test(block)) ?? "";

check(
  "one entry is about the glossary and cites ADR 0014",
  entry !== "",
  `entries citing ADR 0014: ${entries.filter((block) => block.includes("ADR 0014")).map((block) => block.split("\n")[0]).join(" | ") || "(none)"}`,
);

const flat = flatten(entry);

check(
  "the entry says the hole is the wording of a sentence, not the table",
  /用词/.test(flat) && /(判不了|不能|没有任何检查)/.test(flat),
  `entry starts: ${flat.slice(0, 160)}`,
);

check(
  "the entry says what CAN be checked: the section exists and all four words are there",
  /四条/.test(flat) && /存在/.test(flat),
  "the entry does not say which half is checkable, so a reader cannot tell what the cases cover",
);

check(
  "the entry names the banned phrase check as part of the checkable half",
  flat.includes("QA test"),
  "the ban is part of what can be checked and the entry does not say so",
);

check(
  "the entry says a reader is needed instead of a case",
  /(读者|doc-reviewer|人读|归人)/.test(flat),
  "a gap entry has to say what to do instead (the shape of every other entry in this file)",
);

check(
  "the entry records the 80-column wrapping problem, with the three times it happened",
  /80 列/.test(flat) && /三次/.test(flat) && /(展平|flat)/.test(flat),
  "the third instance of the prose-pin problem is not written down, so the next person repeats it",
);

check(
  "the entry has a status line, like every other entry",
  /\*\*状态\*\*/.test(entry),
  "no 状态 line",
);

done();
