import { reactive } from 'vue'
import { config } from 'config'
import type { KongManagerBaseTableConfig } from '@kong-ui/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useListGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: config.GATEWAY_VERSION,
    },
    // Kong Gateway OSS only supports exact match
    isExactMatch: true,
    apiBaseUrl: useAdminApiUrl(),
  } as Pick<KongManagerBaseTableConfig, 'app' | 'workspace' | 'gatewayInfo' | 'isExactMatch' | 'apiBaseUrl'>)
}
