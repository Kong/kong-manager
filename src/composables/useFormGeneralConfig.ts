import { reactive } from 'vue'
import type { KongManagerBaseFormConfig } from '@kong-ui/entities-shared'

export const useFormGeneralConfig = () => {
  return reactive({
    app: 'kongManager' as const,
    workspace: '',
    apiBaseUrl: 'http://localhost:8001', // TODO: use the actual Admin API URL instead of hard-coding it
  } as Pick<KongManagerBaseFormConfig, 'app' | 'workspace' | 'apiBaseUrl'>)
}
