<template>
  <PageHeader :title="t('entities.certificate.list.title')" />
  <CertificateList
    :config="certificateListConfig"
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
import { CertificateList, type EntityRow } from '@kong-ui/entities-certificates'
import { computed, reactive } from 'vue'

defineOptions({
  name: 'CertificateList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()

const createRoute = computed(() => {
  return { name: 'certificate-create' }
})

const getViewRoute = (id: string) => {
  return { name: 'certificate-detail', params: { id } }
}

const getEditRoute = (id: string) => ({
  name: 'certificate-edit',
  params: { id },
  query: createRedirectRouteQuery(),
})

const certificateListConfig = reactive({
  ...useListGeneralConfig(),
  isExactMatch: true,
  createRoute,
  getViewRoute,
  getEditRoute,
})

const canCreate = async () => true

const canDelete = async () => true

const canEdit = async () => true

const canRetrieve = async () => true

const { onCopySuccess, onCopyError } = useCopyEventHandlers()

const onDeleteSuccess = (entity: EntityRow) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.certificate.deleted', { id: entity.id }),
  })
}
</script>
