import { reactive } from 'vue'
import type { KongManagerBaseFormConfig } from '@kong-ui/entities-shared'
import { useAdminApiUrl } from './useAdminApiUrl'

export const useFormGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    apiBaseUrl: useAdminApiUrl(),
  } as Pick<KongManagerBaseFormConfig, 'app' | 'workspace' | 'apiBaseUrl'>)
}
