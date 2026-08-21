// T-59, DoD item 10: neither README calls this shape "pair programming" — and
// where the name appears to draw the contrast, it is in a contrast sentence.
//
// What it proves: the wrong analogy is not planted in the page users read first.
// `CRD 0012` settled this: pair programming works because two people converge
// through constant talk, and this shape works because two readings deliberately do
// not converge. A reader who accepts the analogy will also accept pair
// programming's cost figures — which is exactly how this job's own cost estimate
// first went wrong.
//
// PINNING STYLE: LINE-BASED window around each hit, case-insensitive. Both forms
// are checked, because one file is English and the other Chinese: `结对编程`
// cannot be found in `README.md`, and `pair programming` may legitimately be
// absent from `README-zh.md`.
//
// One-way: a bare hit is never allowed. A contrast hit always is.

import { check, done, readmes } from "./readmes.mjs";

const CONTRAST = [
  // English contrast markers.
  "is not pair programming", "not pair programming", "opposite", "different thing",
  "unlike", "with the chat switched off",
  // Chinese contrast markers.
  "不是结对编程", "不是", "相反", "另一门东西", "对比",
];

for (const readme of readmes()) {
  const lines = readme.text.split("\n");
  const hits = [];
  lines.forEach((line, index) => {
    if (/pair programming|结对编程/i.test(line)) hits.push(index);
  });

  console.log(`note  ${readme.path}: ${hits.length} hit(s) of the banned name`);

  for (const index of hits) {
    // A contrast can sit on the line before or after, because the sentence wraps.
    const window = lines.slice(Math.max(0, index - 2), index + 3).join(" ");
    check(
      `${readme.path}:${index + 1} — the banned name is used only to draw a contrast`,
      CONTRAST.some((marker) => window.includes(marker)),
      `no contrast marker near this hit:\n      ${lines[index].trim()}`,
    );
  }

  check(
    `${readme.path}: the repository's own name for the shape is used instead`,
    readme.path === "README.md"
      ? readme.flat.includes("paired shape")
      : readme.flat.includes("双人形状"),
    "the file does not use the name this repository settled on",
  );
}

done();
