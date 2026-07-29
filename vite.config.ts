import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/* The React app lives in web/ and builds to site-react/, so it can be brought
   to parity with the existing static build in site/ before anything is
   switched over. */
export default defineConfig({
  root: 'web',
  plugins: [react()],
  build: {
    outDir: '../site-react',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        /* React, ReactDOM and the router change on nobody's schedule but a
           dependency bump — the app code above them changes on every commit.
           Splitting them into their own chunk means a deploy invalidates only
           the chunk that actually changed, and a returning visitor's browser
           can keep serving this one from cache indefinitely. Named explicitly
           rather than left to Rollup's automatic grouping so the split stays
           the same shape across builds instead of shifting with whatever else
           happens to import react-router that week. */
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router', 'react-router/dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
