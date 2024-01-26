<template>
  <PageHeader :title="t('entities.asset.list.title')">
    <template #below-title>
      <SupportText>
        {{ t('entities.asset.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <AssetList
    :config="assetListConfig"
    :can-create="canCreate"
    :can-delete="canDelete"
    :can-edit="canEdit"
    :can-retrieve="canRetrieve"
    @copy:success="onCopySuccess"
    @copy:error="onCopyError"
    @delete:success="onDeleteSuccess"
  />
</template>

<script setup lang="ts">
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useDocsLink } from '@/composables/useDocsLink'
import { useI18n } from '@/composables/useI18n'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useToaster } from '@/composables/useToaster'
import { EntityType } from '@/types'
import { AssetList, type EntityRow } from '@kong-ui-public/entities-assets'
import type { FilterSchema } from '@kong-ui-public/entities-shared'
import { reactive } from 'vue'

defineOptions({
  name: 'AssetList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.SNI)

const filterSchema: FilterSchema = {
  name: { type: 'text' },
}

const assetListConfig = reactive({
  ...useListGeneralConfig(),
  createRoute: { name: 'asset-create' },
  getViewRoute: (id: string) => ({ name: 'asset-detail', params: { id } }),
  getEditRoute: (id: string) => ({
    name: 'asset-edit',
    params: { id },
    query: createRedirectRouteQuery(),
  }),
  getCreatePluginRoute: (id: string, pluginName: string) => ({
    name: 'plugin-create',
    params: { pluginType: pluginName },
    query: {
      assetId: id,
      ...createRedirectRouteQuery('/plugins'),
    },
  }),
  filterSchema,
})

const canCreate = async () => true

const canDelete = async () => true

const canEdit = async () => true

const canRetrieve = async () => true

const { onCopySuccess, onCopyError } = useCopyEventHandlers()

const onDeleteSuccess = (entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.asset.deleted', { name: entity.name }),
  })
}
</script>
