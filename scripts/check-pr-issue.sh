#!/bin/sh
# Checks that a pull request says which issue it is for, as docs/conventions.md asks.
# CI passes the description, the author and the labels as environment variables, so that text
# from a pull request is never placed in a shell command.
#   PR_BODY    the pull request description
#   PR_AUTHOR  the login of the author
#   PR_LABELS  the label names, as a JSON array or one per line

# Automated upgrades from Dependabot have no issue.
if [ "$PR_AUTHOR" = "dependabot[bot]" ]; then
  exit 0
fi

# HTML comments are the template's hints, so they do not count as writing a reference. A comment
# that is never closed hides the rest of the text, as it does on GitHub.
body=$(printf '%s' "$PR_BODY" | perl -0pe 's/<!--.*?(-->|\z)//gs')

# A reference is Closes, Fixes, Resolves or Refs, then #<number> and nothing that makes it part of a
# longer word.
if printf '%s' "$body" | grep -Eiq '(^|[^[:alnum:]])(closes|fixes|resolves|refs) #[0-9]+([^[:alnum:]]|$)'; then
  exit 0
fi

# The exemption needs the label and a reason on a line of its own.
if printf '%s' "$PR_LABELS" | grep -Eq '(^|[^[:alnum:]-])no-issue($|[^[:alnum:]-])'; then
  if printf '%s' "$body" | grep -Eiq '^no issue: *[[:alnum:]]'; then
    exit 0
  fi
  echo "The no-issue label needs a reason. Add a line to the description: No issue: <why>" >&2
  exit 1
fi

echo "This pull request does not say which issue it is for." >&2
echo "Add 'Closes #N' (it finishes the issue) or 'Refs #N' (it is one part of it) to the description." >&2
echo "No issue is right for it? Add the no-issue label and a line 'No issue: <why>'." >&2
exit 1
