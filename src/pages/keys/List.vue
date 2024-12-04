<template>
  <PageHeader
    v-if="!keySetId"
    :title="t('entities.key.list.title')"
  >
    <template #below-title>
      <SupportText>
        {{ t('entities.key.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <KeyList
    :cache-identifier="cacheIdentifier"
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
import { useRoute } from 'vue-router'
import { KeyList, type EntityRow } from '@kong-ui-public/entities-keys'
import type { FilterSchema } from '@kong-ui-public/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useToaster } from '@/composables/useToaster'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'

defineOptions({
  name: 'KeyList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const route = useRoute()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.Key)

const keySetId = computed(() => (route.params?.id ?? '') as string)
const cacheIdentifier = computed(() => `keys-${keySetId.value}`)

const filterSchema = computed<FilterSchema>(() => {
  return {
    name: { type: 'text' },
  }
})

const createRoute = computed(() => {
  return {
    name: 'key-create',
    query: keySetId.value ? {
      keySetId: keySetId.value,
      ...createRedirectRouteQuery(),
    } : {},
  }
})

const getViewRoute = computed(() => (id: string) => ({
  name: 'key-detail',
  params: {
    id,
  },
  query: {
    keySetId: keySetId.value,
    ...createRedirectRouteQuery(),
  },
}))

const getEditRoute = computed(() => (id: string) => ({
  name: 'key-edit',
  params: {
    id,
  },
  query: keySetId.value ? {
    keySetId: keySetId.value,
    ...createRedirectRouteQuery(),
  } : {},
}))

const keyListConfig = reactive({
  ...useListGeneralConfig(),
  keySetId,
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
