<template>
  <PageHeader :title="t('entities.route.detail.title', { name: titleName })">
    <HeaderBackButton entity="route" />
    <HeaderEditButton
      class="ml-4"
      entity="route"
      :route-options="{ query: { serviceId } }"
    />
  </PageHeader>
  <KTabs
    :model-value="initialHash"
    :tabs="tabs"
    @changed="onTabChange"
  >
    <template #configuration>
      <RouteConfigCard
        :config="routeDetailConfig"
        :service-id="serviceId"
        @navigation-click="onNavigationClick"
        @fetch:success="onFetchSuccess"
        @copy:success="onCopySuccess"
      />
    </template>
    <template #plugins>
      <router-view />
    </template>
  </KTabs>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouteConfigCard } from '@kong-ui-public/entities-routes'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'
import { useAxios } from '@/composables/useAxios'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'
import { useListRedirect } from '@/composables/useListRedirect'

defineOptions({
  name: 'RouteDetail',
})

const { kongponentTabs: tabs, initialHash, onTabChange } = useTabs([
  {
    title: 'Configuration',
    route: { name: 'route-detail' },
  },
  {
    title: 'Plugins',
    route: { name: 'route-detail-plugins' },
  },
])

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { axiosInstance } = useAxios()
const adminApiUrl = useAdminApiUrl()
const { createRedirectRouteQuery } = useListRedirect()

const id = computed(() => (route.params.id as string) ?? '')
const serviceId = computed(() => (route.query.serviceId as string) ?? '')

const titleName = ref<string>('')

const routeDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const { onCopySuccess: openToaster } = useCopyEventHandlers()

const onCopySuccess = () => {
  openToaster({
    message: t('global.copied'),
  })
}

const onFetchSuccess = (entity) => {
  titleName.value = entity.name ?? entity.id
}

const onNavigationClick = (id: string) => {
  router.push({
    name: 'service-detail',
    params: { id },
    query: createRedirectRouteQuery(),
  })
}

onMounted(async () => {
  // If the page is not loaded from the configuration tab, we need to fetch the route name
  if (route.name !== 'route-detail') {
    const { data } = await axiosInstance.get(`${adminApiUrl}/routes/${id.value}`)

    titleName.value = data.name ?? data.id
  }
})
</script>
