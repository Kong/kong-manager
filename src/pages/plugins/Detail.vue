<template>
  <PageHeader hide-title>
    <template #title-logo>
      <PluginIcon
        :name="pluginType"
        :alt="pluginType"
        class="plugin-detail-icon"
        :size="50"
      />
      <span class="title">{{ pluginMeta[pluginType]?.name ?? pluginType }}</span>
    </template>
    <HeaderBackButton entity="plugin" />
    <HeaderEditButton
      class="button-edit"
      entity="plugin"
      :route-options="{
        query: {
          entity_type: route.query?.entity_type,
          entity_id: route.query?.entity_id,
        },
      }"
    />
  </PageHeader>
  <KTabs
    v-if="isOrderingSupported"
    :model-value="initialHash"
    :tabs="tabs"
    @changed="onTabChange"
  >
    <template #configuration>
      <PluginConfigCard
        :config="pluginDetailConfig"
        :scoped-entity-type="entityType"
        :scoped-entity-id="entityId"
        @copy:success="onCopySuccess"
      />
    </template>
    <template #ordering>
      <router-view />
    </template>
  </KTabs>
  <PluginConfigCard
    v-else
    :config="pluginDetailConfig"
    :scoped-entity-type="entityType"
    :scoped-entity-id="entityId"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { PluginConfigCard, PluginIcon } from '@kong-ui-public/entities-plugins'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useGatewayFeatureSupported } from '@/composables/useGatewayFeatureSupported'
import { useI18n } from '@/composables/useI18n'
import { useTabs } from '@/composables/useTabs'
import { pluginMeta } from '@/pages/plugins/PluginMeta'

defineOptions({
  name: 'PluginDetail',
})

// Plugin ordering is supported in Kong Gateway Enterprise 3.0
const isOrderingSupported = useGatewayFeatureSupported({
  enterprise: ['3.0'],
})
const { kongponentTabs: tabs, initialHash, onTabChange } = useTabs([
  {
    title: 'Configuration',
    route: { name: 'plugin-detail' },
  },
  {
    title: 'Ordering',
    route: { name: 'plugin-ordering' },
  },
])

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const pluginType = computed(() => (route.params.pluginType ?? '') as string)
const entityType = computed(() => {
  if (!route.query?.entity_type) {
    return undefined
  }

  return `${(route.query?.entity_type as string).split('_')[0]}s`
})
const entityId = computed(() => (route.query?.entity_id ?? '') as string)

const pluginDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
  pluginType: pluginType.value,
})

const { onCopySuccess: openToaster } = useCopyEventHandlers()

const onCopySuccess = () => {
  openToaster({
    message: t('global.copied'),
  })
}
</script>

<style scoped lang="scss">
.plugin-detail-icon {
  margin-right: 8px;
}

.button-edit {
  margin-left: $kui-space-60;
}
</style>
