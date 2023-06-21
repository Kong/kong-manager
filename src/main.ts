import { createApp } from 'vue'
import Kongponents from '@kong/kongponents'
import { createI18n, Translation } from '@kong-ui-public/i18n'
import english from '@/locales/en.json'
import App from '@/App.vue'
import { router } from '@/router'
import './styles/index'

const i18n = createI18n<typeof english>('en-us', english, { isGlobal: true })

const app = createApp(App)

app.use(Translation.install<typeof english>, { i18n })
app.use(Kongponents)
app.use(router)
app.mount('#app')
