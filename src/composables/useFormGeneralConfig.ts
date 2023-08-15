import { reactive } from 'vue'
import { config } from 'config'
import type { KongManagerBaseFormConfig } from '@kong-ui-public/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useFormGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: config.GATEWAY_VERSION,
    },
    apiBaseUrl: useAdminApiUrl(),
  } as Pick<KongManagerBaseFormConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>)
}
