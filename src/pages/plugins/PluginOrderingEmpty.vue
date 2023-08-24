<template>
  <section class="plugin-ordering-empty">
    <h3 class="plugin-ordering-empty-title">
      {{ t('entities.plugin.empty.ordering.title') }}
    </h3>
    <p class="plugin-ordering-empty-desc">
      {{ t('entities.plugin.empty.ordering.cta.text') }}
    </p>
    <KTooltip
      v-if="disabled"
      :label="t('entities.plugin.ordering.disabled')"
    >
      <KButton
        appearance="primary"
        class="plugin-ordering-empty-button"
        disabled
      >
        {{ t('entities.plugin.empty.ordering.cta.button') }}
      </KButton>
    </KTooltip>
    <KButton
      v-else
      appearance="primary"
      class="plugin-ordering-empty-button"
      @click="handleClick"
    >
      {{ t('entities.plugin.empty.ordering.cta.button') }}
    </KButton>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const handleClick = () => {
  router.push({
    name: 'plugin-ordering-update',
    params: { ...route.params },
    query: { ...route.query },
  })
}
</script>

<style scoped lang="scss">
.plugin-ordering-empty {
  margin-top: 8px;
  text-align: center;
}

.plugin-ordering-empty-title {
  margin: 42px 0 0;
  font-size: 20px;
  line-height: 24px;
  color: $kui-color-text;
}

.plugin-ordering-empty-desc {
  margin: 14px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: $kui-color-text-neutral-stronger;
}

.plugin-ordering-empty-button {
  margin-top: 14px;
}
</style>
