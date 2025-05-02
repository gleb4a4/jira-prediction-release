import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
function inlineAssetsPlugin() {
  return {
    name: 'inline-assets-plugin',
    enforce: 'post',
    transformIndexHtml(html, { bundle }) {
      // Знайдемо всі CSS файли та їх вміст
      const cssFiles = Object.keys(bundle).filter(fileName =>
        fileName.endsWith('.css')
      )
      const inlineStyles = cssFiles.map(fileName => {
        const cssCode = bundle[fileName]?.source || '' // Вміст CSS
        // Перевірка, чи CSS код валідний
        if (cssCode.trim().startsWith('<')) {
          console.error(`Invalid CSS content detected: ${fileName}`)
        }
        delete bundle[fileName]
        return `<style>${cssCode}</style>`
      })

      // Знайдемо всі JS файли та їх вміст
      const jsFiles = Object.keys(bundle).filter(fileName =>
        fileName.endsWith('.js')
      )
      const inlineScripts = jsFiles.map(fileName => {
        const jsCode = bundle[fileName]?.code || '' // Вміст JS
        // Перевірка, чи JS код валідний
        if (jsCode.trim().startsWith('<')) {
          console.error(`Invalid JS content detected: ${fileName}`)
        }
        delete bundle[fileName]
        return `<script>${jsCode}</script>`
      })

      // Генеруємо HTML з інлайн-ресурсами
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
  }
})
