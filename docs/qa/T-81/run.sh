#!/usr/bin/env bash
# Runs every QA case of T-81. Exits 0 only when all of them pass.
#
# T-81 is the `CHANGELOG.md` entry for 0.9.0. The task owns exactly one product
# file and has no unit tests of its own — `docs/qa/gaps.md` item 22 records that
# the ordering of this file lost its only pin when 0.8.0 was released. So these
# cases are the only machine check on it: case-01 judges the order and the top
# section against `package.json`, case-02 judges what the 0.9.0 entry says.
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

echo "T-81: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
