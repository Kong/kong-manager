import { useGatewayFeatureSupported as sharedComposable } from '@kong-ui-public/entities-shared'
import { config } from 'config'

type Arguments = Parameters<typeof sharedComposable>[0]

export const useGatewayFeatureSupported = (supportedRange: Arguments['supportedRange']) => {
  return sharedComposable({
    gatewayInfo: {
      edition: config.GATEWAY_EDITION ?? 'community',
      version: config.GATEWAY_VERSION ?? '',
    },
    supportedRange,
  })
}
