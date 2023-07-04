<template>
  <PageHeader :title="t('entities.sni.listTitle')" />
  <SniList
    :config="sniListConfig"
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
import { useI18n } from '@/composables/useI18n'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useToaster } from '@/composables/useToaster'
import PageHeader from '@/components/PageHeader.vue'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { SniList, type EntityRow } from '@kong-ui/entities-snis'
import { computed, reactive } from 'vue'

defineOptions({
  name: 'SniList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()

const createRoute = computed(() => {
  return { name: 'sni-create' }
})

// stub: SNIs do not have detail pages
const getViewRoute = (_: string) => ({})

const getEditRoute = (id: string) => ({
  name: 'sni-edit',
  params: { id },
  query: createRedirectRouteQuery(),
})

const filterSchema: FilterSchema = {
  name: { type: 'text' },
}

const sniListConfig = reactive({
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
    message: t('entities.sni.deleted', { name: entity.name }),
  })
}
</script>
