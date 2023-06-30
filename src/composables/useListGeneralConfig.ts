import { reactive } from 'vue'
import type { KongManagerBaseTableConfig } from '@kong-ui/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useListGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    apiBaseUrl: useAdminApiUrl(),
  } as Pick<KongManagerBaseTableConfig, 'app' | 'workspace' | 'apiBaseUrl'>)
}
