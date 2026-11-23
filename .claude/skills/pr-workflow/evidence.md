# Evidence for UI changes

Capture the same screens before and after, so a reviewer can compare them.

## Capture

1. **Baseline:** `git worktree add <scratchpad>/main-wt main`, then `npm ci` and `npm run build` there.
2. **Serve both builds** with `npx vite preview --port <port> --strictPort`, one port each. The app lives at `/pizza-per-inch/`.
3. **Drive Chrome** with `playwright-core` installed in the scratchpad, never in the repo. Launch with `executablePath` set to the installed Google Chrome, so no browser download is needed.
4. **Screens:** for each, light and dark (`colorScheme` option), 1280x800, `fullPage: true`. Add a 390 px wide viewport when the layout changed. Use the default sample pizzas only, since the repo is public.
5. **Look at every image** before describing it.
6. **Clean up:** stop each preview server by its listening PID (`lsof -ti tcp:<port> -sTCP:LISTEN`), then `git worktree remove --force` and `git worktree prune`.

## Save

Files go outside the repo, in `~/Captures/pizza-per-inch/<issue-number>/`, named `before-<screen>-<scheme>.png` and `after-<screen>-<scheme>.png`. Use the branch name in place of the issue number when there is no issue. Recordings are short `<flow>.gif` files.

## Attach

GitHub has no API for uploading images to a PR. Tell the author which files to drag into the Evidence section. Once they have, reformat it as a table with Before and After columns and Light and Dark rows, each image `width="420"` and labelled.
