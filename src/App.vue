<template>
  <AppLayout
    :sidebar-top-items="sidebarItems"
  >
    <template #navbar-left>
      <h2 class="app-title">
        Kong Canopy
      </h2>
    </template>
    <template #sidebar-header>
      Canopy Logo
    </template>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppLayout, type SidebarPrimaryItem } from '@kong-ui-public/app-layout'
import { useRoute } from 'vue-router'
import '@kong-ui-public/app-layout/dist/style.css'

const route = useRoute()

const sidebarItems = computed<Array<SidebarPrimaryItem>>(() => [
  {
    name: 'Home',
    to: { name: 'home' },
    key: 'Home',
    active: route.name === 'home',
  },
  {
    name: 'Gateway Services',
    to: { name: 'service-list' },
    key: 'Gateway Services',
    active: route.meta?.entity === 'service',
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
])
</script>

<style scoped lang="scss">
.app-title {
  color: #fff;
  margin: 0;
  font-size: 20px;
}

:deep(main.kong-ui-app-layout-main) {
  background: #fff!important;
}
</style>
