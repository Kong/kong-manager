<template>
  <PageHeader :title="t('entities.upstream.detail.title', { name: titleName })">
    <HeaderBackButton entity="upstream" />
    <HeaderEditButton
      class="button-edit"
      entity="upstream"
    />
  </PageHeader>
  <KTabs
    :model-value="initialHash"
    :tabs="tabs"
    @change="onTabChange"
  >
    <template #configuration>
      <UpstreamsConfigCard
        :config="upstreamDetailConfig"
        @fetch:success="onFetchSuccess"
        @copy:success="onCopySuccess"
      />
    </template>
    <template #targets>
      <router-view />
    </template>
  </KTabs>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { UpstreamsConfigCard } from '@kong-ui-public/entities-upstreams-targets'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'

defineOptions({
  name: 'UpstreamDetail',
})

const { kongponentTabs: tabs, initialHash, onTabChange } = useTabs([
  {
    title: 'Configuration',
    route: { name: 'upstream-detail' },
  },
  {
    title: 'Targets',
    route: { name: 'upstream-detail-targets' },
  },
])

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const titleName = ref<string>('')

const upstreamDetailConfig = reactive({
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
</script>

<style lang="scss" scoped>
.button-edit {
  margin-left: $kui-space-60;
}
</style>
