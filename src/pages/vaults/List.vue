<template>
  <PageHeader :title="t('entities.vault.list.title')">
    <template #below-title>
      <SupportText>
        {{ t('entities.vault.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <VaultList
    cache-identifier="vaults"
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
import { VaultList, type EntityRow } from '@kong-ui-public/entities-vaults'
import type { FilterSchema } from '@kong-ui-public/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'

defineOptions({
  name: 'VaultList',
})

const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.Vault)

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
