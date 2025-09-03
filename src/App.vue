<template>
  <AppLayout
    :sidebar-top-items="sidebarItems"
  >
    <template #sidebar-header>
      <NavbarLogo />
    </template>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { AppLayout, type SidebarPrimaryItem } from '@kong-ui-public/app-layout'
import { useInfoStore } from '@/stores/info'
import NavbarLogo from '@/components/NavbarLogo.vue'

const route = useRoute()
const infoStore = useInfoStore()
const { isHybridMode } = storeToRefs(infoStore)

const sidebarItems = computed<SidebarPrimaryItem[]>(() => [
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
  {
    name: 'Monitoring',
    to: '/monitoring/',
    key: 'Monitoring',
    active: route.path.startsWith('/monitoring'),
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
  margin: 50;
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

:deep(.kong-ui-app-sidebar), :deep(.kong-ui-app-navbar) {
  background-color: #CA3433 !important; // Use your preferred color
}

:deep(.sidebar-header:after), :deep(.sidebar-footer:before){
  background: none !important;
  box-shadow: none !important;
}
</style>
