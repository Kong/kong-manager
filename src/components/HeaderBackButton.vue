<template>
  <KButton
    data-testid="header-back-button"
    :to="backPath"
  >
    {{ t('global.buttons.back') }}
  </KButton>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  entity: {
    type: String,
    required: true,
    default: '',
  },
})

const route = useRoute()
const { t } = useI18n()

const backPath = computed(() => {
  const { query } = route
  if (query?.redirect) {
    return {
      path: query.redirect,
    }
  }

  return {
    name: props.entity ? `${props.entity}-list` : 'overview',
  }
})
</script>
