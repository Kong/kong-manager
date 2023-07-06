<template>
  <PageHeader :title="t('entities.vault.list.title')" />
  <VaultList
    :config="vaultListConfig"
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
import { VaultList, type EntityRow } from '@kong-ui/entities-vaults'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'VaultList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()

const createRoute = computed(() => {
  return { name: 'vault-create' }
})

const getViewRoute = (id: string) => {
  return { name: 'vault-detail', params: { id } }
}

const getEditRoute = (id: string) => ({
  name: 'vault-edit',
  params: {
    id,
  },
  query: createRedirectRouteQuery(),
})

const filterSchema = computed<FilterSchema>(() => ({
  name: { type: 'text', searchable: true },
  prefix: { type: 'text', searchable: true },
}))

const vaultListConfig = reactive({
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
    message: t('entities.vault.deleted', {
      name: entity.name ?? entity.id,
    }),
  })
}
</script>