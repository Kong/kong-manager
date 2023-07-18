<template>
  <PageHeader :title="t('entities.consumer.detail.title', { name: titleName })">
    <HeaderBackButton entity="consumer" />
    <HeaderEditButton
      class="ml-4"
      entity="consumer"
    />
  </PageHeader>
  <KTabs
    :model-value="initialHash"
    :tabs="tabs"
    @changed="onTabChange"
  >
    <template #configuration>
      <ConsumerConfigCard
        :config="consumerDetailConfig"
        @fetch:success="onFetchSuccess"
        @copy:success="onCopySuccess"
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
import { ConsumerConfigCard } from '@kong-ui/entities-consumers'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'
import { useAxios } from '@/composables/useAxios'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'

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
const { axiosInstance } = useAxios()
const adminApiUrl = useAdminApiUrl()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const consumerDetailConfig = reactive({
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
  titleName.value = entity.username ?? entity.custom_id
}

onMounted(async () => {
  // If the page is not loaded from the configuration tab, we need to fetch the consumer username
  if (route.name !== 'consumer-detail') {
    const { data } = await axiosInstance.get(`${adminApiUrl}/consumers/${id.value}`)

    titleName.value = data.username ?? data.custom_id
  }
})
</script>
