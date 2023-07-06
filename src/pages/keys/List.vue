<template>
  <PageHeader :title="t('entities.key.list.title')" />
  <KeyList
    :config="keyListConfig"
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
import { KeyList, type EntityRow } from '@kong-ui/entities-keys'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useToaster } from '@/composables/useToaster'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'KeyList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()

const filterSchema = computed<FilterSchema>(() => {
  return {
    name: { type: 'text' },
  }
})

const createRoute = computed(() => {
  return { name: 'key-create' }
})

const getViewRoute = computed(() => (id: string) => ({
  name: 'key-detail',
  params: {
    id,
  },
}))

const getEditRoute = computed(() => (id: string) => ({
  name: 'key-edit',
  params: {
    id,
  },
  query: createRedirectRouteQuery(),
}))

const keyListConfig = reactive({
  ...useListGeneralConfig(),
  createRoute,
  getViewRoute,
  getEditRoute,
  filterSchema,
})

const canCreate = async () => true

const canRetrieve = async () => true

const canEdit = async () => true

const canDelete = async () => true

const { onCopySuccess, onCopyError } = useCopyEventHandlers()

const onDeleteSuccess = (entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.key.deleted', {
      name: entity.name ?? entity.id,
    }),
  })
}
</script>
