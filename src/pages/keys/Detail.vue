<template>
  <KeyConfigCard
    :config="keyDetailConfig"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { KeyConfigCard } from '@kong-ui/entities-keys'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'KeyDetail',
})

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const keyDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const { onCopySuccess: openToaster } = useCopyEventHandlers()

const onCopySuccess = () => {
  openToaster({
    message: t('global.copied'),
  })
}

</script>
