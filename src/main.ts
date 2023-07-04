import { createApp } from 'vue'
import axios from 'axios'
import Kongponents from '@kong/kongponents'
import { createI18n, Translation } from '@kong-ui-public/i18n'
import CopyUuid from '@kong-ui-public/copy-uuid'
import { vfgPlugin } from '@kong-ui/forms'
import english from '@/locales/en.json'
import App from '@/App.vue'
import { router } from '@/router'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'
import './styles/index'

const adminApiUrl = useAdminApiUrl()

const i18n = createI18n<typeof english>('en-us', english, { isGlobal: true })

const app = createApp(App)

app.use(Translation.install<typeof english>, { i18n })
app.use(Kongponents)
app.use(CopyUuid)
app.use(vfgPlugin, {
  apiService: {
    getOne: (entity: string, id: string) => {
      return axios.get(`${adminApiUrl}/${entity}/${id}`)
    },
    getAll: (entity: string) => {
      return axios.get(`${adminApiUrl}/${entity}`)
    },
  },
})
app.use(router)
app.mount('#app')
