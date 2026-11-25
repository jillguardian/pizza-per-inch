# Pizza per inch

Compare pizza prices by cost per square inch (or cm²). Enter each pizza's diameter and price, and the app shows the cost per area and highlights the best value. Pizzas are drawn to scale so size differences are easy to see.

## Features

- Round pizzas with name, diameter, price, and notes
- One currency per comparison, with a size unit (inches or cm) per pizza
- Best-value highlight

## Tech stack

- React 19 + TypeScript
- Mantine (UI components)
- Vite
- Vitest
- oxlint
- GitHub Pages, deployed with GitHub Actions

## Development

```sh
npm install
npm run dev      # http://127.0.0.1:5173/pizza-per-inch/
npm test
npm run lint
npm run build
```

## Deployment

Pushes to `main` run `.github/workflows/deploy.yml`, which tests, builds, and publishes to GitHub Pages. It can also be started by hand from the Actions tab ("Run workflow"), for example to redeploy after a failed run. In the repo settings, set Pages → Source to "GitHub Actions".

Pull requests run lint, tests, and build (`.github/workflows/ci.yml`).

## License

[MIT](LICENSE). The licenses of the packages the site includes are in `licenses.txt`, which the build writes and publishes with the site: <https://jillguardian.github.io/pizza-per-inch/licenses.txt>.
