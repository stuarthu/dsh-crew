#!/usr/bin/env bash
# Runs every QA case of T-72. Exits 0 only when all of them pass.
#
# T-72 rewrote `roles/qa.md`: the QA round is once per milestone and runs in two
# shapes (the case list, then one agent per case), and the two shared files
# `docs/qa/run-all.sh` and `docs/qa/gaps.md` changed owner to the PM. Both are
# prose rules, and `tools/verify-mount.mjs` only pins that the two paths still
# appear in that file at all — so these cases are the only machine check on the
# shape of the round and on who writes those two files.
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

echo "T-72: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
