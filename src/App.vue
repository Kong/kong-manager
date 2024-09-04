<template>
  <AppLayout
    :sidebar-top-items="sidebarItems"
  >
    <template #navbar-right>
      <GithubStar url="https://github.com/kong/kong" />
    </template>
    <template #sidebar-header>
      <NavbarLogo />
    </template>
    <router-view />
    <MakeAWish />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { AppLayout, type SidebarPrimaryItem } from '@kong-ui-public/app-layout'
import { GithubStar } from '@kong-ui-public/misc-widgets'
import { useInfoStore } from '@/stores/info'
import NavbarLogo from '@/components/NavbarLogo.vue'
import MakeAWish from '@/components/MakeAWish.vue'

const route = useRoute()
const infoStore = useInfoStore()
const { isHybridMode } = storeToRefs(infoStore)

const sidebarItems = computed<Array<SidebarPrimaryItem>>(() => [
  {
    name: 'Overview',
    to: { name: 'overview' },
    key: 'Overview',
    active: route.name === 'overview',
  },
  {
    name: 'Gateway Services',
    to: { name: 'service-list' },
    key: 'Gateway Services',
    active: route.meta?.entity === 'service',
  },
  {
    name: 'Routes',
    to: { name: 'route-list' },
    key: 'Routes',
    active: route.meta?.entity === 'route',
  },
  {
    name: 'Consumers',
    to: { name: 'consumer-list' },
    key: 'Consumers',
    active: route.meta?.entity === 'consumer',
  },
  {
    name: 'Plugins',
    to: { name: 'plugin-list' },
    key: 'Plugins',
    active: route.meta?.entity === 'plugin',
  },
  {
    name: 'Upstreams',
    to: { name: 'upstream-list' },
    key: 'Upstreams',
    active: route.meta?.entity === 'upstream',
  },
  {
    name: 'Certificates',
    to: { name: 'certificate-list' },
    key: 'Certificates',
    active: route.meta?.entity === 'certificate',
  },
  {
    name: 'CA Certificates',
    to: { name: 'ca-certificate-list' },
    key: 'CA Certificates',
    active: route.meta?.entity === 'ca-certificate',
  },
  {
    name: 'SNIs',
    to: { name: 'sni-list' },
    key: 'SNIs',
    active: route.meta?.entity === 'sni',
  },
  {
    name: 'Vaults',
    to: { name: 'vault-list' },
    key: 'Vaults',
    active: route.meta?.entity === 'vault',
  },
  {
    name: 'Keys',
    to: { name: 'key-list' },
    key: 'Keys',
    active: route.meta?.entity === 'key',
  },
  {
    name: 'Key Sets',
    to: { name: 'key-set-list' },
    key: 'Key Sets',
    active: route.meta?.entity === 'key-set',
  },
  ...(
    isHybridMode.value
      ? [
        // {
        //   name: 'Data Plane Nodes',
        //   to: { name: 'data-plane-nodes' },
        //   key: 'Data Plane Nodes',
        //   active: route.meta?.entity === 'data-plane-node',
        // },
      ]
      : []
  ),
])
</script>

<style scoped lang="scss">
.app-title {
  color: #fff;
  margin: 0;
  font-size: 20px;
}

:deep(.kong-ui-app-layout-content-inner) {
  position: relative;
  min-height: 100%;
  padding: 32px 40px 80px !important;
}

:deep(.json-content.k-code-block) {
  border-top-left-radius: $kui-border-radius-0 !important;
  border-top-right-radius: $kui-border-radius-0 !important;
}
</style>
