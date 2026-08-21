#!/usr/bin/env bash
# Runs every QA case of T-66. Exits 0 only when all of them pass.
#
# T-66 rewrote step 12, step 13, step 14 and step 16 of `roles/pm.md` — where a
# milestone's documents are committed, what "release to users" answers, and what
# the git guard does NOT let a child do. Most of it is prose, and prose carries
# no unit test: `tools/verify-mount.mjs` pins a few anchor strings and nothing
# else, so these cases are the only machine check the rest of that passage has.
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

echo "T-66: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
