#!/usr/bin/env bash
# Runs every QA case of T-64. Exits 0 only when all of them pass.
#
# T-64 rewrote four things in `roles/pm.md`: step 2 became a Socratic interview
# with a method, the `quick` lane was cancelled, "every change gets a milestone"
# replaced it, and the cancelled lane had to disappear from the other product
# files too. These cases pin that text, plus the one pin T-64's own DoD hands to
# QA: `host/roles-preset.js` really passing every role's persona through
# `readRoleText`. `tools/verify-mount.mjs` guards only a part of this — the
# cancelled lane's old wording as an ABSENT string — so for the rest of the
# passage these cases are the only machine check it has.
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

echo "T-64: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
