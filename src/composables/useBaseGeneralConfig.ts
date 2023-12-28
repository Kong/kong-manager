import { reactive } from 'vue'
import { config } from 'config'
import { useInfoStore } from '@/stores/info'
import type { KongManagerConfig } from '@kong-ui-public/entities-shared'

const infoStore = useInfoStore()

export const useBaseGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: infoStore.kongEdition,
      version: infoStore.kongVersion,
    },
    apiBaseUrl: config.ADMIN_API_URL,
  }) as KongManagerConfig
}
