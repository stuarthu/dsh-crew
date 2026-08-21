// T-61, DoD item 1: the new changelog entry says what a USER will notice — two more
// role tools, a task can be built by two engineers, and the PM opens two git
// worktrees.
//
// What it proves: the entry is written for the person upgrading the package, not as
// an internal note. `principles.md` 20's flow puts reader-facing files at step 14 and
// says they are a set, not just the README; a changelog entry that described the
// design instead of the change would leave a user unable to tell whether an upgrade
// affects them.
//
// PINNING STYLE: FLATTENED — every one of these is a sentence, and this file wraps.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("CHANGELOG.md"));

check(
  "the entry says a task can now be built by two engineers who never meet",
  flatText.includes("A task can now be built by two engineers who never meet"),
  "the headline of the change is missing",
);

check(
  "it names both new role tools",
  flatText.includes("`crew_test_engineer`") && flatText.includes("`crew_code_engineer`"),
  "one of the two new tools is not named",
);

check(
  "it says how many roles the PM can start now",
  flatText.includes("nine crew roles now instead of seven"),
  "the count a user can check against their own config is missing",
);

check(
  "it says which half writes what",
  flatText.includes("writes only the unit test files") && flatText.includes("writes only the product code"),
  "the two halves are named but not distinguished",
);

check(
  "it says the PM opens a git worktree for each of them",
  flatText.includes("a git worktree for each of them") && flatText.includes("`git worktree add`"),
  "the worktrees — the part a user will see in their own repository — are missing",
);

check(
  "it says the unit test is not in the code half's directory at all",
  flatText.includes("it is not in that half's directory at all"),
  "the isolation is described as a rule rather than as a fact about the filesystem",
);

check(
  "it says the PM runs the unit tests exactly once and reports what came out",
  flatText.includes("**exactly once**"),
  "the once-only rule, which a user watching the PM work will notice, is missing",
);

done();
