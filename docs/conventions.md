# Conventions

Rules for working in this repo, and why they exist. Add new ones here, not in `CLAUDE.md`.

## Dependencies

- **Pin exact versions** (no `^` or `~`). `.npmrc` sets `save-exact=true`, so `npm install <pkg>` pins automatically.
  *Why:* upgrades happen on purpose, through reviewed Dependabot PRs, never by accident.
- **Dependabot** opens weekly PRs for npm packages and GitHub Actions (`.github/dependabot.yml`). Merge them deliberately; CI must pass.
- **Vulnerability checks:** `npm audit --audit-level=high` runs on every PR (`ci.yml`) and weekly (`audit.yml`).
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
- **Branches:** `feat/short-name`, `fix/short-name`, and so on, matching the commit prefix. One topic per branch and PR.
- **Rebase, don't merge.** Pull with `--rebase`. Rebasing a pushed branch needs `--force-with-lease`, never plain `--force`.
- **Pull requests** use `.github/pull_request_template.md`. CI must pass before merging.
- **Dependabot** commits use the `Upgrade` prefix to match this format.
