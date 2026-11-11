import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from a sub-path (/<repo>/), so CI passes it
  // in BASE_PATH. Local dev and preview keep the root path.
  base: process.env.BASE_PATH || '/',
})
