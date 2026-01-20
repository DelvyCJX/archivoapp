import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/archivoapp/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        entryFileNames: 'index.js',
        chunkFileNames: 'index.js',
        assetFileNames: 'index.[ext]'
      }
    },
    assetsInlineLimit: 100000000,
    cssCodeSplit: false
  },
  server: {
    port: 3000,
    open: true
  }
})
