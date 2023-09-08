import { computed } from 'vue'
import { formatVersion } from '@/utils'
import { config, type GatewayEdition } from 'config'
import { EntityType } from '@/types'

const getVersionInPath = (edition: GatewayEdition) => {
  if (!config.GATEWAY_VERSION) {
    return 'latest'
  }

  return edition === 'enterprise'
    // For Enterprise, the version has a pattern of <major>.<minor>.0.x where the 3rd digit
    // will always be 0 regardless of the actual patch version
    ? `${formatVersion(config.GATEWAY_VERSION)}.0.x`
    // For OSS, the version has a pattern of <major>.<minor>.x
    : `${formatVersion(config.GATEWAY_VERSION)}.x`
}

export const useDocsLink = (entityType: EntityType) => {
  const edition = config.GATEWAY_EDITION ?? 'community'
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
  const docsLink = computed(() => `${docsBase}${entityTypeToSpecLinkMap[entityType] ?? ''}`)

  return docsLink
}
