#!/usr/bin/env bash
# Runs every QA case of T-54. Exits 0 only when all of them pass.
#
# T-54 is a documentation-only task: it changes a prompt or a reader-facing file
# and nothing else. Nothing in `npm test` reads the CONTENT of what it wrote —
# `tools/verify-mount.mjs` only checks that each persona is readable, is over 500
# characters, holds no `{{`, and names a few fixed strings — so these cases are
# the only machine check this task's own words have.
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

echo "T-54: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
