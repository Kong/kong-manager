import { reactive } from 'vue'
import type { KongManagerBaseEntityConfig } from '@kong-ui/entities-shared'

export const useDetailGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: 'default',
    apiBaseUrl: 'http://localhost:8001', // TODO: use the actual Admin API URL instead of hard-coding it
  } as Pick<KongManagerBaseEntityConfig, 'app' | 'workspace' | 'apiBaseUrl'>)
}
