<template>
  <footer class="make-wish-wrapper">
    <a :href="mailToUrl">
      <img
        src="@/assets/icon-stardust.svg?external"
        alt=""
      >
      {{ t('wish.text') }}
    </a>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const route = useRoute()
const { t } = useI18n()

const mailToUrl = computed(() => `mailto:wish@konghq.com?subject=${t('wish.subject', { title: `${route.meta.title} | Kong Manager OSS` })}`)
</script>

<style scoped lang="scss">
.make-wish-wrapper {
  text-align: center;
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;

  a {
    display: inline-flex;
    color: #000000;
    text-decoration: none;
    opacity: 0.5;
  }

  a:hover {
    text-decoration: none;
    opacity: 0.75;
  }

  img {
    padding-right: 10px;
  }
}
</style>
