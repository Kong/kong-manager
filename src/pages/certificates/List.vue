<template>
  <PageHeader :title="t('entities.certificate.list.title')">
    <template #below-title>
      <SupportText>
        {{ t('entities.certificate.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <CertificateList
    cache-identifier="certificates"
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
import { computed, reactive } from 'vue'
import { CertificateList, type EntityRow } from '@kong-ui-public/entities-certificates'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useToaster } from '@/composables/useToaster'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'

defineOptions({
  name: 'CertificateList',
})

const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.Certificate)

const createRoute = computed(() => {
  return { name: 'certificate-create' }
})

const getViewRoute = (id: string) => {
  return { name: 'certificate-detail', params: { id } }
}

const getEditRoute = (id: string) => ({
  name: 'certificate-edit',
  params: { id },
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
