#!/usr/bin/env bash
# Runs every QA case of T-75. Exits 0 only when all of them pass.
#
# T-75 is `roles/code-reviewer.md`, and this folder also carries the cases that
# span all three reviewer prompts — `roles/code-reviewer.md`,
# `roles/security-reviewer.md` and `roles/doc-reviewer.md`. T-76 and T-77 have no
# folder of their own for those: their DoD item 5 and their one-round items say
# "same as T-75", so one case reading all three files is the honest shape, and
# splitting it in three would make three nearly identical cases.
#
# `tools/verify-mount.mjs` pins the reviewers' TOOL TABLE (no role key containing
# `review` may allow `write` or `edit`). It reads none of the prose in these
# three prompts, so these cases are the only machine check on what the prompts
# actually say.
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

echo "T-75: $cases case(s), $((cases - failed)) passed, $failed failed"
[ "$failed" -eq 0 ]
