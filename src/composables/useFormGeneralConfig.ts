import type { KongManagerBaseFormConfig } from '@kong-ui-public/entities-shared'
import { useBaseGeneralConfig } from './useBaseGeneralConfig'

export const useFormGeneralConfig = () => {
  return useBaseGeneralConfig() as Pick<KongManagerBaseFormConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>
}
