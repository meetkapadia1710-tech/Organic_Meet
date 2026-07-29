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
  },
  server: {
    port: 5173,
  },
});
