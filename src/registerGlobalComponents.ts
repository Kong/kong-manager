import type { App } from 'vue'
import Kongponents from '@kong/kongponents'
import { FORMS_API_KEY, VueFormGenerator } from '@kong-ui-public/forms'
import PageHeader from '@/components/PageHeader.vue'
import HeaderBackButton from '@/components/HeaderBackButton.vue'
import HeaderEditButton from '@/components/HeaderEditButton.vue'
import SupportText from '@/components/SupportText.vue'
import { apiService } from './services/apiService'

export const registerGlobalComponents = (app: App) => {
  app.use(Kongponents)
  app.component('VueFormGenerator', VueFormGenerator)
  app.provide(FORMS_API_KEY, {
    getOne: (entity: string, id: string) => {
      return apiService.findRecord(entity, id)
    },
    getAll: (entity: string, params: Record<string, string | number>) => {
      return apiService.findAll(entity, { params })
    },
  })
  app.component('PageHeader', PageHeader)
  app.component('HeaderBackButton', HeaderBackButton)
  app.component('HeaderEditButton', HeaderEditButton)
  app.component('SupportText', SupportText)
}
