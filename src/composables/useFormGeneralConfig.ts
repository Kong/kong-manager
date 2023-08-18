import { reactive } from 'vue'
import { config } from 'config'
import type { KongManagerBaseFormConfig } from '@kong-ui-public/entities-shared'

export const useFormGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    gatewayInfo: {
      edition: config.GATEWAY_EDITION,
      version: config.GATEWAY_VERSION,
    },
    apiBaseUrl: config.ADMIN_API_URL,
  } as Pick<KongManagerBaseFormConfig, 'app' | 'workspace' | 'gatewayInfo' | 'apiBaseUrl'>)
}
