import path from 'path'
import {defineConfig} from 'vite'
import eslint from 'vite-plugin-eslint'

import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    eslint({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    }),
  ],
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
