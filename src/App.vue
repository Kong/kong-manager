<template>
  <AppLayout>
    <template #navbar-left>
      <h2 class="app-title">
        Kong Canopy
      </h2>
    </template>
    <router-view />
  </AppLayout>
</template>

<script setup lang="ts">
import { AppLayout } from '@kong-ui-public/app-layout'
import '@kong-ui-public/app-layout/dist/style.css'
</script>

<style scoped lang="scss">
.app-title {
  color: #fff;
  margin: 0;
}
</style>
