# Veritas landing page

Promo site for the [Veritas](../README.md) browser extension, built with React 19, TypeScript and Vite.

## How it is built

- **Prerendered.** `npm run build` makes a client build, then an SSR build of `src/entry-server.tsx`, and `scripts/prerender.mjs` writes the rendered HTML into `dist/index.html`. The page ships as static HTML and React hydrates it.
- **Styling.** Plain CSS: design tokens and shared utilities in `src/styles/global.css` (cascade layers), one CSS Module per component. Colours match the extension (`extension/styles.css`).
- **Fonts** are self-hosted through Fontsource (Instrument Serif for headings, Manrope for text); there are no third-party requests.
- **Real numbers.** `src/lib/scoring.ts` is a port of `backend/app/services/scoring.py`. Every score in the mock-ups and the "Try the model" playground comes from it, so keep the two files in sync.
- **Accessibility.** Skip link, landmarks, WAI-ARIA tabs and carousel, visible focus, `prefers-reduced-motion` support; decorative mock-ups are hidden from assistive tech.
- `public/og-image.png` (social preview) and `public/apple-touch-icon.png` are screenshots of the page and the logo; regenerate them if the hero changes.

Live: [maksymkorchynskyi.github.io/veritas-extension-project](https://maksymkorchynskyi.github.io/veritas-extension-project/)

## Development

Requirements: Node.js 24 (the version used in CI) and npm.

```bash
cd veritas-landing
npm ci
npm run dev       # dev server with HMR
npm run lint      # ESLint
npm run build     # type-check, build and prerender into dist/
npm run preview   # serve the production build locally
```

## Deployment

The site is deployed to GitHub Pages by [`.github/workflows/deploy-landing.yml`](../.github/workflows/deploy-landing.yml) on every push to `merge/final-integration` that touches `veritas-landing/`. The workflow can also be started manually from the Actions tab.

The base path comes from the `BASE_PATH` environment variable (see `vite.config.ts`). It defaults to `/` locally; in CI it is set to the Pages path, e.g. `/veritas-extension-project/`.
