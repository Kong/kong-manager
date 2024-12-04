<template>
  <PageHeader :title="t('entities.service.list.title')">
    <template #below-title>
      <SupportText>
        {{ t('entities.service.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <GatewayServiceList
    cache-identifier="services"
    :config="serviceListConfig"
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
import { GatewayServiceList, type EntityRow } from '@kong-ui-public/entities-gateway-services'
import type { FilterSchema } from '@kong-ui-public/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'

defineOptions({
  name: 'ServiceList',
})

const toaster = useToaster()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.GatewayService)

const createRoute = computed(() => {
  return { name: 'service-create' }
})

const getViewRoute = (id: string) => {
  return { name: 'service-detail', params: { id } }
}

const getEditRoute = (id: string) => ({
  name: 'service-edit',
  params: {
    id,
  },
})

const filterSchema: FilterSchema = {
  name: {
    type: 'text',
  },
  protocol: {
    type: 'select',
    values: ['tcp', 'tls', 'udp', 'grpc', 'grpcs', 'http', 'https', 'ws', 'wss'],
  },
  host: {
    type: 'text',
  },
  port: {
    type: 'number',
  },
  path: {
    type: 'text',
  },
  enabled: {
    type: 'select',
    values: ['true', 'false'],
  },
}

const serviceListConfig = reactive({
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
    message: t('entities.service.deleted', {
      name: entity.name ?? entity.id,
    }),
  })
}
</script>
