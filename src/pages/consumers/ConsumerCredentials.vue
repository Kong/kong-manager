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
    :handle-click="navigateToPluginSelection"
    :cta-text="t('entities.consumer-credential.empty.button')"
  >
    <template #title>
      {{ t('entities.consumer-credential.empty.title') }}
    </template>
    <template #message>
      {{ t('entities.consumer-credential.empty.message', {
        plugins: credentialPlugins.map(p => p.title).join(', '),
      }) }}
    </template>
  </KEmptyState>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useInfoStore } from '@/stores/info'
import { pluginMeta } from '@/pages/plugins/PluginMeta'
import { useAxios } from '@/composables/useAxios'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'
import { useI18n } from '@/composables/useI18n'
import CredentialList from './CredentialList.vue'

const router = useRouter()
const { axiosInstance } = useAxios()
const adminApiUrl = useAdminApiUrl()
const { t } = useI18n()
const infoStore = useInfoStore()

const enabledPlugins = ref<string[]>([])
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
    query: {
      redirect: router.currentRoute.value.fullPath,
    },
  })
}

onBeforeMount(async () => {
  const { data } = await axiosInstance.get(adminApiUrl)

  enabledPlugins.value = data?.plugins?.enabled_in_cluster ?? []
  enabledPluginsFetched.value = true
})
</script>
