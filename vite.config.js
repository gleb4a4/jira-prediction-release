import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
function inlineAssetsPlugin() {
  return {
    name: 'inline-assets-plugin',
    enforce: 'post',
    transformIndexHtml(html, { bundle }) {
      // Знайшли всі CSS файли з пакету
      const cssFiles = Object.keys(bundle).filter(fileName =>
        fileName.endsWith('.css')
      )
      // Інлайн CSS
      const inlineStyles = cssFiles.map(fileName => {
        const cssCode = bundle[fileName].source || '' // CSS код
        // Видаляємо CSS файл з результату збірки
        delete bundle[fileName]
        // Вставляємо CSS як <style>...</style>
        return `<style>${cssCode}</style>`
      })

      // Знайшли всі JS файли
      const jsFiles = Object.keys(bundle).filter(fileName =>
        fileName.endsWith('.js')
      )
      // Інлайн JS
      const inlineScripts = jsFiles.map(fileName => {
        const jsCode = bundle[fileName].code || '' // JS код
        // Видаляємо JS файл з результату збірки
        delete bundle[fileName]
        // Вставляємо JS як <script>...</script>
        return `<script>${jsCode}</script>`
      })

      // Додаємо інлайн CSS у <head> і інлайн JS перед закриттям </body>
      return html
        .replace('</head>', `${inlineStyles.join('\n')}</head>`)
        .replace('</body>', `${inlineScripts.join('\n')}</body>`)
    }
  }
}


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    inlineAssetsPlugin()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    outDir: 'docs'
  }
})
