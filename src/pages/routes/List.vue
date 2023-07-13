<template>
  <PageHeader
    v-if="!serviceId"
    :title="t('entities.route.list.title')"
  />
  <RouteList
    :cache-identifier="cacheIdentifier"
    :config="routeListConfig"
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
import { RouteList, type EntityRow } from '@kong-ui/entities-routes'
import type { FilterSchema } from '@kong-ui/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({ name: 'RouteList' })

const toaster = useToaster()
const route = useRoute()
const { t } = useI18n()
const { createRedirectRouteQuery } = useListRedirect()

const serviceId = computed(() => (route.params?.id ?? '') as string)
const cacheIdentifier = computed(() => `routes-${serviceId.value}`)

const filterSchema: FilterSchema = {
  name: {
    type: 'text',
  },
  protocols: {
    type: 'select',
    values: [
      'http', 'https',
      'tcp', 'tls', 'udp',
      'tls_passthrough',
      'grpc', 'grpcs',
    ],
  },
  methods: {
    type: 'text',
  },
  hosts: {
    type: 'text',
  },
  paths: {
    type: 'text',
  },
}

const createRoute = computed(() => {
  return {
    name: 'route-create',
    query: {
      serviceId: serviceId.value,
      ...createRedirectRouteQuery(),
    },
  }
})

const getViewRoute = (id: string) => ({
  name: 'route-detail',
  params: { id },
  query: {
    serviceId: serviceId.value,
    ...createRedirectRouteQuery(),
  },
})

const getEditRoute = (id: string) => ({
  name: 'route-edit',
  params: {
    id,
  },
  query: {
    serviceId: serviceId.value,
    ...createRedirectRouteQuery(),
  },
})

const routeListConfig = reactive({
  ...useListGeneralConfig(),
  serviceId,
  useExpression: false,
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
    message: t('entities.route.deleted', {
      name: entity.name ?? entity.id,
    }),
  })
}

</script>