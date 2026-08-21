#!/usr/bin/env bash
# Runs every QA case of T-77. Exits 0 only when all of them pass.
#
# T-77 is `roles/doc-reviewer.md`. These cases cover the parts of that rewrite
# that only a reader of the file itself can see: the old `## Later rounds`
# section is gone, the list of numbered checks is still exactly thirteen items
# long, and the prose keeps "the scope narrowed" apart from "the list of checks
# narrowed" — which it never did. `tools/verify-mount.mjs` pins a few strings of
# that file and nothing else here, so these cases are the only machine check on
# the rest.
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

echo "T-77: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
