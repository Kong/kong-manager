<template>
  <PageHeader :title="t('entities.upstream.list.title')">
    <template #below-title>
      <SupportText>
        {{ t('entities.upstream.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <UpstreamsList
    cache-identifier="upstreams"
    :config="upstreamListConfig"
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
import { computed, reactive } from 'vue'
import { UpstreamsList, type EntityRow } from '@kong-ui-public/entities-upstreams-targets'
import type { FilterSchema } from '@kong-ui-public/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'

defineOptions({
  name: 'UpstreamList',
})

const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.Upstream)

const createRoute = computed(() => {
  return { name: 'upstream-create' }
})

const getViewRoute = (id: string) => {
  return { name: 'upstream-detail', params: { id } }
}

const getEditRoute = (id: string) => ({
  name: 'upstream-edit',
  params: {
    id,
  },
})

const filterSchema: FilterSchema = {
  name: {
    type: 'text',
  },
  slots: {
    type: 'number',
  },
}

const upstreamListConfig = reactive({
  ...useListGeneralConfig(),
  createRoute,
  getViewRoute,
  getEditRoute,
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
    message: t('entities.upstream.deleted', {
      name: entity.name ?? entity.id,
    }),
  })
}
</script>
