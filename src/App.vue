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
    name: 'Gateway Service',
    to: { name: 'service-list' },
    key: 'Gateway Service',
    active: route.meta?.entity === 'service',
  },
  {
    name: 'Consumer',
    to: { name: 'consumer-list' },
    key: 'Consumer',
    active: route.meta?.entity === 'consumer',
  },
  {
    name: 'Plugin',
    to: { name: 'plugin-list' },
    key: 'Plugin',
    active: route.meta?.entity === 'plugin',
  },
  {
    name: 'Upstream',
    to: { name: 'upstream-list' },
    key: 'Upstream',
    active: route.meta?.entity === 'upstream',
  },
  {
    name: 'Certificate',
    to: { name: 'certificate-list' },
    key: 'Certificate',
    active: route.meta?.entity === 'certificate',
  },
  {
    name: 'CA Certificate',
    to: { name: 'ca-certificate-list' },
    key: 'CA Certificate',
    active: route.meta?.entity === 'ca-certificate',
  },
  {
    name: 'SNI',
    to: { name: 'sni-list' },
    key: 'SNI',
    active: route.meta?.entity === 'sni',
  },
  {
    name: 'Vault',
    to: { name: 'vault-list' },
    key: 'Vault',
    active: route.meta?.entity === 'vault',
  },
  {
    name: 'Key',
    to: { name: 'key-list' },
    key: 'Key',
    active: route.meta?.entity === 'key',
  },
  {
    name: 'Key Set',
    to: { name: 'key-set-list' },
    key: 'Key-Set',
    active: route.meta?.entity === 'key-set',
  },
])
</script>

<style scoped lang="scss">
.app-title {
  color: #fff;
  margin: 0;
}
</style>
