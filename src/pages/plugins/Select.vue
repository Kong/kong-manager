<template>
  <PluginSelect
    :config="config"
    available-on-server
    @plugin-clicked="handlePluginClick"
  />
</template>

<script setup lang="ts">
import { computed, reactive, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PluginSelect, type PluginType } from '@kong-ui-public/entities-plugins'
import { useBaseGeneralConfig } from '@/composables/useBaseGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'

defineOptions({
  name: 'PluginSelect',
})

const { createRedirectRouteQuery } = useListRedirect()
const router = useRouter()
const route = useRoute()

const entityScope = computed(() => {
  if (route.query.serviceId) {
    return {
      id: route.query.serviceId as string,
      typeLiteral: 'services',
    } as const
  } else if (route.query.routeId) {
    return {
      id: route.query.routeId as string,
      typeLiteral: 'routes',
    } as const
  } else if (route.query.consumerId) {
    return {
      id: route.query.consumerId as string,
      typeLiteral: 'consumers',
    } as const
  }

  return null
})

const config = reactive({
  ...toRefs(useBaseGeneralConfig()),
  entityType: computed(() => entityScope.value?.typeLiteral),
  entityId: computed(() => entityScope.value?.id),
  enableStreamingPlugins: true,
  createCustomRoute: { name: 'asset-create', query: createRedirectRouteQuery('/plugins/select') },
  getCreateRoute: (plugin: string) => ({
    name: 'plugin-create',
    params: {
      pluginType: plugin,
    },
    query: route.query,
  }),
})

const handlePluginClick = (plugin: PluginType) => {
  if (plugin.id === 'custom-plugin-create') {
    return
  }

  router.push({
    name: 'plugin-create',
    params: { pluginType: plugin.id },
    query: { assetId: plugin.assetId },
  })
}
</script>
