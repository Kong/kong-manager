import { computed } from 'vue'
import { useInfoStore } from '@/stores/info'
import { useGatewayFeatureSupported as sharedComposable } from '@kong-ui-public/entities-shared'

type Arguments = Parameters<typeof sharedComposable>[0]

const infoStore = useInfoStore()
const kongEdition = computed(() => infoStore.kongEdition)
const kongVersion = computed(() => infoStore.kongVersion)

export const useGatewayFeatureSupported = (supportedRange: Arguments['supportedRange']) => {
  return sharedComposable({
    gatewayInfo: {
      edition: kongEdition.value ?? 'community',
      version: kongVersion.value ?? '',
    },
    supportedRange,
  })
}
