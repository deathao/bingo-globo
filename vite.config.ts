import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 👇 Ajusta para rodar na raiz do domínio personalizado
export default defineConfig({
  base: '/', // ← IMPORTANTE!
  plugins: [react()],
})