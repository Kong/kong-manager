<template>
  <PageHeader :title="t('entities.key-set.detail.title', { name: titleName })">
    <HeaderBackButton entity="key-set" />
    <HeaderEditButton
      class="ml-4"
      entity="key-set"
    />
  </PageHeader>
  <KTabs
    :model-value="initialHash"
    :tabs="tabs"
    @changed="onTabChange"
  >
    <template #configuration>
      <KeySetConfigCard
        :config="keySetDetailConfig"
        @fetch:success="onFetchSuccess"
        @copy:success="onCopySuccess"
      />
    </template>
    <template #keys>
      <router-view />
    </template>
  </KTabs>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { KeySetConfigCard } from '@kong-ui-public/entities-key-sets'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'
import { useAxios } from '@/composables/useAxios'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'

defineOptions({
  name: 'KeySetDetail',
})

const { kongponentTabs: tabs, initialHash, onTabChange } = useTabs([
  {
    title: 'Configuration',
    route: { name: 'key-set-detail' },
  },
  {
    title: 'Keys',
    route: { name: 'key-set-detail-keys' },
  },
])
const route = useRoute()
const { t } = useI18n()
const { axiosInstance } = useAxios()
const adminApiUrl = useAdminApiUrl()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const keySetDetailConfig = reactive({
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

onMounted(async () => {
  // If the page is not loaded from the configuration tab, we need to fetch the key set name
  if (route.name !== 'key-set-detail') {
    const { data } = await axiosInstance.get(`${adminApiUrl}/key-sets/${id.value}`)

    titleName.value = data.name ?? data.id
  }
})
</script>
