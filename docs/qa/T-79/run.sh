#!/usr/bin/env bash
# Runs every QA case of T-79. Exits 0 only when all of them pass.
#
# T-79 is the delivery face of this job: the two READMEs, rewritten together in
# one commit, English first. They are the only page most users read, so a claim
# that never reached them did not ship. These cases assert on EACH file on its
# own - the ordinary failure here is not a missing paragraph but a Chinese page
# that fell behind the English one.
#
# `docs/qa/T-59/` also reads both READMEs; it pins the previous job's content and
# the SHAPE of the two files (heading counts, the role table, the version box).
# Nothing here repeats it.
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

echo "T-79: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
