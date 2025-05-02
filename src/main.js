import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { marked } from 'marked';



const app  = createApp(App)
fetch('https://gleb4a4.github.io/jira-prediction-release/README.md')
  .then((response) => {
    if (!response.ok) {
      throw new Error('Не вдалося завантажити README.md');
    }
    return response.text();
  })
  .then((readmeContent) => {
    const readmeHtml = marked(readmeContent);
    app.provide('readmeContent', readmeHtml);
    app.mount('#app');
  })
  .catch((error) => {
    console.error('Помилка завантаження README.md:', error);
    app.mount('#app');
  });


