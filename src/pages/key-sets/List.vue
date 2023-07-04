<template>
  <KeySetList
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
import { KeySetList, type EntityRow } from '@kong-ui/entities-key-sets'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useToaster } from '@/composables/useToaster'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'KeySetList',
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
  return { name: 'key-set-create' }
})

const getViewRoute = computed(() => (id: string) => ({
  name: 'key-set-detail',
  params: {
    id,
  },
}))

const getEditRoute = computed(() => (id: string) => ({
  name: 'key-set-edit',
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
    message: t('entities.key-set.deleted', {
      name: entity.name ?? entity.id,
    }),
  })
}
</script>
