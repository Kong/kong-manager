import { reactive, toRefs } from 'vue'
import type { KongManagerBaseEntityConfig } from '@kong-ui-public/entities-shared'
import { useBaseGeneralConfig } from './useBaseGeneralConfig'

export const useDetailGeneralConfig = () => {
  return reactive({
    ...toRefs(useBaseGeneralConfig()),
  }) as Pick<KongManagerBaseEntityConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>
}
