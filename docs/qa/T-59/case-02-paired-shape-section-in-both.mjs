// T-59, DoD item 1: `README.md` — English first, as `CLAUDE.md` requires —
// explains the paired shape: what it is, how it is used, and what it is for. And
// `README-zh.md` says the same thing.
//
// What it proves: the reader who never opens a document under `docs/` still learns
// the shape exists and what it buys. The README is the only page most users read;
// a feature that ships with two new role tools and no README section is a feature
// nobody will use on purpose.
//
// PINNING STYLE: LINE-BASED for headings, FLATTENED for sentences.

import { check, done, headings, readmes } from "./readmes.mjs";

for (const readme of readmes()) {
  const own = headings(readme.text);

  check(
    `${readme.path}: there is a heading for the paired shape`,
    own.some((line) => /paired shape|双人形状/i.test(line)),
    `no heading names the shape. Headings: ${own.join(" / ")}`,
  );

  check(
    `${readme.path}: it says what the two halves write`,
    readme.flat.includes("`crew_test_engineer`") && readme.flat.includes("`crew_code_engineer`"),
    "the two role tools are not both named in the file",
  );

  check(
    `${readme.path}: it says what the shape is for — two independent readings of one document`,
    readme.path === "README.md"
      ? readme.flat.includes("two independent readings")
      : readme.flat.includes("两份独立的理解") || readme.flat.includes("独立"),
    "the purpose of the shape is missing",
  );

  check(
    `${readme.path}: it says the solo shape is still the default`,
    readme.path === "README.md"
      ? readme.flat.includes("default")
      : readme.flat.includes("默认"),
    "nothing tells the reader the existing road is unchanged",
  );

  check(
    `${readme.path}: it says the two halves never talk to each other`,
    readme.path === "README.md"
      ? readme.flat.includes("cannot see the other's half") || readme.flat.includes("never meet")
      : readme.flat.includes("看不到") || readme.flat.includes("不许"),
    "the isolation between the halves is not described",
  );
}

done();
