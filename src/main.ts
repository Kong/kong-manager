import { createApp } from 'vue'
import Kongponents from '@kong/kongponents'
import App from './App.vue'
import { router } from './router'
import './styles/index'

const app = createApp(App)

app.use(Kongponents)
app.use(router)
app.mount('#app')
