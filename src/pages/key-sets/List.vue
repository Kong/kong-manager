<template>
  <PageHeader :title="t('entities.key-set.list.title')">
    <template #below-title>
      <SupportText>
        {{ t('entities.key-set.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <KeySetList
    cache-identifier="key_sets"
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
import { KeySetList, type EntityRow } from '@kong-ui-public/entities-key-sets'
import type { FilterSchema } from '@kong-ui-public/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useToaster } from '@/composables/useToaster'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'

defineOptions({
  name: 'KeySetList',
})

const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.KeySet)

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
