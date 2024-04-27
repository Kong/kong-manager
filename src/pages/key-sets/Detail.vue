<template>
  <PageHeader :title="t('entities.key-set.detail.title', { name: titleName })">
    <HeaderBackButton entity="key-set" />
    <HeaderEditButton
      class="button-edit"
      entity="key-set"
    />
  </PageHeader>
  <KTabs
    :model-value="initialHash"
    :tabs="tabs"
    @change="onTabChange"
  >
    <template #configuration>
      <KeySetConfigCard
        :config="keySetDetailConfig"
        @fetch:success="onFetchSuccess"
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
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'
import { apiService } from '@/services/apiService'

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

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const keySetDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const onFetchSuccess = (entity) => {
  titleName.value = entity.name ?? entity.id
}

onMounted(async () => {
  // If the page is not loaded from the configuration tab, we need to fetch the key set name
  if (route.name !== 'key-set-detail') {
    const { data } = await apiService.findRecord<{ name: string, id: string }>(
      'key-sets',
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
