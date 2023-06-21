import { reactive } from 'vue'
import type { KongManagerBaseFormConfig } from '@kong-ui/entities-shared'

export const useFormGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: 'default',
    apiBaseUrl: 'http://localhost:8001', // TODO: use actual Admin API URL
  } as Pick<KongManagerBaseFormConfig, 'app' | 'workspace' | 'apiBaseUrl'>)
}
