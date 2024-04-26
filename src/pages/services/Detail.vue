<template>
  <PageHeader :title="t('entities.service.detail.title', { name: titleName })">
    <HeaderBackButton entity="service" />
    <HeaderEditButton
      class="button-edit"
      entity="service"
    />
  </PageHeader>
  <KTabs
    :model-value="initialHash"
    :tabs="tabs"
    @change="onTabChange"
  >
    <template #configuration>
      <GatewayServiceConfigCard
        :config="serviceDetailConfig"
        @fetch:success="onFetchSuccess"
      />
    </template>
    <template #routes>
      <router-view />
    </template>
    <template #plugins>
      <router-view />
    </template>
  </KTabs>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { GatewayServiceConfigCard } from '@kong-ui-public/entities-gateway-services'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'
import { apiService } from '@/services/apiService'

defineOptions({
  name: 'ServiceDetail',
})

const { kongponentTabs: tabs, initialHash, onTabChange } = useTabs([
  {
    title: 'Configuration',
    route: { name: 'service-detail' },
  },
  {
    title: 'Routes',
    route: { name: 'service-detail-routes' },
  },
  {
    title: 'Plugins',
    route: { name: 'service-detail-plugins' },
  },
])

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const serviceDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const onFetchSuccess = (entity) => {
  titleName.value = entity.name ?? entity.id
}

onMounted(async () => {
  // If the page is not loaded from the configuration tab, we need to fetch the service name
  if (route.name !== 'service-detail') {
    const { data } = await apiService.findRecord<{ name: string, id: string }>(
      'services',
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
