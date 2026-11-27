// Injects the server-rendered app into dist/index.html, so the landing page
// ships as static HTML (fast first paint, crawlable) and React hydrates it.
// Runs after `vite build` and `vite build --ssr src/entry-server.tsx`.
import { readFile, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const indexPath = `${root}dist/index.html`;
const serverDir = `${root}dist-server`;

const { render } = await import(pathToFileURL(`${serverDir}/entry-server.js`).href);

const template = await readFile(indexPath, 'utf8');
const marker = '<!--app-html-->';
if (!template.includes(marker)) {
  throw new Error(`prerender: ${marker} not found in dist/index.html`);
}

await writeFile(indexPath, template.replace(marker, render()));
await rm(serverDir, { recursive: true, force: true });
console.log('prerender: dist/index.html written');
