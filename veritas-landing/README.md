# Veritas landing page

Promo site for the [Veritas](../README.md) browser extension, built with React, TypeScript and Vite.

Live: [maksymkorchynskyi.github.io/veritas-extension-project](https://maksymkorchynskyi.github.io/veritas-extension-project/)

## Development

Requirements: Node.js 24 (the version used in CI) and npm.

```bash
cd veritas-landing
npm ci
npm run dev       # dev server with HMR
npm run lint      # ESLint
npm run build     # type-check and production build into dist/
npm run preview   # serve the production build locally
```

## Deployment

The site is deployed to GitHub Pages by [`.github/workflows/deploy-landing.yml`](../.github/workflows/deploy-landing.yml) on every push to `merge/final-integration` that touches `veritas-landing/`. The workflow can also be started manually from the Actions tab.

The base path comes from the `BASE_PATH` environment variable (see `vite.config.ts`). It defaults to `/` locally; in CI it is set to the Pages path, e.g. `/veritas-extension-project/`.
