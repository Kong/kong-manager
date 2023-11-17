import { computed } from 'vue'
import { useInfoStore } from '@/stores/info'
import { useGatewayFeatureSupported as sharedComposable } from '@kong-ui-public/entities-shared'
import { config } from 'config'

type Arguments = Parameters<typeof sharedComposable>[0]

const infoStore = useInfoStore()
const kongVersion = computed(() => infoStore.kongVersion)

export const useGatewayFeatureSupported = (supportedRange: Arguments['supportedRange']) => {
  return sharedComposable({
    gatewayInfo: {
      edition: config.GATEWAY_EDITION ?? 'community',
      version: kongVersion.value ?? '',
    },
    supportedRange,
  })
}
