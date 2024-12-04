<template>
  <PageHeader :title="t('entities.sni.list.title')">
    <template #below-title>
      <SupportText>
        {{ t('entities.sni.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <SniList
    cache-identifier="snis"
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
import { computed, reactive } from 'vue'
import { SniList, type EntityRow } from '@kong-ui-public/entities-snis'
import type { FilterSchema } from '@kong-ui-public/entities-shared'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useToaster } from '@/composables/useToaster'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'

defineOptions({
  name: 'SniList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.SNI)

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
