#!/usr/bin/env bash
# Runs every QA case of T-63. Exits 0 only when all of them pass.
#
# T-63 laid the shared ground the other nineteen tasks of this job stand on: the
# authoritative wording in `principles.md` (the write-set section's shape, rule A
# about text inside a tool result, rule B about the documents that judge a role),
# the global "who writes which document" table, and the eight document types. The
# cases here read that wording and the ten role prompts that had to copy it word
# for word. Nine of those ten files were written by nine engineers that could not
# see each other, and no unit test in this project reads a role prompt's prose,
# so for most of what T-63 decided these cases are the only machine check there is.
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

echo "T-63: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
