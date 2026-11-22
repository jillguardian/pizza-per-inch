# Pizza per inch

Static React/TypeScript app that compares pizza prices per area. No backend.

## Commands

- `npm run dev`: dev server at `/pizza-per-inch/`
- `npm test`: Vitest
- `npm run lint`: oxlint
- `npm run build`: type-check and production build
- `npm audit --audit-level=high`: vulnerability check (also runs in CI)

## Structure

- `src/lib/`: pure logic with colocated tests (`pizza.ts`, `currencies.ts`)
- `src/components/`: React components (`PizzaVisual.tsx`, SVG drawn to scale)
- `src/App.tsx`: state and page layout

## Conventions

@docs/conventions.md

## Gotchas

- `vite.config.ts` sets `base: '/pizza-per-inch/'` for GitHub Pages. Rename it together with the repo, or assets will 404.
- Compared pizzas share one currency. Each pizza has its own size unit; areas are converted to a common unit to compare. Mixing currencies is out of scope.

## Decisions (v1)

- Round pizzas only
- No persistence
- Currencies come from `Intl.supportedValuesOf`
- Enhancements (square pizzas, saving, sharing, UI library) are tracked as GitHub issues.
