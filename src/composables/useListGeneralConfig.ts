import { reactive, toRefs } from 'vue'
import type { KongManagerBaseTableConfig } from '@kong-ui-public/entities-shared'
import { useBaseGeneralConfig } from './useBaseGeneralConfig'
import { useInfoStore } from '@/stores/info'

const infoStore = useInfoStore()

export const useListGeneralConfig = () => {
  return reactive({
    ...toRefs(useBaseGeneralConfig()),
    // Kong Gateway OSS only supports exact match and does not support sorting
    isExactMatch: infoStore.kongEdition === 'community',
    disableSorting: infoStore.kongEdition === 'community',
  }) as Pick<KongManagerBaseTableConfig, 'app' | 'workspace' | 'gatewayInfo' | 'isExactMatch' | 'apiBaseUrl' | 'disableSorting'>
}
