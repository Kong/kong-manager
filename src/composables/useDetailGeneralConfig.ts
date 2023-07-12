import { reactive } from 'vue'
import { config } from 'config'
import type { KongManagerBaseEntityConfig } from '@kong-ui/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useDetailGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: config.GATEWAY_VERSION,
    },
    apiBaseUrl: useAdminApiUrl(),
  } as Pick<KongManagerBaseEntityConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>)
}
