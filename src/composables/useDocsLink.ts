import { computed } from 'vue'
import { formatVersion } from '@/utils'
import { config } from 'config'

export const useDocsLink = (entity: string) => {
  const version = computed(() => {
    if (!config.GATEWAY_VERSION) {
      return 'latest'
    }

    return `${formatVersion(config.GATEWAY_VERSION)}.x`
  })

  const docsBase = computed(() => `https://docs.konghq.com/gateway/${version.value}/admin-api`)
  const docsLink = computed(() => {
    switch (entity) {
      case 'key-set':
        return `${docsBase.value}/#key-sets-entity`
      default:
        return `${docsBase.value}/#${entity}-object`
    }
  })

  return docsLink
}
