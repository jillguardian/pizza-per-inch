# Reusing this setup in another project

Notes for starting a new side project with the same workflow. Update them when the setup changes.

## What to copy

- `.github/workflows/ci.yml` (`check` and `dependency-review` jobs), `audit.yml` (weekly), `deploy.yml` (GitHub Pages, Vite apps only)
- `.github/pull_request_template.md` and `.github/dependabot.yml`
- `scripts/check-subject.sh` and its test, `.githooks/commit-msg`
- `.npmrc` (`save-exact=true`), the lint rules in `.oxlintrc.json`
- `docs/conventions.md` and `CLAUDE.md`

## What to change per project

- `vite.config.ts` `base` must be `/<repo-name>/` for GitHub Pages. Update the URLs in `README.md` and `CLAUDE.md` too.
- Node version in the workflows, and the prefix list or length limit in `check-subject.sh` if the format differs.
- The required check names in the ruleset must match the job names (`check`, `dependency-review`).

## One-time repo setup, in order

1. Create the repo. It must be public for free GitHub Pages.
2. Pages: `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`.
3. Enable Dependabot alerts: `gh api -X PUT repos/<owner>/<repo>/vulnerability-alerts`. This also turns on the dependency graph, which `dependency-review` needs. Without it the job fails with `Forbidden`.
4. Allow squash merging only, and delete branches on merge.
5. Add a ruleset on the default branch:
   - require the `check` and `dependency-review` jobs, with the branch up to date
   - require conversations to be resolved
   - 0 required approvals (solo repo; an author can't approve their own PR)
   - linear history, no force-push, no deletion
   - repository admin can bypass through a pull request
   - no coverage rule unless coverage reporting exists, or it blocks every PR
6. Optional: `git config core.hooksPath .githooks` for the local commit-message check.

## Local `gh` and git setup

- Pushing workflow files needs the `workflow` scope: `gh auth refresh -h github.com -s workflow`.
- `gh auth setup-git` lets plain `git push` use `gh`'s credentials.

## Gotchas we hit

- A repo can be protected by **rulesets** even when classic branch protection says "not protected". Check both (`gh api repos/<owner>/<repo>/rulesets`).
- Copilot code review is not on the free plan, so don't plan on it as a reviewer or approver.
- The squash commit on the default branch is the PR title plus `(#<PR number>)`, so PR titles follow the commit format and issue numbers stay out of them.
- Editing a PR title re-runs CI (the `edited` trigger), so a bad title can be fixed without a new commit.
- A required check that reports an unrelated, existing advisory would block every PR. That's why PR vulnerability checks use Dependency Review and the weekly audit covers the rest.

## Later

When a second project exists, consider turning the shared pieces into a GitHub template repository so this checklist becomes "use this template".
