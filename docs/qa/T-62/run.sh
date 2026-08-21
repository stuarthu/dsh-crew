#!/usr/bin/env bash
# Runs every QA case of T-62. Exits 0 only when all of them pass.
#
# T-62 is the clearest hole this job left: it wrote about 157 lines into step 9 of
# `roles/pm.md` — the PM's whole procedure for running a paired task — and
# `tools/verify-mount.mjs` has no pin on any of it. Delete the entire passage and
# `npm test` stays green. The file that would hold such a pin belongs to T-51,
# which is closed, so these cases are the only machine check that passage has.
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

echo "T-62: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
