<template>
  <KButton
    data-testid="header-back-button"
    appearance="tertiary"
    @click="back"
  >
    {{ t('global.buttons.back') }}
  </KButton>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'

import { useI18n } from '@/composables/useI18n'
import { useURLFromRouteQuery } from '@/composables/useRedirect'

const props = defineProps({
  entity: {
    type: String,
    required: true,
    default: '',
  },
})

const { t } = useI18n()
const router = useRouter()
const redirectURL = useURLFromRouteQuery('redirect')

const back = () => {
  let backTo: RouteLocationRaw = {
    name: props.entity ? `${props.entity}-list` : 'overview',
  }

  if (redirectURL.value) {
    backTo = redirectURL.value
  }

  router.replace(backTo)
}
</script>
