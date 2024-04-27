<template>
  <PageHeader :title="t('entities.consumer.detail.title', { name: titleName })">
    <HeaderBackButton entity="consumer" />
    <HeaderEditButton
      class="button-edit"
      entity="consumer"
    />
  </PageHeader>
  <KTabs
    :model-value="initialHash"
    :tabs="tabs"
    @change="onTabChange"
  >
    <template #configuration>
      <ConsumerConfigCard
        :config="consumerDetailConfig"
        @fetch:success="onFetchSuccess"
      />
    </template>
    <template #credentials>
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
import { ConsumerConfigCard } from '@kong-ui-public/entities-consumers'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'
import { apiService } from '@/services/apiService'

defineOptions({
  name: 'ConsumerDetail',
})

const { kongponentTabs: tabs, initialHash, onTabChange } = useTabs([
  {
    title: 'Configuration',
    route: { name: 'consumer-detail' },
  },
  {
    title: 'Credentials',
    route: { name: 'consumer-detail-credentials' },
  },
  {
    title: 'Plugins',
    route: { name: 'consumer-detail-plugins' },
  },
])

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const consumerDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const onFetchSuccess = (entity) => {
  titleName.value = entity.username ?? entity.custom_id
}

onMounted(async () => {
  // If the page is not loaded from the configuration tab, we need to fetch the consumer username
  if (route.name !== 'consumer-detail') {
    const { data } = await apiService.findRecord<{ username: string, custom_id: string }>(
      'consumers',
      id.value,
    )

    titleName.value = data.username ?? data.custom_id
  }
})
</script>

<style lang="scss" scoped>
.button-edit {
  margin-left: $kui-space-60;
}
</style>
