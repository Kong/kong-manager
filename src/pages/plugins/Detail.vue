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
        query: entityScope ? {
          [entityScope.keyInQuery]: entityScope.id,
        } : undefined,
      }"
    />
  </PageHeader>
  <PluginConfigCard
    :config="pluginDetailConfig"
    :scoped-entity-type="entityScope?.typeLiteral"
    :scoped-entity-id="entityScope?.id"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { PluginConfigCard, PluginIcon } from '@kong-ui-public/entities-plugins'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { pluginMeta } from '@/pages/plugins/PluginMeta'

defineOptions({
  name: 'PluginDetail',
})

const route = useRoute()

const id = computed(() => (route.params.id as string) ?? '')
const pluginType = computed(() => (route.params.pluginType ?? '') as string)
const entityScope = computed(() => {
  if (route.query.serviceId) {
    return {
      id: route.query.serviceId as string,
      typeLiteral: 'services',
      keyInQuery: 'serviceId',
    }
  } else if (route.query.routeId) {
    return {
      id: route.query.routeId as string,
      typeLiteral: 'routes',
      keyInQuery: 'routeId',
    }
  } else if (route.query.consumerId) {
    return {
      id: route.query.consumerId as string,
      typeLiteral: 'consumers',
      keyInQuery: 'consumerId',
    }
  }

  return null
})

const pluginDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
  pluginType: pluginType.value,
})
</script>

<style scoped lang="scss">
.plugin-detail-icon {
  margin-right: 8px;
}

.button-edit {
  margin-left: $kui-space-60;
}
</style>
