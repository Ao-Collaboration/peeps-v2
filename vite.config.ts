import path from 'path'
import {defineConfig} from 'vite'

import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  esbuild: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
