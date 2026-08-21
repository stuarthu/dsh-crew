#!/usr/bin/env bash
# Runs every QA case of T-82. Exits 0 only when all of them pass.
#
# T-82 fixed a contradiction this job created in `roles/pm.md`: step 1 said every
# change gets a milestone however small, while step 4's short-PRD paragraph and
# the `## The state file` section still said small work has none. Nothing was
# watching those two sentences — the contradiction shipped and was found four
# commits later by a role that could not touch the file. These cases are that
# watch, and `tools/verify-mount.mjs` pins none of it.
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

echo "T-82: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
