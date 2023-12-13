import { reactive, toRefs } from 'vue'
import { config } from 'config'
import type { KongManagerBaseTableConfig } from '@kong-ui-public/entities-shared'
import { useBaseGeneralConfig } from './useBaseGeneralConfig'

export const useListGeneralConfig = () => {
  return reactive({
    ...toRefs(useBaseGeneralConfig()),
    // Kong Gateway OSS only supports exact match and does not support sorting
    isExactMatch: config.GATEWAY_EDITION === 'community',
    disableSorting: config.GATEWAY_EDITION === 'community',
  }) as Pick<KongManagerBaseTableConfig, 'app' | 'workspace' | 'gatewayInfo' | 'isExactMatch' | 'apiBaseUrl' | 'disableSorting'>
}
