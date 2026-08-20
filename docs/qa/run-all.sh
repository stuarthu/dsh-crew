#!/usr/bin/env bash
# Runs every task's QA cases: it finds each docs/qa/*/run.sh by itself, so
# a new task never needs this file edited.
set -uo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tasks=0
failed=0
names=()

while IFS= read -r runner; do
  task="$(basename "$(dirname "$runner")")"
  tasks=$((tasks + 1))
  echo "=== $task ==="
  if bash "$runner"; then
    echo "PASS  $task"
  else
    echo "FAIL  $task"
    failed=$((failed + 1))
    names+=("$task")
  fi
  echo
done < <(find "$here" -mindepth 2 -maxdepth 2 -name run.sh | sort)

echo "crew QA: $tasks task(s) run, $((tasks - failed)) passed, $failed failed"
if [ "$failed" -gt 0 ]; then
  echo "failed task(s): ${names[*]}"
  exit 1
fi
exit 0
