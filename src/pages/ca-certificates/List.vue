<template>
  <PageHeader :title="t('entities.ca-certificate.list.title')">
    <template #below-title>
      <SupportText>
        {{ t('entities.ca-certificate.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <CACertificateList
    cache-identifier="ca_certificates"
    :config="caCertificateListConfig"
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
import { CACertificateList, type EntityRow } from '@kong-ui-public/entities-certificates'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useToaster } from '@/composables/useToaster'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'

defineOptions({
  name: 'CACertificateList',
})

const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.CACertificate)

const createRoute = computed(() => {
  return { name: 'ca-certificate-create' }
})

const getViewRoute = (id: string) => {
  return { name: 'ca-certificate-detail', params: { id } }
}

const getEditRoute = (id: string) => ({
  name: 'ca-certificate-edit',
  params: { id },
})

const caCertificateListConfig = reactive({
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
    message: t('entities.ca-certificate.deleted', { id: entity.id }),
  })
}
</script>
