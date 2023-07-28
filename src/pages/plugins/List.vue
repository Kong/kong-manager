<template>
  <PageHeader
    v-if="!entityType"
    :title="t('entities.plugin.list.title')"
  >
    <template #below-title>
      <SupportText>
        {{ t('entities.plugin.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <PluginList
    :cache-identifier="cacheIdentifier"
    :config="pluginListConfig"
    :can-create="canCreate"
    :can-delete="canDelete"
    :can-edit="canEdit"
    :can-toggle="canToggle"
    :can-retrieve="canRetrieve"
    :can-retrieve-scoped-entity="canRetrieveScopedEntity"
    @copy:success="onCopySuccess"
    @copy:error="onCopyError"
    @delete:success="onDeleteSuccess"
    @toggle-enabled="onToggleEnabled"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, type RouteLocationRaw } from 'vue-router'
import { PluginList, type EntityRow, type ViewRouteType, type EntityType } from '@kong-ui/entities-plugins'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useDocsLink } from '@/composables/useDocsLink'

defineOptions({
  name: 'PluginList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink('plugin')
const route = useRoute()
const cacheIdentifier = computed(() => `plugins-${route.params?.id}`)
const entityType = computed(() => route.meta?.scopedIn as EntityType)
const scopedQuery = computed(() => {
  switch (entityType.value) {
    case 'services':
      return { entity_type: 'service_id', entity_id: route.params?.id }
    case 'routes':
      return { entity_type: 'route_id', entity_id: route.params?.id }
    case 'consumers':
      return { entity_type: 'consumer_id', entity_id: route.params?.id }
    default:
      return {}
  }
})

const createRoute = computed(() => {
  return {
    name: 'plugin-select',
    query: {
      ...scopedQuery.value,
      ...createRedirectRouteQuery(),
    },
  }
})

const getScopedEntityViewRoute = (type: ViewRouteType, id: string): RouteLocationRaw => {
  return {
    name: `${type}-detail`,
    params: {
      id,
    },
  }
}

const getViewRoute = (plugin: Pick<EntityRow, 'id' | 'name'>) => {
  return {
    name: 'plugin-detail',
    params: {
      id: plugin.id,
      pluginType: plugin.name,
    },
    query: {
      ...scopedQuery.value,
      ...createRedirectRouteQuery(),
    },
  }
}

const getEditRoute = (plugin: EntityRow) => ({
  name: 'plugin-edit',
  params: {
    id: plugin.id,
    pluginType: plugin.name,
  },
  query: {
    ...scopedQuery.value,
    ...createRedirectRouteQuery(),
  },
})

const filterSchema: FilterSchema = {
  name: {
    type: 'text',
  },
  enabled: {
    type: 'select',
    values: ['true', 'false'],
  },
  instanceName: {
    type: 'text',
  },
}

const pluginListConfig = reactive({
  ...useListGeneralConfig(),
  entityType,
  entityId: route.params?.id as string,
  createRoute,
  getViewRoute,
  getEditRoute,
  getScopedEntityViewRoute,
  getConfigureDynamicOrderingRoute: getViewRoute,
  filterSchema,
})

const canCreate = async () => true

const canDelete = async () => true

const canEdit = async () => true

// konnect has a special tag for this permission
// set to always true since Kong Manager doesn't have such limitation
// `@kong-ui/entites-plugins` will check `canEdit` internally so we don't need to check it here
const canToggle = async () => true

const canRetrieve = async () => true

const canRetrieveScopedEntity = async () => true

const { onCopySuccess, onCopyError } = useCopyEventHandlers()

const onDeleteSuccess = (entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.plugin.deleted', {
      name: entity.instance_name ?? entity.name,
    }),
  })
}

const onToggleEnabled = (isEnabled: boolean, entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t(isEnabled ? 'entities.plugin.enabled' : 'entities.plugin.disabled', {
      name: entity.instance_name ?? entity.name,
    }),
  })
}
</script>
