import type { App } from 'vue'
import Kongponents from '@kong/kongponents'
import CopyUuid from '@kong-ui-public/copy-uuid'
import { vfgPlugin } from '@kong-ui/forms'
import PageHeader from '@/components/PageHeader.vue'
import HeaderBackButton from '@/components/HeaderBackButton.vue'
import HeaderEditButton from '@/components/HeaderEditButton.vue'
import { useAxios } from '@/composables/useAxios'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'

export const registerGlobalComponents = (app: App) => {
  const { axiosInstance } = useAxios()
  const adminApiUrl = useAdminApiUrl()

  app.use(Kongponents)
  app.use(CopyUuid)
  app.use(vfgPlugin, {
    apiService: {
      getOne: (entity: string, id: string) => {
        return axiosInstance.get(`${adminApiUrl}/${entity}/${id}`)
      },
      getAll: (entity: string) => {
        return axiosInstance.get(`${adminApiUrl}/${entity}`)
      },
    },
  })
  app.component('PageHeader', PageHeader)
  app.component('HeaderBackButton', HeaderBackButton)
  app.component('HeaderEditButton', HeaderEditButton)
}
