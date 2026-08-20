// Task T-05 — acceptance checks 20 and 32 (the must-block half).
// Proves every realistic way of naming the approval file is still refused, for a
// crew child AND for the root agent. The four spellings named in check 20 are
// here because the check names them; the rest are QA's own inputs.
import { mountGuard, APPROVAL_RULE, check, done } from "../lib/qa.mjs";

const guard = await mountGuard();
try {
  const file = guard.approvalFile;
  const commands = [
    [`touch ${file}`, "the full path (check 20)"],
    ["touch push-ok", "the bare name (check 20)"],
    ["rm push-ok", "deleting it (check 20)"],
    ["echo x >push-ok", "no space before the name (check 20)"],
    ['touch "push-ok"', "double quotes (check 32)"],
    ["touch 'push-ok'", "single quotes (check 32)"],
    ["touch $HOME/.dsh/crew/push-ok", "the $HOME form (check 32)"],
    ['python3 -c "open(\'push-ok\',\'w\')"', "written by a program (check 32)"],
    ["echo push-ok | xargs touch", "through a pipe (check 32)"],
    ["touch ./push-ok", "a relative path"],
    ["mv other-file push-ok", "renaming a file onto it"],
    ["ln -s /dev/null push-ok", "a symlink standing in for it"],
    [`printf '' > ${file}`, "the full path behind a redirect"],
    ["bash -c 'touch push-ok'", "one shell inside another"],
    [`rm -rf ${file}`, "deleting it by full path"],
  ];

  for (const [command, note] of commands) {
    const asChild = await guard.send(command);
    check(`child blocked: ${command}`,
      asChild !== undefined && asChild.includes(APPROVAL_RULE), `${note} — got: ${asChild}`);
    const asRoot = await guard.send(command, { root: true });
    check(`root  blocked: ${command}`,
      asRoot !== undefined && asRoot.includes(APPROVAL_RULE), `${note} — got: ${asRoot}`);
  }
} finally {
  guard.cleanUp();
}

done();
