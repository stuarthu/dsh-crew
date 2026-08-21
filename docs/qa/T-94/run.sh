#!/usr/bin/env bash
# Runs every QA case of T-94. Exits 0 only when all of them pass.
#
# T-94 widened the force-push rule in `roles/pm.md` from `main` alone to every
# branch, on the user's own instruction (CRD 0024 decision 1): a force push is
# forbidden everywhere unless the user approves that one command for that one
# push, and one approval never covers the next. `host/git-guard.js` returns
# early for the root agent, which is the PM, so for the PM that rule has no
# runtime enforcer at all -- it lives only in the sentences it reads. These
# cases and the pin T-94 added to `tools/verify-mount.mjs` are the whole machine
# check on it.
set -uo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cases=0
failed=0

for case_file in "$here"/case-*.mjs; do
  [ -e "$case_file" ] || continue
  cases=$((cases + 1))
  echo "--- $(basename "$case_file")"
  if ! node "$case_file"; then
    failed=$((failed + 1))
  fi
done

echo "T-94: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
