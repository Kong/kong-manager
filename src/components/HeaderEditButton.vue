<template>
  <KButton
    data-testid="header-edit-button"
    :to="editPath"
    appearance="primary"
  >
    {{ t('global.buttons.edit') }}
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
  routeOptions: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

const route = useRoute()
const { t } = useI18n()

const editPath = computed(() => {
  return {
    name: `${props.entity}-edit`,
    params: { id: route.params.id },
    ...props.routeOptions,
  }
})
</script>
