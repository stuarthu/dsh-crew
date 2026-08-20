// Task T-01 — acceptance check 38.
// The assertion's comment used to claim --ff-only was the only way to move main
// forward, which is not true: --no-ff and `git merge origin/main` move it too.
import { repoFile, flat, check, done } from "../lib/qa.mjs";

// Strip the `//` of every comment line first, so the sentence can be read as
// one sentence however it is wrapped.
const mount = flat(repoFile("tools/verify-mount.mjs").replace(/^\s*\/\/ ?/gm, " "));

check("the comment describes --ff-only as catching local main up with the remote",
  /`--ff-only` is the only allowed way to catch local `main` up with the remote/.test(mount),
  "the sentence was not found");
check("it no longer claims --ff-only is the only way to move main forward",
  !/way to move/.test(mount), "the overstated claim is still there");

done();
