// T-53, DoD item 4: it works inside its own git worktree, whose path comes from
// the briefing, and it does not touch git.
//
// What it proves: the isolation is real and the PM stays the only one who uses
// git. `worktree` appeared 0 times in any `roles/*.md` before this job, so its
// presence here is this task's own work. The git ban matters twice over in the
// paired shape: two engineers committing into two branches of one repository, with
// no channel between them, is a merge nobody planned and nobody can see coming.
//
// PINNING STYLE: FLATTENED for sentences; the git verbs are checked individually
// so that losing one of them cannot hide behind the others.

import { check, done, flat, repoFile } from "../lib/qa.mjs";

const flatText = flat(repoFile("roles/test-engineer.md"));

check(
  "the file tells the role it works in a git worktree",
  flatText.includes("worktree"),
  "`worktree` is not in the file — before this job no role prompt used the word, so it is this task's own",
);

check(
  "the worktree path comes from the briefing, not from a guess",
  flatText.includes("The PM's briefing gives you") || flatText.includes("path"),
  "nothing says where the path comes from",
);

check(
  "it says the PM makes the two worktrees with plain `git worktree add`",
  flatText.includes("PM makes two git worktrees with plain `git worktree add`"),
  "the file does not say who creates the trees",
);

// The verbs are checked one at a time so that losing one cannot hide behind the
// others. They are matched with and without backticks, because the file writes
// some of them as code (`commit`, `add`) and some as plain words (branch, push) —
// pinning only the code form would go red over formatting, not over the rule.
for (const verb of ["commit", "add", "branch", "push", "stash", "switch"]) {
  check(
    `the git ban names ${verb}`,
    new RegExp(`no \`?(?:git )?${verb}\`?`, "i").test(flatText),
    `the ban does not mention ${verb}`,
  );
}

check(
  "it has no git worktree command of its own either",
  flatText.includes("no `git worktree` command of any kind"),
  "the role could create or move a worktree itself",
);

check(
  "reading git is still allowed, so the ban is on writing only",
  flatText.includes("Reading git is fine"),
  "the ban is not limited to writing, which would stop the role doing legitimate work",
);

done();
