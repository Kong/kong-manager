import { reactive } from 'vue'
import { config } from 'config'
import { useInfoStore } from '@/stores/info'
import type { KongManagerBaseFormConfig } from '@kong-ui-public/entities-shared'

const infoStore = useInfoStore()

export const useFormGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: infoStore.kongVersion,
    },
    apiBaseUrl: config.ADMIN_API_URL,
  } as Pick<KongManagerBaseFormConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>)
}
