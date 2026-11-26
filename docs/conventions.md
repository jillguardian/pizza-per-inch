# Conventions

Rules for working in this repo, and why they exist. Add new ones here, not in `CLAUDE.md`.

## Dependencies

- **Pin exact versions** (no `^` or `~`). `.npmrc` sets `save-exact=true`, so `npm install <pkg>` pins automatically.
  _Why:_ upgrades happen on purpose, through reviewed Dependabot PRs, never by accident.
- **Keep `@types/node` on the same major as the Node version in the workflows** (`node-version` in `.github/workflows/`). Change them together.
  _Why:_ otherwise the type checker accepts Node APIs that don't exist in CI.
- **Pin GitHub Actions to a full commit SHA** with the version in a trailing comment (`uses: actions/checkout@<sha> # v7`). Dependabot updates both.
  _Why:_ tags can be moved, so a compromised action could change what runs in CI. A SHA can't.
- **Dependabot** opens weekly PRs for npm packages and GitHub Actions (`.github/dependabot.yml`). Merge them deliberately; CI must pass.
- **Vulnerability checks:**
  - PRs: a `dependency-review` job (GitHub's Dependency Review action) fails when a PR adds or changes a dependency with a known `high` or `critical` vulnerability.
  - Weekly: `npm audit --audit-level=high` (`audit.yml`) covers advisories published for dependencies that are already in the tree. Dependabot alerts do too.
    _Why:_ the PR check only looks at what the PR changes, so it can't fail because of an unrelated, newly published advisory and can safely be required. The weekly audit catches the rest.
- **Licenses:** every package the site ships (the production dependencies and what they depend on) must have a license on the list in `scripts/licenses.ts` (MIT, ISC, BSD, Apache-2.0, 0BSD, CC0). `npm run build` checks it and fails on any other, so a new dependency with, say, a GPL license is stopped until someone has read the license and added it to the list on purpose. The same step writes `dist/licenses.txt`, the notices that are published with the site.
  _Why:_ the MIT license and its relatives ask that their copyright notice travels with copies of the software, and the minifier removes the comments that used to carry it. Development tools are not shipped, so they are not checked.
- Before adding a dependency, check it earns its weight. Prefer the standard library or built-in browser APIs (e.g. `Intl`).

## Code

- **Format with Prettier** (`npm run format`). CI runs `npm run format:check` and fails on unformatted files. Settings are in `.prettierrc.json`: no semicolons, single quotes, 100 columns.
  _Why:_ formatting is decided by the tool, so reviews stay about the code.
- **Lint rules** live in `.oxlintrc.json`, and `npm run lint` fails on warnings (`--deny-warnings`). Beyond the defaults they ban `any`, non-null assertions (`!`), `@ts-ignore`-style comments, `console` and loose equality (`==`), and require `exhaustive-deps` in hooks and `import { type X }` for type-only imports. Fix the code instead of disabling a rule; if a rule really doesn't fit, change it in the config and say why in the PR.
  _Why:_ a warning that never fails the build gets ignored. oxlint has no rule against blanket `eslint-disable` comments, so reviews catch those.
- **Explicit return type on every function**, enforced by oxlint. React components return `ReactElement`.
  _Why:_ the type becomes part of the function's documented contract, and accidental return types can't leak.
- **Wrap component props in `Readonly<>`** (`props: Readonly<Props>`).
  _Why:_ components must never mutate their props.
  _Not enforced by a linter:_ oxlint has no rule for React props. The closest, `typescript/prefer-readonly-parameter-types`, needs type-aware linting and flags every function parameter, not only props. This stays a review item.
- **Keep `src/lib/` free of UI.** Pure logic only, so it is easy to test.
- **Coverage is measured on every PR, and a drop fails the `check` job.** `npm run coverage` runs the tests with V8 coverage (`@vitest/coverage-v8`) and fails when lines, statements or functions fall below 95%, or branches below 90% (set in `vite.config.ts`). CI prints the numbers in the job summary. Run it locally and open `coverage/index.html` to see which lines the tests miss.
  _Why Vitest's thresholds and not GitHub's coverage rule:_ the rule is in public preview, needs an owner-only setting and an upload step, while the thresholds work inside the job that is already required.
  _Keep the thresholds a little below what the tests reach:_ they should catch a drop, not fail on small changes. Raise them when coverage rises, and never lower them to get a PR through without saying why in the PR. `main.tsx`, tests and the test setup are not counted.
- **Colocate tests** next to the code they cover (`foo.ts` and `foo.test.ts`). Every module with logic or behavior has one; `main.tsx` and CSS are exempt.
- **Test behavior the way a user sees it**: Testing Library queries by role and label, `user-event` for interaction. Don't assert on class names or internals.

## Colors

- **Colors are chosen in `src/theme.ts` only**, as named tokens: text colors with a light and a dark value (`mutedText`, `bestValue`), and fills with one value and white text on them (`primary` and the rank colors). Components and styles use the names: Mantine's `c="dimmed"`, the rank palettes (`rank-1`, `rank-2`, `rank-3`, `rank-other`, handed out by `rankColor()`), or the CSS variable `--app-color-best-value`. Never write a hex value, a Mantine palette name (`green`) or a palette shade variable (`--mantine-color-green-6`) in a component or a stylesheet.
  _Why:_ one place decides the colors, so contrast can be checked once and a light and dark theme only needs the values changed there.
- **Every token needs a declared contrast** in `src/theme.test.ts`: text on each surface it sits on, or white text on the fill. Text needs 4.5:1 (WCAG AA), in light and in dark. A new text token fails the "left unchecked" test until it is declared, and a new fill is checked automatically.
- **The theme toggle** (light, dark, system) is Mantine's own color scheme. It saves the choice in `localStorage`, and a small script in `index.html` applies it before the page paints, so a saved "dark" does not flash light. That script repeats Mantine's storage key and attribute name, and a test fails if Mantine's differ.
- **How to add a color:**
  1. Add the token to `TEXT_TOKENS` (light and dark values) or `FILL_TOKENS` (one value) in `src/theme.ts`.
  2. Expose it: a Mantine palette in `theme.colors`, or a CSS variable in `cssVariablesResolver`.
  3. Declare its contrast pair in `src/theme.test.ts`.
- **Not covered:** the pizza drawing is artwork (`PizzaVisual.tsx`). The red remove button and the grey arrows use Mantine's own colors, are allowed by name in the test, and are checked by axe and by eye.
- **Mantine details** (9.8.x): `cssVariablesResolver` returns `{ variables, light, dark }`. Overriding Mantine's own `--mantine-color-dimmed` works, and it also fixes the description under inputs. A `color` prop on a filled component takes a palette name, so the rank colors are palettes of one shade.

## Accessibility

- **`npm run a11y` runs axe in real Chrome** against the production build, at 375, 768 and 1280px, in light and dark, on the example offers and on a busy page (bundle controls on, four ranked offers, sorted). It fails on any WCAG 2.x A/AA or best-practice violation, on an error thrown by the page, and on a run that could not finish. axe's "incomplete" results (checks it could not decide) are printed as notes, not failures. CI runs it as the `accessibility` job.
  _Why real Chrome:_ jsdom has no layout, so it cannot measure color contrast. The check also covers names, labels and roles on the whole page.
- **One more run asks Chrome for reduced motion** and fails if any element still has a transition or an animation. `src/App.css` switches them all off under `prefers-reduced-motion: reduce`, because Mantine's own `respectReducedMotion` setting (on in `theme.ts`) only reaches its pop-in components, not its plain CSS fades.
- **Chrome must be installed** to run it (it uses `channel: 'chrome'`, so no browser is downloaded). GitHub's Ubuntu runners have it.
- **Focusing a pinned control must not scroll the page.** `html` has a `scroll-padding-top` so a field that gets keyboard focus is scrolled clear of the pinned bar. The pinned controls (`.toolbar-actions` and `.page-actions`) already sit at the top of the screen, which is inside that padded zone, so they get a negative `scroll-margin-top` of the same size. Without it, a click or a Tab onto them scrolls the page. A last run of `npm run a11y` focuses each pinned control on a scrolled page and fails if the page moves. A new pinned control must sit inside one of those two elements, or get the same margin.
- **Add a state** to `scripts/check-a11y.ts` when a new screen or control appears that the busy page does not show.
- **Still manual:** axe finds only part of the problems. Keyboard-only use and a screen reader pass (VoiceOver) are checked by hand. The tests check where focus lands and what is announced.
- **Dev dependencies:** `axe-core` (MPL-2.0) and `playwright-core` (Apache-2.0) are used only by this check and are never shipped with the site.

## Screen sizes

Layouts are checked by hand in a real browser at these widths (jsdom can't lay out a page, so the tests don't cover them). Below 320px nothing is promised.

| Size    | Width         | Checked at | Toolbar                                                                                                                               |
| ------- | ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile  | 320–767px     | 320, 375   | Currency and price unit share a row at full width. The pinned add and sort bar is the second row, and the checkbox has the third row. |
| Tablet  | 768–1023px    | 768        | The selects are equal and full width. The second row has the pinned add and sort buttons on the left and the checkbox on the right.   |
| Desktop | 1024px and up | 1024, 1280 | The selects keep a natural width. The second row has the pinned add and sort buttons and the checkbox side by side, all on the left.  |

- The layout breakpoints are `48em` (768px) and `64em` (1024px). Media queries can't read CSS variables, so the values are repeated in `App.css` and `Toolbar.css`; change them together.
- Design for 375px first, and make sure nothing scrolls sideways at 320px.
- Only the add and sort buttons are pinned. Settings are chosen once, so they scroll away.
  _Why:_ a tall pinned toolbar takes too much of a phone screen.

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
- **Issue references:** every PR names its issue in the description: `Closes #12` when it finishes it (so the issue closes on merge), `Refs #12` when it is one part of it. Keep issue numbers out of commit subjects and PR titles.
  _Why:_ GitHub appends the PR number to the squashed subject, so an issue number there would look like a second PR link.
  - _Exempt:_ Dependabot PRs, and the rare PR with the `no-issue` label and a line `No issue: <why>` in the description, for example a typo. Whether a change deserves this is a judgement for the author and the reviewer: CI only checks that the label and the reason are there, and a change to behavior should have an issue.
- Commits inside a branch may carry `Refs #12` in the body. The squash folds them into one commit, so this mainly helps reviewers.
- **Branches:** `<type>/<issue-number>-<short-description>`, for example `feat/16-rank-pizzas` or `fix/5-validate-inputs`.
  - `<type>` is the lowercase commit prefix (`feat`, `fix`, `refactor`, `docs`, `test`, `upgrade`, `chore`).
  - The description is a few lowercase words joined by hyphens, under about 40 characters in total.
  - Work without an issue drops the number (`chore/bump-node`).
  - One topic per branch and PR. Branches are deleted on merge.
    _Why the issue number:_ branch names don't reach `main` after a squash, so it can't be mistaken for the PR link, and it makes the branch easy to trace back to its issue.
- **Rebase, don't merge.** Pull with `--rebase`. Rebasing a pushed branch needs `--force-with-lease`, never plain `--force`.
- **Pull requests** use `.github/pull_request_template.md`. CI must pass and conversations must be resolved before merging.
- **Dependabot** commits use the `Upgrade` prefix to match this format.

### Enforcement

- **CI** (`ci.yml`, the `check` job) checks the PR title and every commit subject in the PR with `scripts/check-subject.sh`, and that the PR description names an issue (or is exempt) with `scripts/check-pr-issue.sh`. It re-runs when the title or the description is edited. Adding a label does not re-run it, so add the `No issue:` line after the label. Maximum length is 100 characters, which leaves room for Dependabot's longer titles and the `(#N)` GitHub appends.
- **Local hook (optional):** `git config core.hooksPath .githooks` runs the same check on every commit message. `fixup!` and `squash!` commits are allowed locally for `git rebase --autosquash`, but CI rejects them, so squash them before pushing.
- A `git revert` message (`Revert "..."`) doesn't match the format. Reword it before pushing.
- Commits already on `main` from before this rule (the first Dependabot PRs) keep their old `Build(deps)` subjects.
- Not checked automatically: repeating the prefix verb in the summary (`Upgrade: Upgrade React`). That stays a review item.
