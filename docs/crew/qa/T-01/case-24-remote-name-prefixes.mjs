// Task T-01 — acceptance check 42.
// In a repository whose remote is not called origin, `origin/main` and
// `origin/crew/<job-slug>` are not branch names that exist, and the third proof
// would fail with `unknown revision`.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s17 = flat(step(pm(), 17));

check("the real remote name is used everywhere",
  /When this repository's remote is not called `origin`, use its real name every time/.test(s17), s17);
check("the remote-tracking prefixes are called out too",
  /That includes the remote-tracking names: read `origin\/main` and `origin\/crew\/<job-slug>` as `<remote>\/main` and `<remote>\/crew\/<job-slug>`/.test(s17), s17);
check("both fetches name the remote and prune",
  (s17.match(/git fetch <remote> --prune/g) ?? []).length >= 2,
  `found ${(s17.match(/git fetch <remote> --prune/g) ?? []).length}`);

done();
