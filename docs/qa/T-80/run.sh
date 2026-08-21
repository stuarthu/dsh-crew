#!/usr/bin/env bash
# Runs every QA case of T-80. Exits 0 only when all of them pass.
#
# T-80 is the `CLAUDE.md` end of this job: the repository's own rule file follows
# every rule the job moved. `tools/verify-mount.mjs` reads no part of `CLAUDE.md`,
# and `docs/qa/T-60/case-09` pins one sentence of it, so these cases are the only
# machine check on the rest.
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

echo "T-80: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
