#!/usr/bin/env bash
# Runs every QA case of T-59. Exits 0 only when all of them pass.
#
# T-59 changed the two files a user reads first, and nothing in `npm test` reads
# either of them. One thing it did carries further than the task: `principles.md`
# 21 claims the three-role comparison table "also has to stand in both READMEs",
# and that claim only became TRUE when T-59 landed. `docs/qa/T-52/case-13` scans
# `principles.md` alone and says so in its own header, so before these cases
# nothing at all guarded the claim against going false again.
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

echo "T-59: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
