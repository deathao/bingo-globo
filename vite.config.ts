import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/bingo-globo/', // 👈 ESSENCIAL para GitHub Pages
  plugins: [react()],
});