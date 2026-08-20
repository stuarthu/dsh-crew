// Task T-05 — acceptance check 18.
// The two strongest old cases may not have been weakened: an agent may not
// approve itself, and not even the root agent may write the approval file. Read
// in the check script, and re-proven here against the running guard.
import { repoFile, mountGuard, APPROVAL_RULE, check, done } from "../lib/qa.mjs";

const source = repoFile("tools/verify-guard.mjs");

check("the case list still expects the full-path touch to be BLOCKED",
  /\[`touch \$\{approvalFile\}`, true, "an agent may not approve itself"\]/.test(source),
  "the case is gone or its expectation was flipped");
check("the case list still expects the real ~/.dsh path to be BLOCKED",
  /\["echo hi > ~\/\.dsh\/crew\/push-ok", true,/.test(source),
  "the case is gone or its expectation was flipped");
check("the root agent is still checked against writing the approval file",
  /const rootTouch = await runRoot\(`touch \$\{approvalFile\}`\);/.test(source)
  && /root agent was allowed to write the approval file/.test(source),
  "the root-agent case is gone");
// Check 32 asks for a case mounted with the DEFAULT settings, sending only
// non-push commands, so the real ~/.dsh/crew/push-ok is never read, created or
// deleted. QA does not write its own copy of that: a second version of a case
// whose whole point is touching no disk is a risk, not a proof. So what is
// checked here is that the engineer's case is still there and still sends only
// non-push commands.
check("the default-settings mount is still covered",
  /guard\.apply\(\{ on: \(event, fn\) => \{ if \(event === "tools\/execute"\) defaultHandler = fn; \} \}, \{\}\);/.test(source),
  "the default-mount case is gone");
check("the default-settings mount sends only non-push commands",
  /command: "cat docs\/pre-push-ok"/.test(source) && /command: "touch push-ok"/.test(source)
  && !/defaultHandler[\s\S]{0,600}git push/.test(source),
  "a git push reached the handler mounted on the real approval file");

check("trustRootAgent: false is still checked",
  /trustRootAgent: false/.test(source) && /allowed a root main push/.test(source), "gone");

const guard = await mountGuard();
try {
  const childSelf = await guard.send(`touch ${guard.approvalFile}`);
  check("behaviour: a crew child cannot approve itself",
    (childSelf ?? "").includes(APPROVAL_RULE), `got: ${childSelf}`);
  const rootSelf = await guard.send(`touch ${guard.approvalFile}`, { root: true });
  check("behaviour: not even the root agent can write the approval file",
    (rootSelf ?? "").includes(APPROVAL_RULE), `got: ${rootSelf}`);
  const homePath = await guard.send("echo hi > ~/.dsh/crew/push-ok", { root: true });
  check("behaviour: the real ~/.dsh path is refused by its name alone",
    (homePath ?? "").includes(APPROVAL_RULE), `got: ${homePath}`);
} finally {
  guard.cleanUp();
}

done();
