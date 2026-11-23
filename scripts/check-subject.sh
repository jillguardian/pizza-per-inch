#!/bin/sh
# Checks a commit subject or PR title against the format in docs/conventions.md.
# Shared by CI and the local commit-msg hook so the rule lives in one place.

subject="$1"
max_length=100
pattern='^(Feat|Fix|Refactor|Docs|Test|Upgrade|Chore): [^ ]'

if ! printf '%s' "$subject" | grep -Eq "$pattern"; then
  echo "Invalid title: $subject" >&2
  echo "Expected: 'Prefix: Short imperative summary' with a prefix of Feat, Fix, Refactor, Docs, Test, Upgrade, or Chore." >&2
  exit 1
fi

if [ "${#subject}" -gt "$max_length" ]; then
  echo "Too long (${#subject} characters, maximum $max_length): $subject" >&2
  exit 1
fi
