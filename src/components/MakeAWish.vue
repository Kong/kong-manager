<template>
  <footer class="make-wish-wrapper">
    <KTooltip :text="t('wish.tooltip')">
      <a :href="mailToUrl">
        <img
          src="@/assets/icon-stardust.svg?external"
          alt=""
        >
        {{ t('wish.text') }}
      </a>
    </KTooltip>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'
import { useInfoStore } from '@/stores/info'

const route = useRoute()
const { t } = useI18n()
const infoStore = useInfoStore()

const mailToUrl = computed(() => `mailto:wish@konghq.com?subject=${t('wish.subject', { title: `${route.meta.title} | Kong Manager OSS@${infoStore.kongVersion}` })}`)
</script>

<style scoped lang="scss">
.make-wish-wrapper {
  text-align: center;
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;

  :deep(.popover-trigger-wrapper) {
    display: block !important;
  }

  a {
    display: inline-flex;
    color: #000000;
    text-decoration: none;
    opacity: 0.5;
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    transition: 0.3s;
  }

  a:hover {
    text-decoration: none;
    opacity: 0.75;
    border-bottom: 1px solid rgba(0, 0, 0, 0.75);
  }

  img {
    padding-right: 10px;
  }
}
</style>
