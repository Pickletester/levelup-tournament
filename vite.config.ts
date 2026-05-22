import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Served from https://pickletester.github.io/levelup-tournament/ in production,
  // but from / during local dev.
  base: command === 'build' ? '/levelup-tournament/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
}))
