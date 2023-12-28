import { reactive } from 'vue'
import { config } from 'config'
import { useInfoStore } from '@/stores/info'
import type { KongManagerBaseEntityConfig } from '@kong-ui-public/entities-shared'

const infoStore = useInfoStore()

export const useDetailGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: infoStore.kongVersion,
    },
    apiBaseUrl: config.ADMIN_API_URL,
    jsonYamlEnabled: true,
  } as Pick<KongManagerBaseEntityConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl' | 'jsonYamlEnabled'>)
}
