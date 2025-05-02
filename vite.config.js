import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: 'https://gleb4a4.github.io/jira-prediction-release',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    outDir: 'docs',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // Всі файли (JS, CSS) збережуться поруч із index.html
        assetFileNames: '[name].[ext]', // Для статичних ресурсів
        chunkFileNames: '[name].js',   // Для зібраних JS-файлів
        entryFileNames: '[name].js',  // Для основного JS (entrypoint)
      },
    },

  },
})
