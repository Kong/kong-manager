import { reactive } from 'vue'
import type { KongManagerBaseFormConfig } from '@kong-ui/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useFormGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: 'community',
      version: '3.4.0.0',
    },
    apiBaseUrl: useAdminApiUrl(),
  } as Pick<KongManagerBaseFormConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>)
}
