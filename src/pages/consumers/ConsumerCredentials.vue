<template>
  <CredentialList
    v-for="plugin in credentialPlugins"
    :key="plugin.pluginType"
    :enabled="enabledPlugins.includes(plugin.pluginType)"
    :title="plugin.title"
    :plugin-type="plugin.pluginType"
  />
  <KEmptyState
    v-if="enabledPluginsFetched && !hasEnabledPlugins"
    :action-button-text="t('entities.consumer-credential.empty.button')"
    @click-action="navigateToPluginSelection"
  >
    <template #title>
      {{ t('entities.consumer-credential.empty.title') }}
    </template>
    <template #default>
      {{ t('entities.consumer-credential.empty.message', {
        plugins: credentialPlugins.map(p => p.title).join(', '),
      }) }}
    </template>
  </KEmptyState>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { pluginMeta } from '@/pages/plugins/PluginMeta'
import { useI18n } from '@/composables/useI18n'
import { useInfoStore } from '@/stores/info'
import CredentialList from './CredentialList.vue'
import { useListRedirect } from '@/composables/useListRedirect'

const router = useRouter()
const { t } = useI18n()
const infoStore = useInfoStore()
const { createRedirectRouteQuery } = useListRedirect()

const enabledPlugins = computed(() => infoStore.plugins.enabledInCluster)
const enabledPluginsFetched = ref(false)

const credentialPlugins = [
  'acl',
  'basic-auth',
  'hmac-auth',
  'jwt',
  'key-auth',
  ...(infoStore.kongEdition === 'community' ? [] : ['key-auth-enc']),
  'oauth2',
]
  .filter(plugin => !!pluginMeta[plugin])
  .map(plugin => ({
    title: pluginMeta[plugin].name,
    pluginType: plugin,
  }))

const hasEnabledPlugins = computed(() => credentialPlugins.some(({ pluginType }) => enabledPlugins.value.includes(pluginType)))

const navigateToPluginSelection = () => {
  router.push({
    name: 'plugin-select',
    query: createRedirectRouteQuery(),
  })
}

onBeforeMount(async () => {
  // forcely refresh info data to get enabled plugins
  await infoStore.getInfo({ force: true })
  enabledPluginsFetched.value = true
})
</script>
