#!/usr/bin/env bash
# Runs every QA case of T-52. Exits 0 only when all of them pass.
#
# T-52 is a documentation-only task: it changes `principles.md` and nothing else.
# Nothing in `npm test` reads that file's CONTENT — `tools/verify-mount.mjs:837`
# only checks that `roles/pm.md` mentions the string `principles.md` — so these
# cases are the only machine check the task has.
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

echo "T-52: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
