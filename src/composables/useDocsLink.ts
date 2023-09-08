import { computed } from 'vue'
import { formatVersion } from '@/utils'
import { config } from 'config'

export const useDocsLink = (entity: string) => {
  const edition = config.GATEWAY_EDITION ?? 'community'
  const version = computed(() => {
    if (!config.GATEWAY_VERSION) {
      return 'latest'
    }

    return edition === 'enterprise'
      // For Enterprise, the version has a pattern of <major>.<minor>.0.x where the 3rd digit
      // will always be 0 regardless of the actual patch version
      ? `${formatVersion(config.GATEWAY_VERSION)}.0.x`
      // For OSS, the version has a pattern of <major>.<minor>.x
      : `${formatVersion(config.GATEWAY_VERSION)}.x`
  })

  const docsBase = computed(() => `https://docs.konghq.com/gateway/api/admin-${edition === 'enterprise' ? 'ee' : 'oss'}/${version.value}/#/`)
  const docsLink = computed(() => `${docsBase.value}${entity}`)

  return docsLink
}
