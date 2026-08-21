// T-59, DoD items 6 and 7: both READMEs say the paired shape exists only in a job
// that has an architect and that small work has none (item 6), and that the PM
// opens two worktrees each of which needs the symlink, without which the checks go
// quietly weaker (item 7).
//
// What it proves: a user does not go looking for a shape that cannot appear on
// their small job, and a user who tries the shape does not get a green run that
// checked less than they believe. The second one is the failure `CRD 0013` calls
// the quiet one: a fresh worktree has an empty `node_modules`, the check announces
// that it is skipping half of itself, and the run still ends green.
//
// PINNING STYLE: FLATTENED — every one of these is a sentence.

import { check, done, readmes } from "./readmes.mjs";

for (const readme of readmes()) {
  const english = readme.path === "README.md";

  check(
    `${readme.path}: the shape exists only in a job that has an architect`,
    english
      ? readme.flat.includes("Only in a job that has an architect")
      : readme.flat.includes("只有有架构师的作业里才有") || readme.flat.includes("只在有架构师"),
    "the architect-only boundary is missing",
  );

  check(
    `${readme.path}: small work has no paired shape`,
    english
      ? readme.flat.includes("A small job has no architect, so every row of a small job is `solo`")
      : readme.flat.includes("小活没有架构师") || readme.flat.includes("小活"),
    "the small-work half of the boundary is missing",
  );

  check(
    `${readme.path}: the PM opens two git worktrees`,
    readme.flat.includes("git worktree"),
    "the worktrees are not mentioned",
  );

  check(
    `${readme.path}: each worktree needs the symlink`,
    english ? readme.flat.includes("symbolic link") : readme.flat.includes("软链接"),
    "the link each fresh tree needs is not mentioned",
  );

  check(
    `${readme.path}: it says leaving the symlink out makes the checks quietly weaker`,
    english
      ? readme.flat.includes("quietly") || readme.flat.includes("looks green")
      : readme.flat.includes("安静") || readme.flat.includes("看起来是绿"),
    "the quiet-weakening warning is missing — a user would read the symlink as optional tidiness",
  );
}

done();
