<template>
  <PageHeader :title="t('entities.upstream.listTitle')" />
  <UpstreamsList
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
import { UpstreamsList, type EntityRow } from '@kong-ui/entities-upstreams-targets'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import PageHeader from '@/components/PageHeader.vue'

defineOptions({
  name: 'UpstreamList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()

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
  query: createRedirectRouteQuery(),
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
