#!/usr/bin/env bash
# Runs every QA case of T-65. Exits 0 only when all of them pass.
#
# T-65 rewrote steps 8, 9, 10 and 15 of `roles/pm.md` — the biggest single change
# of this job. It moved the three reviews to the end of the milestone (one round
# each, in parallel, on the changed part only, and only a same-kind change brings
# a review back), cut QA down to one round in two steps (a case list first, then
# one agent per case), redefined when a task is finished, and kept the two words
# `unit test` and `QA case` apart. The cases here read that text. Only two of the
# pins in `tools/verify-mount.mjs` touch this passage at all — the "task is
# finished" sentence and `Parallel is the default` — so for the rest of it, and
# for every sentence that has to be ABSENT now, these cases are the only machine
# check there is.
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

echo "T-65: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
