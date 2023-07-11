import { reactive } from 'vue'
import type { KongManagerBaseEntityConfig } from '@kong-ui/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useDetailGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: 'community',
      version: '3.4.0.0',
    },
    apiBaseUrl: useAdminApiUrl(),
  } as Pick<KongManagerBaseEntityConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>)
}
