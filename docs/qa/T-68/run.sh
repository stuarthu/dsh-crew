#!/usr/bin/env bash
# Runs every QA case of T-68. Exits 0 only when all of them pass.
#
# T-68 added principle 22 to `principles.md` — the Socratic interview the PM runs
# in step 2 of the team lane — and moved `## Words we use` after it. That task
# has NO unit tests of its own on purpose: the only file in this project that
# could hold such a check, `tools/verify-mount.mjs`, is locked on the
# `roles/pm.md` serial chain, so these cases are the only machine check on the
# shape and the content of that section.
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

echo "T-68: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
