import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
function inlineAssetsPlugin() {
  return {
    name: 'inline-assets-plugin',
    enforce: 'post',
    transformIndexHtml(html, { bundle }) {
      // CSS інлайнові стилі
      const cssFiles = Object.keys(bundle).filter(fileName =>
        fileName.endsWith('.css')
      )
      const inlineStyles = cssFiles.map(fileName => {
        const cssCode = bundle[fileName]?.source || '' // Отримуємо CSS
        delete bundle[fileName] // Видаляємо CSS-файл із результату збірки
        if (cssCode.includes('<')) {
          console.error(`Invalid CSS detected in ${fileName}`) // У разі помилки
        }
        return `<style>${cssCode}</style>` // Додаємо CSS у <style>
      })

      // JS інлайнові скрипти
      const jsFiles = Object.keys(bundle).filter(fileName =>
        fileName.endsWith('.js')
      )
      const inlineScripts = jsFiles.map(fileName => {
        const jsCode = bundle[fileName]?.code || '' // Отримуємо JS
        delete bundle[fileName] // Видаляємо JS-файл із результату збірки
        if (jsCode.includes('<')) {
          console.error(`Invalid JS detected in ${fileName}`) // У разі помилки
        }
        return `<script>${jsCode}</script>` // Додаємо JS у <script>
      })

      // Інлайн CSS у <head>, JS перед </body>
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
    outDir: 'docs',
    assetsInlineLimit: 0
  },
  publicPath: '/jira-prediction-releaset/'
})
