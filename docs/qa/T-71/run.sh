#!/usr/bin/env bash
# Runs every QA case of T-71. Exits 0 only when all of them pass.
#
# T-71 is `roles/engineer.md`. Its item 5 is the cell the PM corrected on
# 2026-08-21: an engineer never writes an ADR, and the four places that say so —
# the `Who writes which document` table in `principles.md`, its short copy in
# `roles/pm.md`, and two sections of `roles/engineer.md` itself — must not
# contradict each other. `tools/verify-mount.mjs` only requires that
# `docs/decisions/adr/` appears somewhere in the file, which says nothing about
# which side of the write set it sits on, so these cases are the only machine
# check on the rest.
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

echo "T-71: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
