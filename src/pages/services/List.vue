<template>
  <GatewayServiceList
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
import { GatewayServiceList } from '@kong-ui/entities-gateway-services'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'ServiceList',
})

const { createRedirectRouteQuery } = useListRedirect()
const toaster = useToaster()
const { t } = useI18n()

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
  query: createRedirectRouteQuery(),
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

const canCreate = () => Promise.resolve(true)

const canDelete = () => Promise.resolve(true)

const canEdit = () => Promise.resolve(true)

const canRetrieve = () => Promise.resolve(true)

const { onCopySuccess, onCopyError } = useCopyEventHandlers()

const onDeleteSuccess = (entity: { name?: string, id: string }) => {
  toaster.open({
    appearance: 'success',
    message: t('entities.service.deleted', {
      name: entity.name ?? entity.id,
    }),
  })
}
</script>
