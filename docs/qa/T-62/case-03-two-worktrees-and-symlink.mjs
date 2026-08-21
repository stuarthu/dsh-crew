// T-62, DoD item 2: the two symlink commands sit in the SAME step as
// `git worktree add`, not in a note below it, and that step says why leaving
// them out is dangerous — nothing fails, the checks just get quietly weaker.
//
// What it proves: the failure mode `CRD 0013` calls "一个会安静出错的地方". A
// fresh worktree has an empty `node_modules`; `tools/verify-mount.mjs` then says
// out loud that it is skipping its role-tool half and the run still ends green.
// A PM who reads the worktree step, opens two trees and finds the link in a
// footnote it skipped gets exactly that green-but-weaker run.
//
// PINNING STYLE: the step boundary is LINE-BASED (`flowItem(1)`); every sentence
// inside it is checked FLATTENED, because this step holds the one sentence in the
// passage that wraps mid-phrase ("git switch moves the\n   single working
// directory").

import { check, done, flat, flowItem } from "./paired.mjs";

const first = flowItem(1);
const flatFirst = flat(first);

check(
  "step 1 of the flow opens two git worktrees",
  flatFirst.includes("git worktree add -b"),
  "`git worktree add -b` is not in step 1 of the flow",
);

check(
  "the symlink command is in that SAME step, not in a note below the flow",
  first.includes("node_modules/@deepseek-ai"),
  "the `node_modules/@deepseek-ai` command is not inside step 1 — the DoD requires it in the step that opens the tree",
);

check(
  "the symlink is put into BOTH trees",
  flatFirst.includes("both") && flatFirst.includes("before either engineer is briefed"),
  "step 1 does not say the untracked things go into both trees before briefing",
);

check(
  "the step says leaving it out fails nothing and makes the checks quietly weaker",
  flatFirst.includes("Leave that out and nothing fails")
    && flatFirst.includes("quietly weaker"),
  "the quiet-failure warning is missing from step 1",
);

check(
  "the step names what goes quiet: verify-mount.mjs skipping its role-tool half",
  flatFirst.includes("verify-mount.mjs") && flatFirst.includes("role-tool half"),
  "step 1 does not name the check that skips a half of itself",
);

check(
  "the step says two directories, not two branches in one working directory",
  flatFirst.includes("Two directories, not two branches in one"),
  "the reason for two real directories is missing",
);

done();
