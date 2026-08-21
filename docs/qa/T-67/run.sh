#!/usr/bin/env bash
# Runs every QA case of T-67. Exits 0 only when all of them pass.
#
# T-67 is the last link of the `roles/pm.md` chain: the step-4 rewrite that says
# what a PRD holds, the one-PRD-per-job file-name shape, the repository-internal
# pointers, and the `## While the crew is working` sentence. `tools/verify-mount.mjs`
# pins a few strings of that file and nothing else here, so these cases are the
# only machine check on the rest.
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

echo "T-67: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
