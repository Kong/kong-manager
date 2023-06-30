import { reactive } from 'vue'
import type { KongManagerBaseEntityConfig } from '@kong-ui/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useDetailGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    apiBaseUrl: useAdminApiUrl(),
  } as Pick<KongManagerBaseEntityConfig, 'app' | 'workspace' | 'apiBaseUrl'>)
}
