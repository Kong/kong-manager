import { reactive } from 'vue'
import { config } from 'config'
import type { KongManagerBaseTableConfig } from '@kong-ui-public/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useListGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: config.GATEWAY_VERSION,
    },
    apiBaseUrl: useAdminApiUrl(),
    // Kong Gateway OSS only supports exact match and does not support sorting
    isExactMatch: true,
    disableSorting: true,
  } as Pick<KongManagerBaseTableConfig, 'app' | 'workspace' | 'gatewayInfo' | 'isExactMatch' | 'apiBaseUrl' | 'disableSorting'>)
}
