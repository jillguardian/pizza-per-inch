# Conventions

Rules for working in this repo, and why they exist. Add new ones here, not in `CLAUDE.md`.

## Dependencies

- **Pin exact versions** (no `^` or `~`). `.npmrc` sets `save-exact=true`, so `npm install <pkg>` pins automatically.
  *Why:* upgrades happen on purpose, through reviewed Dependabot PRs, never by accident.
- **Dependabot** opens weekly PRs for npm packages and GitHub Actions (`.github/dependabot.yml`). Merge them deliberately; CI must pass.
- **Vulnerability checks:** `npm audit --audit-level=high` runs as a separate `audit` job on every PR (`ci.yml`) and weekly (`audit.yml`). The PR job is **not** a required check.
  *Why:* a newly published advisory can fail the audit for reasons unrelated to the PR, so it must be visible without blocking merges. The weekly run and Dependabot alerts are the safety net.
  *Why:* a weekly run catches advisories published between PRs.
- Before adding a dependency, check it earns its weight. Prefer the standard library or built-in browser APIs (e.g. `Intl`).

## Code

- **Explicit return type on every function**, enforced by oxlint. React components return `ReactElement`.
  *Why:* the type becomes part of the function's documented contract, and accidental return types can't leak.
- **Wrap component props in `Readonly<>`** (`props: Readonly<Props>`).
  *Why:* components must never mutate their props.
- **Keep `src/lib/` free of UI.** Pure logic only, so it is easy to test.
- **Colocate tests** next to the code they cover (`foo.ts` and `foo.test.ts`). Every module with logic or behavior has one; `main.tsx` and CSS are exempt.
- **Test behavior the way a user sees it**: Testing Library queries by role and label, `user-event` for interaction. Don't assert on class names or internals.

## Structure

Files are grouped by type (`lib/`, `components/`) while the app is small. When a second feature arrives (for example sharing or persistence), group by feature instead: `src/features/<feature>/{components,lib}`, with shared code in `src/shared/`.

### Splitting types and constants

Keep types and constants next to the code that uses them. Split only when one of these happens:

- The file passes roughly 150–200 lines, or mixes unrelated concerns.
- Several modules share the same types or constants, or two modules import each other.

When splitting:

- Turn the file into a folder (for example `lib/pizza/{types,area,ranking}.ts`) with an `index.ts`, so existing imports keep working.
- Name files by domain, not `constants.ts` or `utils.ts`, which become dumping grounds.
- A component's props type always stays in the component's file.

## Git

- **Commit format:** `Prefix: Short imperative summary`, for example `Fix: Grid column overflow`.
  Prefixes: `Feat`, `Fix`, `Refactor`, `Docs`, `Test`, `Upgrade`, `Chore`. Don't repeat the prefix verb in the summary (`Upgrade: React to 19`, not `Upgrade: Upgrade React`).
- **Merging:** PRs are squash-merged (the only method the repo allows), so `main` gets one commit per PR. Its subject is the PR title, with `(#<PR number>)` added by GitHub. PR titles therefore follow the same `Prefix: Summary` format.
- **Issue references:** put `Closes #12` in the PR description so the issue closes on merge. Keep issue numbers out of commit subjects and PR titles.
  *Why:* GitHub appends the PR number to the squashed subject, so an issue number there would look like a second PR link.
- Commits inside a branch may carry `Refs #12` in the body. The squash folds them into one commit, so this mainly helps reviewers.
- **Branches:** `<type>/<issue-number>-<short-description>`, for example `feat/16-rank-pizzas` or `fix/5-validate-inputs`.
  - `<type>` is the lowercase commit prefix (`feat`, `fix`, `refactor`, `docs`, `test`, `upgrade`, `chore`).
  - The description is a few lowercase words joined by hyphens, under about 40 characters in total.
  - Work without an issue drops the number (`chore/bump-node`).
  - One topic per branch and PR. Branches are deleted on merge.
  *Why the issue number:* branch names don't reach `main` after a squash, so it can't be mistaken for the PR link, and it makes the branch easy to trace back to its issue.
- **Rebase, don't merge.** Pull with `--rebase`. Rebasing a pushed branch needs `--force-with-lease`, never plain `--force`.
- **Pull requests** use `.github/pull_request_template.md`. CI must pass before merging.
- **Dependabot** commits use the `Upgrade` prefix to match this format.

### Enforcement

- **CI** (`ci.yml`, the `check` job) checks the PR title and every commit subject in the PR with `scripts/check-subject.sh`. It re-runs when the title is edited. Maximum length is 100 characters, which leaves room for Dependabot's longer titles and the `(#N)` GitHub appends.
- **Local hook (optional):** `git config core.hooksPath .githooks` runs the same check on every commit message. `fixup!` and `squash!` commits are allowed locally for `git rebase --autosquash`, but CI rejects them, so squash them before pushing.
- A `git revert` message (`Revert "..."`) doesn't match the format. Reword it before pushing.
- Commits already on `main` from before this rule (the first Dependabot PRs) keep their old `Build(deps)` subjects.
- Not checked automatically: repeating the prefix verb in the summary (`Upgrade: Upgrade React`). That stays a review item.

### Repository rules

The `Default branch` ruleset (Settings -> Rules) protects `main`:

- The `check` CI job must pass, and the branch must be up to date. The `audit` job is deliberately not required.
- Conversations must be resolved before merging.
- No required approving reviews: this is a solo repo, and an author can't approve their own PR. The review is `/code-review`, whose resolved threads are the record.
- Linear history; no force-push or deletion.
- Repository admins can bypass through a pull request.
