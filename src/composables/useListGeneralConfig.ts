import { reactive } from 'vue'
import { config } from 'config'
import { useInfoStore } from '@/stores/info'
import type { KongManagerBaseTableConfig } from '@kong-ui-public/entities-shared'

const infoStore = useInfoStore()

export const useListGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: infoStore.kongVersion,
    },
    apiBaseUrl: config.ADMIN_API_URL,
    // Kong Gateway OSS only supports exact match and does not support sorting
    isExactMatch: config.GATEWAY_EDITION === 'community',
    disableSorting: config.GATEWAY_EDITION === 'community',
  } as Pick<KongManagerBaseTableConfig, 'app' | 'workspace' | 'gatewayInfo' | 'isExactMatch' | 'apiBaseUrl' | 'disableSorting'>)
}
