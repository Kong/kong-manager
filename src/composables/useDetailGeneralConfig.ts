import { reactive } from 'vue'
import type { KongManagerBaseEntityConfig } from '@kong-ui/entities-shared'

export const useDetailGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: 'default',
    apiBaseUrl: 'http://localhost:8001', // TODO: use actual Admin API URL
  } as Pick<KongManagerBaseEntityConfig, 'app' | 'workspace' | 'apiBaseUrl'>)
}
