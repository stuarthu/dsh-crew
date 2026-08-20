// Task T-05 — acceptance check 34.
// The "Honest limits" comment must carry the two truths AE asked for — and both
// are checked here against the running guard, not only read in the comment.
import { repoFile, mountGuard, APPROVAL_RULE, check, done } from "../lib/qa.mjs";

const header = repoFile("host/git-guard.js").slice(0, 2000).replace(/^\s*\/\/ ?/gm, " ").replace(/\s+/g, " ");

check("the comment says a command that only MENTIONS the name is refused, root included",
  /A command that only MENTIONS the file name is refused, the root agent included/.test(header), header);
check("it gives the commit-message example",
  /git commit -m "fix\(guard\): the push-ok substring false alarm"/.test(header), header);
check("it names grep and git log --grep as the same case",
  /grep -n push-ok config\.yml/.test(header) && /git log --grep=push-ok/.test(header), header);
check("the comment says a name the shell assembles from pieces still gets through",
  /A name the shell assembles from pieces still gets through/.test(header), header);
check("it gives the sed example and says the old check did stop that one",
  /echo push-ok-flow \| sed s\/-flow\/\/ \| xargs touch/.test(header)
  && /The old substring check did stop that one/.test(header), header);

const guard = await mountGuard();
try {
  const commit = await guard.send('git commit -m "fix(guard): the push-ok substring false alarm"', { root: true });
  check("truth 1 holds: even the root agent's commit message is refused",
    (commit ?? "").includes(APPROVAL_RULE), `got: ${commit}`);
  const assembled = await guard.send("echo push-ok-flow | sed s/-flow// | xargs touch");
  check("truth 2 holds: a name assembled by the shell is not stopped",
    assembled === undefined, `blocked: ${assembled}`);
} finally {
  guard.cleanUp();
}

done();
