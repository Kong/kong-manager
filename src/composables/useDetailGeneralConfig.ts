import { reactive } from 'vue'
import { config } from 'config'
import type { KongManagerBaseEntityConfig } from '@kong-ui-public/entities-shared'

export const useDetailGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: config.GATEWAY_VERSION,
    },
    apiBaseUrl: config.ADMIN_API_URL,
  } as Pick<KongManagerBaseEntityConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>)
}
