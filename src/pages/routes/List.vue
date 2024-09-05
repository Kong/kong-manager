<template>
  <PageHeader
    v-if="!serviceId"
    :title="t('entities.route.list.title')"
  >
    <template #below-title>
      <SupportText>
        {{ t('entities.route.description') }}
        <KExternalLink :href="docsLink">
          {{ t('global.learn.more') }}
        </KExternalLink>
      </SupportText>
    </template>
  </PageHeader>
  <RouteList
    :cache-identifier="cacheIdentifier"
    :config="routeListConfig"
    :can-create="canCreate"
    :can-delete="canDelete"
    :can-edit="canEdit"
    :can-retrieve="canRetrieve"
    :has-expression-column="supportExpressions"
    @copy:success="onCopySuccess"
    @copy:error="onCopyError"
    @delete:success="onDeleteSuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { RouteList, type EntityRow } from '@kong-ui-public/entities-routes'
import type { FilterSchema } from '@kong-ui-public/entities-shared'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useDocsLink } from '@/composables/useDocsLink'
import { EntityType } from '@/types'
import { useInfoStore } from '@/stores/info'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'RouteList' })

const toaster = useToaster()
const route = useRoute()
const { t } = useI18n()
const docsLink = useDocsLink(EntityType.Route)
const { createRedirectRouteQuery } = useListRedirect()

const infoStore = useInfoStore()
const { infoConfig } = storeToRefs(infoStore)
const supportExpressions = computed(() => infoConfig.value.router_flavor === 'expressions')

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
    query: serviceId.value ? {
      serviceId: serviceId.value,
      ...createRedirectRouteQuery(),
    } : {},
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
  query: serviceId.value ? {
    serviceId: serviceId.value,
    ...createRedirectRouteQuery(),
  } : {},
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
