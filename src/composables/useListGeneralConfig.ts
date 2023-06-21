import { reactive } from 'vue'
import type { KongManagerBaseTableConfig } from '@kong-ui/entities-shared'

export const useListGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: 'default',
    apiBaseUrl: 'http://localhost:8001', // TODO: use the actual Admin API URL instead of hard-coding it
  } as Pick<KongManagerBaseTableConfig, 'app' | 'workspace' | 'apiBaseUrl'>)
}
