import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import yaml from '@modyfi/vite-plugin-yaml';
import path from 'path';

export default defineConfig({
  plugins: [react(), yaml()],
  // Vercel serves at root '/'; GitHub Pages needs '/repo-name/'.
  // Vercel sets the VERCEL env var during builds.
  base: process.env.VERCEL ? '/' : '/adhd-graph-explorer/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
