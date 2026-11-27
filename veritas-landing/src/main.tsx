import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource-variable/manrope/wght.css';
import './styles/global.css';
import App from './App';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production build is prerendered (scripts/prerender.mjs), so hydrate it;
// the dev server serves an empty root, so render from scratch there.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
