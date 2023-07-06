<template>
  <PageHeader :title="t('entities.plugin.list.title')" />
  <PluginList
    :config="pluginListConfig"
    :can-create="canCreate"
    :can-delete="canDelete"
    :can-edit="canEdit"
    :can-toggle="canToggle"
    :can-retrieve="canRetrieve"
    :can-retrieve-scoped-entity="canRetrieveScopedEntity"
    :can-configure-dynamic-ordering="canConfigureDynamicOrdering"
    @copy:success="onCopySuccess"
    @copy:error="onCopyError"
    @delete:success="onDeleteSuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { PluginList, type EntityRow, type ViewRouteType } from '@kong-ui/entities-plugins'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'PluginList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()

const createRoute = computed(() => {
  return { name: 'plugin-select' }
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
  }
}

const getEditRoute = (plugin: EntityRow) => ({
  name: 'plugin-edit',
  params: {
    id: plugin.id,
    pluginType: plugin.name,
  },
  query: createRedirectRouteQuery(),
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
// set to always true since Canopy doesn't have such limitation
// `@kong-ui/entites-plugins` will check `canEdit` internally so we don't need to check it here
const canToggle = async () => true

const canRetrieve = async () => true

const canRetrieveScopedEntity = async () => true

// Kong OSS does not support dynamic ordering
const canConfigureDynamicOrdering = async () => false

const { onCopySuccess, onCopyError } = useCopyEventHandlers()

const onDeleteSuccess = (entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.plugin.deleted', {
      name: entity.instance_name ?? entity.name,
    }),
  })
}
</script>
