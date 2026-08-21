#!/usr/bin/env bash
# Runs every QA case of T-60. Exits 0 only when all of them pass.
#
# T-60 is a documentation-only task on `CLAUDE.md`, and nothing in `npm test`
# reads that file's CONTENT. Two of the things it wrote are among the three holes
# this job's final QA round was asked to close first: the fourth guard of the flat
# rule (three paragraphs inside design rule 1) and the whole `## The paired shape`
# section. Delete either one and every check in the project stays green.
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

echo "T-60: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
