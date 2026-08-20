// Task T-05 — acceptance checks 19, 30 and 32 (the must-allow half).
// Proves a command that only CONTAINS the approval file's name inside a longer
// name is no longer refused by the approval-file rule — for a crew child and
// for the root agent. The inputs are QA's own, not the ones in
// tools/verify-guard.mjs.
import { mountGuard, APPROVAL_RULE, check, done } from "../lib/qa.mjs";

const guard = await mountGuard();
try {
  const file = guard.approvalFile;
  const commands = [
    ["git switch -c crew/hotfix-push-ok", "a branch name that ENDS with push-ok (the pattern's left boundary)"],
    ["git log --oneline crew/push-ok-flow..main", "a branch name that contains push-ok"],
    [`ls -la ${file}-flow/`, "a folder sitting next to the approval file"],
    [`cat ${file}.md`, "a note file sitting next to the approval file"],
    ["cat notes/push-ok2.md", "a file name that continues with a digit"],
    ["touch PUSH-OK", "a different name in capitals"],
    ['git commit -m "docs: rename push-ok-flow"', "the branch name inside a commit message"],
  ];

  for (const [command, note] of commands) {
    const asChild = await guard.send(command);
    check(`child: ${command}`, asChild === undefined, `${note} — blocked: ${asChild}`);
    const asRoot = await guard.send(command, { root: true });
    check(`root:  ${command}`, asRoot === undefined, `${note} — blocked: ${asRoot}`);
  }

  // A push of such a branch is a different story: a child still needs the
  // user's one-shot approval. What must be gone is the WRONG reason.
  const childPush = await guard.send("git push origin crew/push-ok-flow");
  check("child: a push of crew/push-ok-flow is not refused as touching the approval file",
    childPush !== undefined && !childPush.includes(APPROVAL_RULE), `reason: ${childPush}`);
  check("child: it is refused for the real reason — no approval yet",
    (childPush ?? "").includes("pushing needs the user's approval first"), `reason: ${childPush}`);
  const rootPush = await guard.send("git push origin crew/push-ok-flow", { root: true });
  check("root:  a push of crew/push-ok-flow goes straight through", rootPush === undefined, `blocked: ${rootPush}`);

  // The remote delete of such a branch: a child is refused, but for the remote
  // delete rule — the reason step 17 tells the PM to read.
  const childDelete = await guard.send("git push origin --delete crew/push-ok-flow");
  check("child: the remote delete is refused for being a remote delete",
    (childDelete ?? "").includes("deleting a remote branch"), `reason: ${childDelete}`);
  check("child: the remote delete is not refused as touching the approval file",
    !(childDelete ?? "").includes(APPROVAL_RULE), `reason: ${childDelete}`);
} finally {
  guard.cleanUp();
}

done();
