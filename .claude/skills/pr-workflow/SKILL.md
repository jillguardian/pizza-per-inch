---
name: pr-workflow
description: Open or merge a pull request, write its description, capture before/after evidence, or answer review comments in pizza-per-inch.
---

# PR workflow

Conventions (title format, branch names, squash merge) live in `docs/conventions.md`. This skill is the order of work.

## Open a PR

1. **Branch name** is `<type>/<issue-number>-<short-description>` from the first commit. GitHub closes a PR whose head branch is renamed, so a rename means a new PR.
2. **Run the affected tests.** CI runs the full suite, lint, format check, and build.
3. **UI change:** capture evidence first, following [evidence.md](evidence.md).
4. **Write the body** from `.github/pull_request_template.md`.
   - Every section is filled; "N/A" where nothing applies.
   - `Closes #N` appears here only, never in a title or commit subject. Drop the line when there is no issue.
   - Tick a checkbox only for what was done, and state only what was verified.
   - End with the attribution line from the session's instructions.
5. **Create it:** `gh pr create --title "<Prefix: Summary>" --assignee @me --label <label> --body-file <file>`.
   - The title follows the commit format, because it becomes the squash commit subject.
   - Label by branch type: `feat` is `enhancement`, `fix` is `bug`, `docs` is `documentation`, `upgrade` is `dependencies`.
6. **Watch CI:** `gh pr checks <number> --watch`. Done when `check` and `dependency-review` both pass; report the result.

## Merge

Wait for the author's go-ahead, then `gh pr merge <number> --squash --delete-branch`. Afterwards `git checkout main`, `git pull --rebase`, and `git fetch -p`.

## Review comments

Post findings as inline threads (`/code-review --comment <PR URL>`), then handle each thread in turn:

1. Fix it in one commit.
2. Reply in the thread with the commit.
3. Resolve the thread, only after the reply exists.

Done when every thread has a reply and is resolved, since the ruleset requires resolved conversations.

## Pushing

Rebasing a pushed branch needs `git push --force-with-lease`. Ask the author first.
