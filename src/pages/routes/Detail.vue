<template>
  <PageHeader :title="t('entities.route.detail.title', { name: titleName })">
    <HeaderBackButton entity="route" />
    <HeaderEditButton
      class="button-edit"
      entity="route"
      :route-options="{ query: { serviceId } }"
    />
  </PageHeader>
  <KTabs
    :model-value="initialHash"
    :tabs="tabs"
    @change="onTabChange"
  >
    <template #configuration>
      <RouteConfigCard
        :config="routeDetailConfig"
        :service-id="serviceId"
        @navigation-click="onNavigationClick"
        @fetch:success="onFetchSuccess"
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
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'
import { useListRedirect } from '@/composables/useListRedirect'
import { apiService } from '@/services/apiService'

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
const { createRedirectRouteQuery } = useListRedirect()

const id = computed(() => (route.params.id as string) ?? '')
const serviceId = computed(() => (route.query.serviceId as string) ?? '')

const titleName = ref<string>('')

const routeDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

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
    const { data } = await apiService.findRecord<{ name: string, id: string }>(
      'routes',
      id.value,
    )

    titleName.value = data.name ?? data.id
  }
})
</script>

<style lang="scss" scoped>
.button-edit {
  margin-left: $kui-space-60;
}
</style>
