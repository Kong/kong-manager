import { formatVersion } from '@/utils'
import { type GatewayEdition } from 'config'
import { EntityType } from '@/types'
import { computed } from 'vue'
import { useInfoStore } from '@/stores/info'

const infoStore = useInfoStore()
const kongVersion = computed(() => infoStore.kongVersion)

const getVersionInPath = (edition: GatewayEdition) => {
  if (!kongVersion.value) {
    return 'latest'
  }

  return edition === 'enterprise'
    // For Enterprise, the version has a pattern of <major>.<minor>.0.x where the 3rd digit
    // will always be 0 regardless of the actual patch version
    ? `${formatVersion(kongVersion.value)}.0.x`
    // For OSS, the version has a pattern of <major>.<minor>.x
    : `${formatVersion(kongVersion.value)}.x`
}

export const useDocsLink = (entityType: EntityType) => {
  const edition = infoStore.kongEdition ?? 'community'
  const versionInPath = getVersionInPath(edition)
  const docsBase = `https://docs.konghq.com/gateway/api/admin-${edition === 'enterprise' ? 'ee' : 'oss'}/${versionInPath}/#/`

  const entityTypeToSpecLinkMap = {
    [EntityType.GatewayService]: 'Services',
    [EntityType.Route]: 'Routes',
    [EntityType.Consumer]: 'Consumers',
    [EntityType.ConsumerGroup]: 'consumer_groups',
    [EntityType.Plugin]: 'Plugins',
    [EntityType.Upstream]: 'Upstreams',
    [EntityType.Certificate]: 'Certificates',
    [EntityType.CACertificate]: 'CA Certificates',
    [EntityType.SNI]: 'SNIs',
    [EntityType.Key]: 'Keys',
    [EntityType.KeySet]: 'Key-sets',
    [EntityType.Target]: 'Targets',
    [EntityType.Vault]: 'Vaults',
  }
  const docsLink = `${docsBase}${entityTypeToSpecLinkMap[entityType] ?? ''}`

  return docsLink
}
