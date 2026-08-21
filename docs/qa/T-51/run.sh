#!/usr/bin/env bash
# Runs every QA case of T-51. Exits 0 only when all of them pass.
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

echo "T-51: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
