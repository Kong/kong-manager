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
      class="ml-4"
      entity="plugin"
    />
  </PageHeader>
  <PluginConfigCard
    :config="pluginDetailConfig"
    :entity-type="entityType"
    :entity-id="entityId"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { PluginConfigCard, PluginIcon } from '@kong-ui/entities-plugins'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'
import { pluginMeta } from '@/pages/plugins/PluginMeta'

defineOptions({
  name: 'PluginDetail',
})

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const pluginType = computed(() => (route.params.pluginType ?? '') as string)
const entityType = computed(() => route.query?.entity_type)
const entityId = computed(() => route.query?.entity_id)

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
</style>
