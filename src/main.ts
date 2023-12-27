import { createApp, onBeforeUnmount } from 'vue'
import App from './App.vue'
import './assets/index.css'
import './assets/base.css'
import './assets/scss/index.scss'
import 'element-plus/dist/index.css'
import ElementPlus from 'element-plus'
import rooter from './router/index'
import { Buffer } from 'buffer'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createPinia } from 'pinia'

window.Buffer = Buffer

const app: any = createApp(App)
app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

app.use(rooter)
    .use(createPinia())
    .mount('#app')

