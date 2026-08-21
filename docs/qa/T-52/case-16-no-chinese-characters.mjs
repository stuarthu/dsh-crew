// T-52, DoD item 1's parenthesis, and `ADR 0014`'s rule about pinning: this file
// holds zero Chinese characters.
//
// What it proves: every pin aimed at this file is written in the language the file
// is actually in. `ADR 0014` spells out why that matters more than it looks:
// `grep -n '## 用词' principles.md` on an English file "不是一个弱检查，那是一个不
// 存在的检查" — not a weak check, a check that can never fire. The same trap is
// waiting for anyone who writes a Chinese pin against `roles/*.md`, `CLAUDE.md`
// or `README.md`; the only files in this repository where a Chinese string can be
// pinned are `README-zh.md` and the documents under `docs/`.
//
// It has a second use. T-52 was a large edit made from Chinese design documents,
// and a single pasted phrase would be invisible to every other check here.
//
// PINNING STYLE: LINE-BASED (a character does not wrap). The range covers CJK
// ideographs plus the full-width punctuation this project's Chinese documents use,
// so a pasted 「」 or ， is caught as well.
//
// One-way: this file is English and stays English.

import { check, done, principles } from "./principles.mjs";

const text = principles();
const CJK = /[　-〿㐀-䶿一-鿿豈-﫿！-｠]/;

const offenders = text.split("\n").flatMap((line, index) => {
  const match = CJK.exec(line);
  return match ? [`line ${index + 1}: ${JSON.stringify(line.trim().slice(0, 80))} (first: ${JSON.stringify(match[0])})`] : [];
});

check(
  "principles.md holds no Chinese character and no full-width punctuation",
  offenders.length === 0,
  `${offenders.length} line(s):\n      ${offenders.slice(0, 10).join("\n      ")}`,
);

// A file that somehow became empty would pass the check above, so prove the file
// is the one we think it is.
check(
  "the file was actually read",
  text.length > 40000 && text.startsWith("# "),
  `${text.length} bytes, starts with ${JSON.stringify(text.slice(0, 20))}`,
);

done();
