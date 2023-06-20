import { createApp } from 'vue'
import Kongponents from '@kong/kongponents'
import '@kong/kongponents/dist/style.css'
import App from './App.vue'
import { router } from './router'

const app = createApp(App)

app.use(Kongponents)
app.use(router)
app.mount('#app')
