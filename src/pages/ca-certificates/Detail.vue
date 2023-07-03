<template>
  <CACertificateConfigCard
    :config="caCertificateDetailConfig"
    @copy:success="onCopySuccess"
  />
</template>

<script setup lang="ts">
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useI18n } from '@/composables/useI18n'
import { CACertificateConfigCard } from '@kong-ui/entities-certificates'
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({
  name: 'CACertificateDetail',
})

const route = useRoute()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')

const caCertificateDetailConfig = reactive({
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
