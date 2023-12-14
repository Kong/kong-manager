<template>
  <PluginSelect
    :config="config"
    available-on-server
  />
</template>

<script setup lang="ts">
import { computed, reactive, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { PluginSelect } from '@kong-ui-public/entities-plugins'
import { useBaseGeneralConfig } from '@/composables/useBaseGeneralConfig'

defineOptions({
  name: 'PluginSelect',
})

const route = useRoute()

const entityType = computed(() => {
  const entityTypeInRoute = route.query.entity_type ?? ''

  switch (entityTypeInRoute) {
    case 'service_id':
      return 'services'
    case 'route_id':
      return 'routes'
    case 'consumer_id':
      return 'consumers'
    case 'consumer_group_id':
      return 'consumer_groups'
    default:
      return undefined
  }
})

const entityId = computed(() => (route.query.entity_id ?? '') as string)

const config = reactive({
  ...toRefs(useBaseGeneralConfig()),
  entityType,
  entityId,
  getCreateRoute: (plugin: string) => ({
    name: 'plugin-create',
    params: {
      pluginType: plugin,
    },
    query: route.query,
  }),
})
</script>
